import { NextRequest, NextResponse } from 'next/server';
import { scheduleService } from '@/lib/firestore';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log du webhook reçu
    console.log('Webhook TikTok reçu:', {
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: new Date().toISOString()
    });

    // Debug: afficher la structure complète du body
    console.log('🔍 Structure du body reçu:', JSON.stringify(body, null, 2));

    // Vérifier la signature TikTok (optionnel pour le développement)
    const signature = request.headers.get('x-tiktok-signature');
    if (!signature) {
    }

    // Extraire les données du webhook
    let publish_id, status, error_message, video_id, share_url, user_id;
    
    // TikTok envoie les données dans différents formats selon le type d'événement
    if (body.content && typeof body.content === 'string') {
      // Format inbox: content contient le JSON stringifié
      try {
        const contentData = JSON.parse(body.content);
        publish_id = contentData.publish_id;
        status = contentData.status || 'PROCESSING'; // Par défaut pour inbox_delivered
        error_message = contentData.error_message;
        video_id = contentData.video_id;
        share_url = contentData.share_url;
        user_id = body.user_openid;
      } catch (parseError) {
        console.error('❌ Erreur lors du parsing du content:', parseError);
        return NextResponse.json(
          { error: 'Format de contenu invalide' },
          { status: 400 }
        );
      }
    } else {
      // Format direct (pour les autres types d'événements)
      publish_id = body.publish_id;
      status = body.status;
      error_message = body.error_message;
      video_id = body.video_id;
      share_url = body.share_url;
      user_id = body.user_id || body.user_openid;
    }

    if (!publish_id) {
      console.error('❌ publish_id manquant dans le webhook');
      console.error('🔍 Données disponibles dans le body:', {
        body_keys: Object.keys(body),
        content_type: typeof body.content,
        content_value: body.content,
        direct_publish_id: body.publish_id,
        event_type: body.event
      });
      return NextResponse.json(
        { error: 'publish_id manquant' },
        { status: 400 }
      );
    }

    // Log des données du webhook
    console.log('Données du webhook TikTok:', {
      publish_id,
      status,
      error_message,
      video_id,
      share_url,
      user_id,
      event: body.event,
      event_type: body.event
    });

    // Gérer les différents types d'événements TikTok
    const eventType = body.event;
    let finalStatus = status;
    
    switch (eventType) {
      case 'post.publish.inbox_delivered':
        // La vidéo a été livrée dans la boîte de réception TikTok
        finalStatus = 'PROCESSING';
        break;
      case 'post.publish.success':
        // Événement standard TikTok : publication réussie
        finalStatus = 'PUBLISHED';
        break;
      case 'post.publish.completed':
        // Alternative : publication terminée avec succès
        finalStatus = 'PUBLISHED';
        break;
      case 'post.publish.failed':
        // La publication a échoué
        finalStatus = 'FAILED';
        break;
      default:
    }

    // Mettre à jour le statut du schedule dans Firestore
    try {
      // Chercher le schedule par publishId
      let schedule = null;
      
      // Recherche globale par publishId exact
      try {
        const allSchedules = await scheduleService.getAll();
        schedule = allSchedules.find(s => s.publishId === publish_id);
        
        if (schedule) {
          console.log('✅ Schedule trouvé par publishId exact:', schedule.id);
        }
      } catch (globalSearchError) {
        console.error('Erreur lors de la recherche globale:', globalSearchError);
      }
      
      // Si pas trouvé, essayer avec des variantes du publish_id
      if (!schedule) {
        try {
          const allSchedules = await scheduleService.getAll();
          
          // Essayer différentes variantes du publish_id
          schedule = allSchedules.find(s => {
            if (!s.publishId) return false;
            
            // Comparaison exacte
            if (s.publishId === publish_id) return true;
            
            // Comparaison avec partie après ~
            const publishIdPart = publish_id.split('~')[1];
            if (publishIdPart && s.publishId.includes(publishIdPart)) return true;
            
            // Comparaison avec partie avant ~
            const publishIdPrefix = publish_id.split('~')[0];
            if (publishIdPrefix && s.publishId.includes(publishIdPrefix)) return true;
            
            return false;
          });
          
          if (schedule) {
            console.log('✅ Schedule trouvé par variante du publishId:', schedule.id);
          }
        } catch (searchError) {
          console.error('Erreur lors de la recherche par variante:', searchError);
        }
      }
      
      // Fallback: recherche par userId si disponible (pour les publications récentes)
      if (!schedule && user_id) {
        try {
          const schedules = await scheduleService.getByUserId(user_id);
          // Prendre le schedule le plus récent avec statut 'queued' ou 'scheduled'
          schedule = schedules
            .filter(s => s.status === 'queued' || s.status === 'scheduled')
            .sort((a, b) => {
              // scheduledAt peut être FieldValue ou Timestamp
              const getTime = (scheduledAt: any): number => {
                if (!scheduledAt) return 0;
                // Si c'est un Timestamp Firestore
                if (typeof scheduledAt.toMillis === 'function') {
                  return scheduledAt.toMillis();
                }
                // Si c'est un Date
                if (scheduledAt instanceof Date) {
                  return scheduledAt.getTime();
                }
                // Si c'est un nombre (timestamp)
                if (typeof scheduledAt === 'number') {
                  return scheduledAt;
                }
                return 0;
              };
              const aTime = getTime(a.scheduledAt);
              const bTime = getTime(b.scheduledAt);
              return bTime - aTime;
            })[0];
          
          if (schedule) {
            console.log('✅ Schedule trouvé par userId (plus récent):', schedule.id);
          }
        } catch (userIdSearchError) {
          console.error('Erreur lors de la recherche par userId:', userIdSearchError);
        }
      }

      if (schedule) {
        
        // Déterminer le nouveau statut
        let newStatus: 'scheduled' | 'queued' | 'published' | 'failed';
        let tiktokUrl: string | undefined;
        let lastError: string | undefined;

        switch (finalStatus) {
          case 'PUBLISHED':
            newStatus = 'published';
            tiktokUrl = share_url || `https://tiktok.com/@user/video/${video_id}`;
            break;
          case 'FAILED':
            newStatus = 'failed';
            lastError = error_message || 'Erreur inconnue lors de la publication';
            break;
          case 'PROCESSING':
            newStatus = 'queued';
            break;
          default:
            newStatus = 'scheduled';
        }

        // Mettre à jour le schedule
        await scheduleService.update(schedule.id, {
          status: newStatus,
          lastError,
          tiktokUrl,
          updatedAt: FieldValue.serverTimestamp()
        });

        // Log de la mise à jour réussie
        console.log('✅ Schedule mis à jour avec succès:', {
          id: schedule.id,
          newStatus,
          tiktokUrl,
          lastError
        });

      } else {
        // Pour les publications immédiates (non planifiées), c'est normal de ne pas trouver de schedule
        // Le webhook est reçu mais le post a déjà été traité côté client via polling
        if (eventType === 'post.publish.complete' || eventType === 'post.publish.success') {
          // Log silencieux pour les publications immédiates - c'est normal
          // Le statut est déjà géré via le polling côté client
        } else {
          // Seulement logger pour les autres types d'événements qui devraient avoir un schedule
          console.log('⚠️ Aucun schedule trouvé pour la mise à jour - publish_id:', publish_id, 'event:', eventType);
        }
      }

    } catch (updateError) {
      console.error('❌ Erreur lors de la mise à jour du schedule:', updateError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Webhook traité avec succès',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors du traitement de la webhook TikTok:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Endpoint pour tester la webhook
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Webhook TikTok endpoint actif',
    timestamp: new Date().toISOString(),
    testUrl: '/api/webhooks/tiktok/test'
  });
}

// Endpoint de test pour simuler un webhook TikTok
export async function PUT(request: NextRequest) {
  try {
    const { publish_id, status, error_message, video_id, share_url } = await request.json();
    
    // Log des paramètres de test
    console.log('Test webhook TikTok avec paramètres:', {
      publish_id,
      status,
      error_message,
      video_id,
      share_url
    });

    // Simuler l'appel du webhook
    const testBody = {
      publish_id: publish_id || 'test_publish_123',
      status: status || 'PUBLISHED',
      error_message: error_message || null,
      video_id: video_id || 'test_video_456',
      share_url: share_url || 'https://tiktok.com/@test/video/123',
      user_id: 'test_user_789'
    };

    // Appeler le webhook en interne
    const webhookUrl = new URL('/api/webhooks/tiktok', request.url);
    const response = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tiktok-signature': 'test_signature'
      },
      body: JSON.stringify(testBody)
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test webhook envoyé',
      testData: testBody,
      webhookResponse: result
    });

  } catch (error) {
    console.error('❌ Erreur lors du test webhook:', error);
    return NextResponse.json(
      { error: 'Erreur lors du test' },
      { status: 500 }
    );
  }
}
