import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

// Configuration TikTok Login Kit depuis les variables d'environnement
const TIKTOK_CLIENT_KEY = process.env.EXPO_PUBLIC_TIKTOK_CLIENT_ID || '';

const DEFAULT_NEXTJS_CALLBACK = 'https://luma-post.emplica.fr/api/auth/tiktok/callback';

// Utilise l'API Next.js qui existe déjà
const MOBILE_REDIRECT_URI = DEFAULT_NEXTJS_CALLBACK;

const WEB_REDIRECT_URI =
  process.env.EXPO_PUBLIC_TIKTOK_WEB_REDIRECT_URI ||
  process.env.NEXT_PUBLIC_TIKTOK_REDIRECT_URI ||
  process.env.EXPO_PUBLIC_TIKTOK_REDIRECT_URI ||
  DEFAULT_NEXTJS_CALLBACK;

const TIKTOK_REDIRECT_URI =
  Platform.OS === 'ios' || Platform.OS === 'android' ? MOBILE_REDIRECT_URI : WEB_REDIRECT_URI;

// Scopes TikTok nécessaires
const TIKTOK_SCOPES = [
  'user.info.basic',
  'video.list',
  'video.publish',
].join(',');

export interface TikTokCallbackPayload {
  code?: string;
  state?: string;
  session?: string;
  error?: string;
}

/**
 * Génère l'URL d'autorisation TikTok
 */
export function getTikTokAuthUrl(): string {
  const randomState = Math.random().toString(36).substring(7);
  // Format: mobile_randomState (pour indiquer que c'est l'app mobile)
  const state = `mobile_${randomState}`;

  const params = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    scope: TIKTOK_SCOPES,
    response_type: 'code',
    redirect_uri: TIKTOK_REDIRECT_URI,
    state,
  });

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  console.log('[TikTok Auth] redirect_uri utilisé:', TIKTOK_REDIRECT_URI);
  console.log('[TikTok Auth] URL complète:', authUrl);
  return authUrl;
}

/**
 * Ouvre le navigateur pour l'authentification TikTok
 */
export async function initiateTikTokAuth(): Promise<void> {
  const authUrl = getTikTokAuthUrl();
  await Linking.openURL(authUrl);
}

/**
 * Parse l'URL de callback TikTok et extrait le code d'autorisation
 */
export function parseTikTokCallback(url: string): TikTokCallbackPayload | null {
  try {
    const { queryParams } = Linking.parse(url);

    if (!queryParams) {
      return null;
    }

    const payload: TikTokCallbackPayload = {};

    if (typeof queryParams.code === "string") {
      payload.code = queryParams.code;
    }
    if (typeof queryParams.state === "string") {
      payload.state = queryParams.state;
    }
    if (typeof queryParams.session === "string") {
      payload.session = queryParams.session;
    }
    if (typeof queryParams.error === "string") {
      payload.error = queryParams.error;
    }

    return Object.keys(payload).length > 0 ? payload : null;
  } catch (error) {
    console.error('Error parsing TikTok callback URL:', error);
    return null;
  }
}

/**
 * Configure le listener pour les deep links TikTok
 */
export function setupTikTokDeepLinkListener(
  onCallback: (payload: TikTokCallbackPayload) => void
): () => void {
  const subscription = Linking.addEventListener('url', ({ url }) => {
    // Vérifier si c'est un callback TikTok
    if (url.includes('/auth/tiktok/callback')) {
      const result = parseTikTokCallback(url);

      if (result) {
        onCallback(result);
      }
    }
  });

  return () => {
    subscription.remove();
  };
}
