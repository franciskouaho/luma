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
 * Page de callback TikTok (route alternative)
 * Cette page est ouverte quand TikTok redirige après l'authentification via Firebase Function
 */
export default function TikTokCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
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
          typeof resolvedParams.session === "string"
            ? resolvedParams.session
            : undefined;
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

        // Priorité au flux direct avec échange de code
        if (codeParam) {
          try {
            const result = (await exchangeTikTokCode(codeParam)) as TikTokSessionResult;
            console.log("[TikTokCallbackScreen] Exchange code résultat:", result);

            if (result?.success) {
              router.replace({
                pathname: '/(tabs)/profile',
                params: { tiktokConnected: 'true' }
              });
              return;
            }
            console.warn("[TikTokCallbackScreen] Exchange code sans succès, tentative session...");
          } catch (exchangeError) {
            console.error("[TikTokCallbackScreen] Exchange code erreur:", exchangeError);

            if (!sessionToken) {
              throw exchangeError;
            }
          }
        }

        if (sessionToken) {
          console.log('TikTok callback received with session token, récupération via getTikTokSession...');

          // Appeler la Cloud Function pour récupérer et sauvegarder la session
          const result = (await getTikTokSession(sessionToken)) as TikTokSessionResult;

          console.log('TikTok auth successful:', result);

          if (!result?.success) {
            throw new Error('Impossible de valider la session TikTok');
          }

          // Rediriger vers le profil avec un message de succès
          router.replace({
            pathname: '/(tabs)/profile',
            params: { tiktokConnected: 'true' }
          });
          return;
        }

        throw new Error('Ni code TikTok ni token de session fournis');
      } catch (error) {
        console.error('TikTok callback error:', error);

        // Rediriger vers le profil avec un message d'erreur
        router.replace({
          pathname: '/(tabs)/profile',
          params: { tiktokError: error instanceof Error ? error.message : 'Échec de la connexion' }
        });
      }
    };

    void handleCallback();
  }, [params, router]);

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
