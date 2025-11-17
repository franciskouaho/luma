import { Timestamp } from "firebase/firestore"; // Adapte l'import si tu utilises un autre ORM ou SDK

export type PromoCode = {
  code: string; // Code en majuscules (ex: "BETA2025")
  type: "beta" | "admin" | "promo"; // Type de code
  active: boolean; // Si le code est actif
  maxUses: number | null; // Nombre max d'utilisations (null = illimité)
  usedCount: number; // Nombre d'utilisations actuelles
  usedBy: string[]; // Liste des UIDs qui ont utilisé ce code
  expiresAt: Timestamp | null; // Date d'expiration (null = jamais)
  createdAt: Timestamp; // Date de création
  lastUsedAt: Timestamp | null; // Dernière utilisation
  description: string; // Description du code
};
