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
 */
export const getTikTokSession = async (sessionToken: string) => {
  const callable = functions().httpsCallable("getTikTokSession");
  const result = await callable({ sessionToken });
  return result.data;
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
