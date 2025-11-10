import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { OnboardingProgress } from "../../src/components/OnboardingProgress";
import { borderRadius, colors, spacing } from "../../src/theme/colors";
import { initiateTikTokAuth, setupTikTokDeepLinkListener } from "../../src/lib/tiktok-auth";
import { exchangeTikTokCode, getTikTokSession } from "../../src/lib/functions";

export default function OnboardingAnalysis() {
  const router = useRouter();
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Écouter les callbacks TikTok
    const cleanup = setupTikTokDeepLinkListener(
      async ({ code, state, session, error }) => {
        console.log("[OnboardingAnalysis] Deep link reçu", {
          codePresent: !!code,
          state,
          session,
          error,
        });

        if (error) {
          console.error("[OnboardingAnalysis] Erreur deep link TikTok:", error);
          Alert.alert(
            "Erreur",
            decodeURIComponent(error),
            [{ text: "OK" }],
          );
          return;
        }

        setConnecting(true);

        try {
          const mobileSessionToken =
            session ?? (state?.startsWith("mobile_") ? state : undefined);

          if (mobileSessionToken) {
            const result = await getTikTokSession(mobileSessionToken);
            if (result?.success) {
              setConnected(true);
              setUserInfo(result.userInfo);
              return;
            }
            throw new Error("Session TikTok invalide");
          }

          if (code) {
            const result = await exchangeTikTokCode(code);

            if (result.success) {
              setConnected(true);
              setUserInfo(result.userInfo);
              return;
            }
            throw new Error("Échec de l'échange de code TikTok");
          }

          throw new Error("Callback TikTok invalide (aucun token reçu)");
        } catch (callbackError: any) {
          console.error("Error connecting TikTok:", callbackError);
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
  }, []);

  const handleConnectTikTok = async () => {
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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Retour"
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <OnboardingProgress currentStep={7} totalSteps={8} />
        </View>
        <Text style={styles.title}>Connecte ton compte TikTok</Text>
        <Text style={styles.subtitle}>
          Connecte ton compte pour recevoir une analyse personnalisée
          et des recommandations adaptées à ton profil.
        </Text>

        {!connected ? (
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Authentification TikTok</Text>
            <Text style={styles.inputDescription}>
              En connectant ton compte, Luma pourra analyser tes performances
              et te proposer des idées de contenu personnalisées.
            </Text>
            <TouchableOpacity
              style={[styles.analyzeButton, connecting && styles.analyzeButtonDisabled]}
              onPress={handleConnectTikTok}
              disabled={connecting}
            >
              {connecting ? (
                <ActivityIndicator color={colors.text} />
              ) : (
                <Text style={styles.analyzeButtonText}>Connecter mon compte TikTok</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.insightsCard}>
            <Text style={styles.insightsTitle}>Compte connecté ! ✓</Text>
            {userInfo && (
              <>
                <View style={styles.insightItem}>
                  <Text style={styles.insightTitle}>
                    Bienvenue {userInfo.displayName || userInfo.username || 'sur TikTok'} !
                  </Text>
                  <Text style={styles.insightDescription}>
                    Ton compte TikTok est maintenant connecté. Tu peux continuer pour
                    personnaliser ton expérience.
                  </Text>
                </View>
                {userInfo.followerCount > 0 && (
                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{userInfo.followerCount.toLocaleString()}</Text>
                      <Text style={styles.statLabel}>Abonnés</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{userInfo.videoCount || 0}</Text>
                      <Text style={styles.statLabel}>Vidéos</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{userInfo.likesCount?.toLocaleString() || 0}</Text>
                      <Text style={styles.statLabel}>J'aime</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </View>
        )}

        <View style={styles.proTeaser}>
          <Text style={styles.proTitle}>Luma Pro inclut aussi</Text>
          <Text style={styles.proItem}>• Rapports hebdomadaires illimités</Text>
          <Text style={styles.proItem}>• Suggestions de tendances quotidiennes</Text>
          <Text style={styles.proItem}>• Support créatif prioritaire</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            !connected && styles.primaryButtonDisabled,
          ]}
          onPress={() => router.push("/onboarding/notifications")}
          disabled={!connected}
        >
          <Text style={styles.primaryButtonText}>Continuer</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
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
    paddingTop: spacing.xl * 1.2,
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
    gap: spacing.md,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  inputCard: {
    marginTop: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: spacing.sm,
  },
  inputLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  inputDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  analyzeButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  analyzeButtonDisabled: {
    opacity: 0.4,
  },
  analyzeButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  insightsCard: {
    marginTop: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: spacing.lg,
    gap: spacing.sm,
  },
  insightsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  insightItem: {
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  insightTitle: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 15,
  },
  insightDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  insightsHint: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  statItem: {
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  proTeaser: {
    marginTop: spacing.lg,
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    padding: spacing.lg,
    gap: spacing.xs,
  },
  proTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  proItem: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footer: {
    marginTop: spacing.md,
  },
  primaryButton: {
    borderRadius: borderRadius.button,
    backgroundColor: colors.primary,
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  primaryButtonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
});


