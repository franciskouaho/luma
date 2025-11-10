// Firebase Admin SDK (pour le backend/API routes uniquement)
import { initializeApp as initializeAdminApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

// Credentials Firebase Admin SDK (service account)
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY
  ?.replace(/^"|"$/g, '')
  .replace(/\\n/g, '\n');

const firebaseCredentials: ServiceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  privateKey: firebasePrivateKey!,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL!
};

// Configuration Firebase Admin pour la production
let adminApp;
try {
  if (getApps().length === 0) {
    // Utiliser les credentials Firebase service account
    adminApp = initializeAdminApp({
      credential: cert(firebaseCredentials),
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
