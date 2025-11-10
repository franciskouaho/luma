// Firebase Client SDK pour Firestore (côté client uniquement)
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration Firebase Client
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA_W2Clr8riHWOhmhFuxhjRxKMdN9oB8cE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "lumapost-38e61.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "lumapost-38e61",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "lumapost-38e61.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "939156653935",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:939156653935:web:9ac1633fd2a8e5b7cb4a9a",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-42VQK97ZK1"
};

// Initialize Firebase Client
const app = initializeApp(firebaseConfig);

// Initialize Firestore Client
export const db = getFirestore(app);

export default app;
