import {
  Timestamp,
  Firestore,
  CollectionReference,
  DocumentReference,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
} from "firebase/firestore";
import { PromoCode } from "../../types/promo/promoCode";

/**
 * Retourne la référence à la collection "promoCodes" dans Firestore.
 * Adapte cette fonction si tu utilises Firestore Admin SDK ou un autre environnement.
 */
function getPromoCodesCollection(db: Firestore): CollectionReference {
  return collection(db, "promoCodes");
}

/**
 * Crée un nouveau code promo.
 */
export async function createPromoCode(
  db: Firestore,
  data: Omit<PromoCode, "usedCount" | "usedBy" | "createdAt" | "lastUsedAt">,
): Promise<PromoCode> {
  const now = Timestamp.now();
  const promoCode: PromoCode = {
    ...data,
    code: data.code.toUpperCase(),
    usedCount: 0,
    usedBy: [],
    createdAt: now,
    lastUsedAt: null,
  };
  const col = getPromoCodesCollection(db);
  const docRef = doc(col, promoCode.code);
  await setDoc(docRef, promoCode);
  return promoCode;
}

/**
 * Vérifie si un code promo est valide pour un utilisateur donné.
 */
export async function isPromoCodeValid(
  db: Firestore,
  code: string,
  uid: string,
): Promise<boolean> {
  const col = getPromoCodesCollection(db);
  const docRef = doc(col, code.toUpperCase());
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  const promo = docSnap.data() as PromoCode;
  if (!promo.active) return false;
  if (promo.expiresAt && promo.expiresAt.toMillis() < Date.now()) return false;
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return false;
  if (promo.usedBy.includes(uid)) return false;
  return true;
}

/**
 * Utilise un code promo pour un utilisateur donné.
 * Retourne true si l'utilisation est réussie, false sinon.
 */
export async function usePromoCode(
  db: Firestore,
  code: string,
  uid: string,
): Promise<boolean> {
  const col = getPromoCodesCollection(db);
  const docRef = doc(col, code.toUpperCase());
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return false;
  const promo = docSnap.data() as PromoCode;
  if (!(await isPromoCodeValid(db, code, uid))) return false;

  await updateDoc(docRef, {
    usedCount: promo.usedCount + 1,
    lastUsedAt: Timestamp.now(),
    usedBy: [...promo.usedBy, uid],
  });
  return true;
}

/**
 * Désactive un code promo.
 */
export async function deactivatePromoCode(
  db: Firestore,
  code: string,
): Promise<void> {
  const col = getPromoCodesCollection(db);
  const docRef = doc(col, code.toUpperCase());
  await updateDoc(docRef, { active: false });
}

/**
 * Récupère un code promo par son code.
 */
export async function getPromoCode(
  db: Firestore,
  code: string,
): Promise<PromoCode | null> {
  const col = getPromoCodesCollection(db);
  const docRef = doc(col, code.toUpperCase());
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data() as PromoCode;
}

/**
 * Supprime un code promo.
 */
export async function deletePromoCode(
  db: Firestore,
  code: string,
): Promise<void> {
  const col = getPromoCodesCollection(db);
  const docRef = doc(col, code.toUpperCase());
  await deleteDoc(docRef);
}

/*
  Remarques :
  - Toutes les fonctions attendent une instance Firestore en paramètre.
  - Ajoute des try/catch ou une gestion d’erreur selon tes besoins.
  - Tu peux enrichir ce module avec des fonctions de recherche, de listing, etc.
*/
