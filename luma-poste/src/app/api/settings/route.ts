import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase';
import { adminDb } from '@/lib/firebase';
import { userSettingsService } from '@/lib/firestore';

// Types pour les paramètres utilisateur
export interface UserSettings {
  profile: {
    name: string;
    email: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publishSuccess: boolean;
    publishFailure: boolean;
    weeklyReport: boolean;
    newFollower: boolean;
  };
  privacy: {
    dataRetention: string;
    analyticsSharing: boolean;
    profileVisibility: string;
  };
  integrations: {
    autoSync: boolean;
    backupEnabled: boolean;
    apiAccess: boolean;
  };
}

// Récupérer les paramètres utilisateur
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les données utilisateur depuis Firebase Auth
    const userRecord = await adminAuth.getUser(userId);
    
    // Récupérer les paramètres depuis Firestore
    const savedSettings = await userSettingsService.getByUserId(userId);
    
    // Paramètres par défaut
    const defaultSettings: UserSettings = {
      profile: {
        name: userRecord.displayName || userRecord.email?.split('@')[0] || 'Utilisateur',
        email: userRecord.email || '',
        timezone: 'Europe/Paris',
        language: 'fr',
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        publishSuccess: true,
        publishFailure: true,
        weeklyReport: false,
        newFollower: true,
      },
      privacy: {
        dataRetention: '12',
        analyticsSharing: true,
        profileVisibility: 'public',
      },
      integrations: {
        autoSync: true,
        backupEnabled: true,
        apiAccess: true,
      },
    };

    // Fusionner avec les paramètres sauvegardés
    const settings = {
      profile: { ...defaultSettings.profile, ...(savedSettings?.profile || {}) },
      notifications: { ...defaultSettings.notifications, ...(savedSettings?.notifications || {}) },
      privacy: { ...defaultSettings.privacy, ...(savedSettings?.privacy || {}) },
      integrations: { ...defaultSettings.integrations, ...(savedSettings?.integrations || {}) },
    };

    return NextResponse.json({
      success: true,
      settings,
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Mettre à jour les paramètres utilisateur
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings) {
      return NextResponse.json(
        { error: 'Les paramètres sont requis' },
        { status: 400 }
      );
    }

    // Mettre à jour les paramètres dans Firestore
    await userSettingsService.update(userId, settings);

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour des paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// Générer une nouvelle clé API
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'generate-api-key') {
      // Générer une nouvelle clé API
      const apiKey = `sk_live_${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
      
      await userSettingsService.update(userId, { apiKey });

      return NextResponse.json({
        success: true,
        apiKey,
        message: 'Nouvelle clé API générée'
      });
    }

    if (action === 'export-data') {
      // Récupérer toutes les données utilisateur
      const [userRecord, settingsDoc, accountsSnap, schedulesSnap, videosSnap] = await Promise.all([
        adminAuth.getUser(userId),
        userSettingsService.getByUserId(userId),
        adminDb.collection('accounts').where('userId', '==', userId).get(),
        adminDb.collection('schedules').where('userId', '==', userId).get(),
        adminDb.collection('videos').where('userId', '==', userId).get(),
      ]);

      const exportData = {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          createdAt: userRecord.metadata.creationTime,
        },
        settings: settingsDoc || {},
        accounts: accountsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        schedules: schedulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        videos: videosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        exportedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        data: exportData,
        message: 'Données exportées avec succès'
      });
    }

    if (action === 'delete-account') {
      // Supprimer le compte utilisateur (soft delete)
      await userSettingsService.delete(userId);

      return NextResponse.json({
        success: true,
        message: 'Compte marqué pour suppression'
      });
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'action sur les paramètres:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
