// Firebase Admin SDK (pour le backend/API routes uniquement)
import { initializeApp as initializeAdminApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import serviceAccount from '../../lumapost-38e61-firebase-adminsdk-fbsvc-52c85bfe61.json';

// Configuration Firebase Admin pour la production
let adminApp;
try {
  if (getApps().length === 0) {
    // Utiliser le fichier service account directement
    adminApp = initializeAdminApp({
      credential: cert(serviceAccount as any),
    });
  } else {
    adminApp = getApps()[0];
  }
} catch (error) {
  console.error('Erreur lors de l\'initialisation de Firebase Admin:', error);
  throw error;
}

// Services Firebase Admin
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
export const adminAuth = getAdminAuth(adminApp);
