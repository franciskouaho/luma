import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { exchangeTikTokCode } from '@/src/lib/functions';

/**
 * NOUVEAU CODE SIMPLIFIÉ - Page de callback TikTok
 */
export default function TikTokCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    handleCallback();
  }, []);

  async function handleCallback() {
    try {
      const code = Array.isArray(params.code) ? params.code[0] : params.code;
      const state = Array.isArray(params.state) ? params.state[0] : params.state;
      const error = Array.isArray(params.error) ? params.error[0] : params.error;

      console.log('[NOUVEAU CALLBACK] Code présent:', !!code, 'State:', state);

      if (error) {
        throw new Error(decodeURIComponent(error));
      }

      if (!code) {
        throw new Error('Code TikTok manquant');
      }

      // TOUJOURS échanger le code directement
      console.log('[NOUVEAU CALLBACK] Échange du code TikTok...');
      const result = await exchangeTikTokCode(code);

      if (result?.success) {
        console.log('[NOUVEAU CALLBACK] ✅ Succès ! Redirection...');
        router.replace('/onboarding/analysis-loading');
        return;
      }

      throw new Error('Échec de l\'échange de code');
    } catch (error) {
      console.error('[NOUVEAU CALLBACK] ❌ Erreur:', error);
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
