const {onRequest, onCall} = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");

// Initialiser Firebase Admin si nécessaire
try {
  admin.apps.length === 0 && admin.initializeApp();
} catch (e) {
  // noop
}

// Fonction de test pour vérifier que les fonctions sont actives
exports.healthCheck = onRequest(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  (request, response) => {
    logger.info("Health check appelé", { structuredData: true });
    
    response.status(200).json({
      success: true,
      message: "LumaPost Functions are running!",
      timestamp: new Date().toISOString(),
      region: 'europe-west1'
    });
  }
);

// Fonction pour publier immédiatement une vidéo
exports.publishVideoNow = onCall(
  {
    region: 'europe-west1',
    memory: '512MiB',
    timeoutSeconds: 300,
  },
  async (request) => {
    try {
      const { videoId, accountId, userId } = request.data;
      
      if (!videoId || !accountId || !userId) {
        throw new Error('Paramètres manquants');
      }

      logger.info(`Publication immédiate demandée pour videoId: ${videoId}`);
      
      // Pour l'instant, on retourne un succès simulé
      // La vraie logique de publication sera implémentée plus tard
      return {
        success: true,
        message: 'Publication simulée avec succès',
        videoId,
        accountId,
        userId
      };

    } catch (error) {
      logger.error('Erreur lors de la publication immédiate:', error);
      throw new Error(`Erreur lors de la publication: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
);

// Fonction planifiée qui vérifie les publications en attente toutes les minutes
exports.checkScheduledPosts = onSchedule(
  {
    schedule: 'every 1 minutes',
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (event) => {
    try {
      logger.info('Vérification des publications planifiées', { structuredData: true });
      const db = admin.firestore();
      const nowTs = admin.firestore.Timestamp.now();

      // Récupérer les schedules arrivés à échéance sans index composite requis
      const snap = await db.collection('schedules')
        .where('scheduledAt', '<=', nowTs)
        .orderBy('scheduledAt', 'asc')
        .limit(20)
        .get();

      if (snap.empty) {
        logger.info('Aucun post planifié à traiter');
        return;
      }

      // URL de l'app Next pour appeler l'endpoint /api/publish/now
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://luma-post.emplica.fr';

      // Traiter en série pour limiter la pression
      for (const doc of snap.docs) {
        const sched = doc.data();
        const scheduleId = doc.id;

        try {
          // Ignorer les posts non "scheduled"
          if (sched.status && sched.status !== 'scheduled') {
            continue;
          }
          // Marquer en file d'attente pour éviter le double traitement
          await doc.ref.update({ status: 'queued', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

          // Construire la requête de publication immédiate
          const body = {
            userId: sched.userId,
            caption: sched.caption || '',
            videoUrl: sched.videoUrl,
            thumbnailUrl: sched.thumbnailUrl || undefined,
            platforms: Array.isArray(sched.platforms) ? sched.platforms : [],
            mediaType: sched.mediaType || 'video',
            // Optionnel: vous pouvez stocker tiktokSettings dans le schedule si besoin
          };

          const res = await fetch(`${appUrl}/api/publish/now`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP ${res.status} ${errText}`);
          }

          const result = await res.json();
          const publishId = result.publishId || (result.post && result.post.publishId) || null;

          await doc.ref.update({
            publishId: publishId,
            status: 'queued',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          logger.info('Planification envoyée à TikTok (queued)', { scheduleId, publishId });
        } catch (procErr) {
          logger.error('Erreur traitement planification', { scheduleId, error: String(procErr) });
          await doc.ref.update({
            status: 'failed',
            lastError: String(procErr),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      logger.info('Vérification terminée');
    } catch (error) {
      logger.error('Erreur lors de la vérification des publications:', error);
    }
  }
);

// Callable pour programmer une tâche (compat avec /api/cloud-tasks)
exports.schedulePublishTask = onCall(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      const { scheduleId, scheduledAt } = request.data || {};
      if (!scheduleId) {
        throw new Error('scheduleId requis');
      }

      const db = admin.firestore();
      const ref = db.collection('schedules').doc(scheduleId);
      const ts = scheduledAt ? admin.firestore.Timestamp.fromDate(new Date(scheduledAt)) : admin.firestore.Timestamp.now();
      await ref.update({ scheduledAt: ts, status: 'scheduled', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

      return { success: true, scheduleId };
    } catch (e) {
      logger.error('Erreur schedulePublishTask:', e);
      throw e;
    }
  }
);

// Fonction pour traiter les nouvelles planifications (appelée manuellement)
exports.processSchedule = onCall(
  {
    region: 'europe-west1',
    memory: '256MiB',
    timeoutSeconds: 60,
  },
  async (request) => {
    try {
      const { scheduleId } = request.data;
      
      if (!scheduleId) {
        throw new Error('ScheduleId requis');
      }
      
      logger.info(`Traitement de la planification: ${scheduleId}`, { structuredData: true });
      
      // Ici on peut ajouter la logique pour traiter la planification
      
      return {
        success: true,
        message: `Planification ${scheduleId} traitée avec succès`,
        scheduleId
      };
      
    } catch (error) {
      logger.error('Erreur lors du traitement de la planification:', error);
      throw new Error(`Erreur lors du traitement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  }
);