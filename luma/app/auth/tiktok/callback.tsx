import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { getTikTokSession, exchangeTikTokCode } from '@/src/lib/functions';

type TikTokSessionResult = {
  success?: boolean;
  userInfo?: any;
  [key: string]: any;
};

/**
 * Page de callback TikTok
 * Cette page est ouverte quand TikTok redirige après l'authentification via Firebase Function
 */
export default function TikTokCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      const resolvedParams = Object.entries(params).reduce<Record<string, string | undefined>>(
        (acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value[0] : value;
          return acc;
        },
        {},
      );
      const queryString = new URLSearchParams(
        Object.entries(resolvedParams).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (typeof value === "string") {
              acc[key] = value;
            }
            return acc;
          },
          {},
        ),
      ).toString();
      const reconstructedUrl = `luma://auth/tiktok/callback${queryString ? `?${queryString}` : ""}`;

      // Récupérer le session token (nouveau) ou le code (ancien pour compatibilité)
      const stateParam = resolvedParams.state;
      const sessionToken =
        resolvedParams.session ??
        (stateParam?.startsWith("mobile_") ? stateParam : undefined);
      const codeParam = resolvedParams.code;
      const errorParam = resolvedParams.error;

      console.log("[TikTokCallbackScreen] URL reçue:", reconstructedUrl);
      console.log("[TikTokCallbackScreen] sessionToken détecté:", sessionToken ?? "aucun");
      if (codeParam || stateParam) {
        console.log("[TikTokCallbackScreen] Params code/state:", {
          codePresent: !!codeParam,
          state: stateParam,
        });
      }

      // Gérer les erreurs
      if (errorParam) {
        throw new Error(decodeURIComponent(errorParam));
      }

      if (!sessionToken) {
        console.warn("[TikTokCallbackScreen] Token de session manquant, tentative fallback avec code.");

        if (codeParam) {
          try {
            const result: TikTokSessionResult = await exchangeTikTokCode(codeParam);
            console.log("[TikTokCallbackScreen] Fallback exchange code résultat:", result);

            if (result?.success) {
              router.replace({
                pathname: '/(tabs)/profile',
                params: { tiktokConnected: 'true' }
              });
              return;
            }
          } catch (fallbackError) {
            console.error("[TikTokCallbackScreen] Fallback exchange code erreur:", fallbackError);
          }
        }

        throw new Error('Token de session manquant');
      }

      console.log('TikTok callback received with session token, récupération via getTikTokSession...');

      // Appeler la Cloud Function pour récupérer et sauvegarder la session
      const result: TikTokSessionResult = await getTikTokSession(sessionToken);

      console.log('TikTok auth successful:', result);

      if (!result?.success) {
        throw new Error('Impossible de valider la session TikTok');
      }

      // Rediriger vers le profil avec un message de succès
      router.replace({
        pathname: '/(tabs)/profile',
        params: { tiktokConnected: 'true' }
      });
    } catch (error) {
      console.error('TikTok callback error:', error);

      // Rediriger vers le profil avec un message d'erreur
      router.replace({
        pathname: '/(tabs)/profile',
        params: { tiktokError: error instanceof Error ? error.message : 'Échec de la connexion' }
      });
    }
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Connexion à TikTok en cours...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 20,
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
});
