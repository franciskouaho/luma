import { initializeApp } from "firebase/app";
import { getFirestore, Timestamp } from "firebase/firestore";
import {
  createPromoCode,
  isPromoCodeValid,
  usePromoCode,
  deactivatePromoCode,
  getPromoCode,
  deletePromoCode,
} from "./src/lib/promo/promoCodesManager";

// Remplace par ta vraie config Firebase !
const firebaseConfig = {
  apiKey: "FAKE",
  authDomain: "FAKE",
  projectId: "FAKE",
  // ...etc
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  // Création
  const promo = await createPromoCode(db, {
    code: "BETA2025",
    type: "beta",
    active: true,
    maxUses: 2,
    expiresAt: null,
    description: "Test code promo",
  });
  console.log("Créé:", promo);

  // Vérification
  const valid = await isPromoCodeValid(db, "BETA2025", "userUid123");
  console.log("Valide pour userUid123 ?", valid);

  // Utilisation
  const used = await usePromoCode(db, "BETA2025", "userUid123");
  console.log("Utilisé par userUid123 ?", used);

  // Désactivation
  await deactivatePromoCode(db, "BETA2025");
  console.log("Code désactivé.");

  // Lecture
  const promoRead = await getPromoCode(db, "BETA2025");
  console.log("Lecture:", promoRead);

  // Suppression
  await deletePromoCode(db, "BETA2025");
  console.log("Code supprimé.");
}

main().catch(console.error);
