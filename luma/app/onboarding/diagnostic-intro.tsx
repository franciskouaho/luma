import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";
import { initiateTikTokAuth, setupTikTokDeepLinkListener } from "../../src/lib/tiktok-auth";
import { exchangeTikTokCode, getTikTokSession } from "../../src/lib/functions";

export default function DiagnosticIntro() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    // Écouter les callbacks TikTok
    const cleanup = setupTikTokDeepLinkListener(
      async ({ code, state, session, error }) => {
        console.log("🔥 [NOUVEAU] Deep link TikTok reçu!", {
          codePresent: !!code,
          sessionPresent: !!session,
          state,
          error,
        });

        if (error) {
          console.error("🔥 [NOUVEAU] ❌ Erreur dans le callback:", error);
          Alert.alert(
            "Erreur",
            decodeURIComponent(error),
            [{ text: "OK" }],
          );
          setConnecting(false);
          return;
        }

        setConnecting(true);

        try {
          // NOUVEAU CODE SIMPLIFIÉ - Priorité au code direct
          if (code) {
            console.log("🔥 [NOUVEAU] ✅ Code TikTok reçu, échange en cours...");
            const result = await exchangeTikTokCode(code);

            console.log("🔥 [NOUVEAU] Résultat échange:", result);

            if (result?.success) {
              console.log("🔥 [NOUVEAU] 🎉 Succès! Redirection...");
              router.push("/onboarding/analysis-loading");
              return;
            }
            throw new Error("Échec de l'échange de code TikTok");
          }

          // Si on a une session (flux ancien)
          if (session) {
            console.log("🔥 [NOUVEAU] Session token reçu:", session);
            const result = await getTikTokSession(session);

            if (result?.success) {
              console.log("🔥 [NOUVEAU] 🎉 Session récupérée! Redirection...");
              router.push("/onboarding/analysis-loading");
              return;
            }
            throw new Error("Session TikTok invalide ou expirée");
          }

          throw new Error("Aucun code ni session reçu dans le callback");
        } catch (callbackError: any) {
          console.error("🔥 [NOUVEAU] ❌ Erreur finale:", callbackError);
          Alert.alert(
            "Erreur",
            callbackError?.message ||
              "Erreur lors de la connexion TikTok. Veuillez réessayer.",
          );
        } finally {
          setConnecting(false);
        }
      },
    );

    return cleanup;
  }, [router]);

  const handleContinue = async () => {
    setConnecting(true);
    try {
      await initiateTikTokAuth();
    } catch (error) {
      console.error('Error initiating TikTok auth:', error);
      setConnecting(false);
      Alert.alert('Erreur', 'Impossible de lancer l\'authentification TikTok');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <LinearGradient
        colors={[
          colors.gradient.start,
          colors.gradient.middle,
          colors.gradient.end,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <View style={styles.container}>

      <OnboardingHeader currentStep={8} totalSteps={10} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Text style={styles.title}>Prêt pour ton diagnostic personnalisé ?</Text>
            <Text style={styles.subtitle}>
              Notre IA, entraînée sur + de 250 000 comptes TikTok comme le tien,
              va scanner ton profil en profondeur.
            </Text>

            <View style={styles.illustrationWrapper}>
              <Image
                source={require("../../assets/onboarding/diagnostic.png")}
                style={styles.illustrationImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.description}>
              Tu vas connaître le vrai potentiel de ton compte et comment
              l&apos;atteindre.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.primaryButton, connecting && styles.primaryButtonDisabled]}
            onPress={handleContinue}
            disabled={connecting}
          >
            {connecting ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.primaryButtonText}>CONNECTER MON COMPTE TIKTOK</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.12,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: spacing.md,
  },
  illustrationWrapper: {
    width: "86%",
    maxWidth: 320,
    aspectRatio: 1.2,
    marginVertical: spacing.xl,
  },
  illustrationImage: {
    width: "100%",
    height: "100%",
  },
  description: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  footer: {
    marginTop: spacing.md,
  },
  primaryButton: {
    borderRadius: borderRadius.button,
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingVertical: spacing.md + 4,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
