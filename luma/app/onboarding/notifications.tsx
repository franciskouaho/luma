import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { STORAGE_KEYS } from "../../src/constants/storage";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

export default function OnboardingNotifications() {
  const router = useRouter();

  const finishOnboarding = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, "true");
    } catch {
      // On ignore l'erreur et on continue vers l'app
    } finally {
      router.replace("/(tabs)");
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingHeader currentStep={8} totalSteps={8} />
        <View style={styles.content}>
          <Text style={styles.title}>Soyez notifié quand votre audience est active</Text>

          <View style={styles.promptCard}>
            <Text style={styles.promptTitle}>Activer les notifications</Text>
            <Text style={styles.promptDescription}>
              Recevez des alertes quand vos vidéos sont repostées, de nouvelles idées sont
              générées et que votre audience est la plus engagée.
            </Text>
            <View style={styles.promptActions}>
              <TouchableOpacity
                style={[styles.promptAction, styles.promptActionLeft]}
                onPress={() => finishOnboarding()}
              >
                <Text style={styles.promptActionText}>Ne pas autoriser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.promptAction}
                onPress={() => finishOnboarding()}
              >
                <Text style={[styles.promptActionText, styles.promptActionTextPrimary]}>
                  Autoriser
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

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
    paddingTop: spacing.md,
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
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  content: {
    gap: spacing.lg,
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
  promptCard: {
    alignSelf: "center",
    width: 320,
    maxWidth: "100%",
    backgroundColor: "rgba(29, 39, 55, 0.94)",
    borderRadius: borderRadius.card + 14,
    paddingTop: spacing.lg * 1.2,
    paddingHorizontal: spacing.lg * 1.2,
    paddingBottom: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: spacing.md,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
  promptTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  promptDescription: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  promptActions: {
    marginTop: spacing.sm,
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255, 255, 255, 0.18)",
  },
  promptAction: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  promptActionLeft: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: "rgba(255, 255, 255, 0.18)",
  },
  promptActionText: {
    color: "#4FA3FF",
    fontSize: 16,
    fontWeight: "600",
  },
  promptActionTextPrimary: {
    fontWeight: "700",
  },
});


