import functions from "@react-native-firebase/functions";
import type {
  GenerateIdeaRequest,
  GenerateIdeaResponse,
} from "../types/tiktok";

/**
 * Call the generateIdeas Cloud Function
 */
export const generateIdeas = async (
  request: GenerateIdeaRequest
): Promise<GenerateIdeaResponse> => {
  const callable = functions().httpsCallable("generateIdeas");
  const result = await callable(request);
  return result.data as GenerateIdeaResponse;
};

/**
 * Call the analyzeProfile Cloud Function
 */
export const analyzeProfile = async (username: string) => {
  const callable = functions().httpsCallable("analyzeProfile");
  const result = await callable({ username });
  return result.data;
};

/**
 * Échange le code d'autorisation TikTok contre un access token
 */
export const exchangeTikTokCode = async (code: string) => {
  const callable = functions().httpsCallable("exchangeTikTokCode");
  const result = await callable({ code });
  return result.data;
};

/**
 * Récupère une session TikTok temporaire après le callback mobile
 * Lit directement depuis Firestore (créée par l'API Next.js)
 */
export const getTikTokSession = async (sessionToken: string) => {
  const firestore = (await import("@react-native-firebase/firestore")).default;
  const auth = (await import("@react-native-firebase/auth")).default;
  
  // Vérifier que l'utilisateur est authentifié
  const currentUser = auth().currentUser;
  if (!currentUser) {
    throw new Error("User must be authenticated");
  }

  // Récupérer la session depuis Firestore
  const sessionDocRef = firestore().collection("tiktok_sessions").doc(sessionToken);
  const sessionDoc = await sessionDocRef.get();

  const sessionExists =
    typeof sessionDoc.exists === "function"
      ? sessionDoc.exists()
      : sessionDoc.exists;

  console.log("[getTikTokSession] sessionToken:", sessionToken);
  console.log("[getTikTokSession] sessionExists:", sessionExists);

  if (!sessionExists) {
    console.log("[getTikTokSession] sessionDoc inexistant");
    throw new Error("Session not found or expired");
  }

  const sessionData = sessionDoc.data();
  console.log("[getTikTokSession] sessionDoc keys:", sessionData ? Object.keys(sessionData) : []);
  console.log(
    "[getTikTokSession] Session data récupérée:",
    sessionData ? JSON.stringify(sessionData, null, 2) : "undefined"
  );

  // Vérifier l'expiration
  if (sessionData && sessionData.expiresAt < Date.now()) {
    await sessionDoc.ref.delete();
    throw new Error("Session has expired");
  }

  console.log('[getTikTokSession] TikTok userInfo:', sessionData?.tiktok?.userInfo);

  // Sauvegarder les données TikTok dans le profil utilisateur
  await firestore()
    .collection("users")
    .doc(currentUser.uid)
    .set(
      {
        tiktok: {
          ...sessionData?.tiktok,
          connectedAt: firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

  console.log('[getTikTokSession] Données sauvegardées dans users/' + currentUser.uid);

  // Supprimer la session temporaire
  await sessionDocRef.delete();

  return {
    success: true,
    userInfo: sessionData?.tiktok?.userInfo,
  };
};

/**
 * Rafraîchit le token TikTok
 */
export const refreshTikTokToken = async () => {
  const callable = functions().httpsCallable("refreshTikTokToken");
  const result = await callable();
  return result.data;
};

/**
 * Déconnecte TikTok
 */
export const disconnectTikTok = async () => {
  const callable = functions().httpsCallable("disconnectTikTok");
  const result = await callable();
  return result.data;
};
