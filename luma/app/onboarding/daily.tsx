import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

const dailyOptions = [
  {
    id: "short",
    label: "1 mini session / jour",
    description: "15-20 minutes pour filmer ou planifier un contenu.",
    icon: "time-outline",
  },
  {
    id: "double",
    label: "2 sessions / jour",
    description: "Matin et soir pour filmer, monter ou interagir.",
    icon: "repeat-outline",
  },
  {
    id: "creator-mode",
    label: "Créateur full time",
    description: "3+ sessions par jour, tu veux accélérer au maximum.",
    icon: "flash-outline",
  },
];

export default function OnboardingDaily() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (isTransitioning) return;
    setSelectedOption(optionId);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/onboarding/strategy");
    }, 220);
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
        <View style={styles.body}>
          <OnboardingHeader currentStep={4} totalSteps={8} />
          <View style={styles.heading}>
            <Text style={styles.title}>Combien de sessions par jour ?</Text>
            <Text style={styles.subtitle}>
              Ta disponibilité quotidienne nous aide à proposer des routines réalistes,
              avec des rappels et des tâches ciblées.
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.options}>
              {dailyOptions.map((option) => {
                const active = selectedOption === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleSelectOption(option.id)}
                    style={[styles.optionCard, active && styles.optionCardActive]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={active ? colors.background : colors.text}
                      style={[
                        styles.optionIcon,
                        active && styles.optionIconActive,
                      ]}
                    />
                    <View style={styles.optionText}>
                      <Text
                        style={[
                          styles.optionLabel,
                          active && styles.optionLabelActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.proTeaser}>
              <Text style={styles.proTitle}>Routine Pro personnalisée</Text>
              <Text style={styles.proText}>
                Luma Pro te propose chaque jour des tâches prêtes à exécuter, adaptées à ton
                temps dispo pour continuer à poster sans stress.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer} />
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
  },
  body: {
    flexGrow: 1,
    justifyContent: "space-between",
    gap: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSection: {
    gap: spacing.xl,
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.card + 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    backgroundColor: "rgba(255, 255, 255, 0.035)",
    gap: spacing.lg,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(252, 38, 82, 0.12)",
  },
  optionIcon: {
    width: 40,
    textAlign: "center",
  },
  optionIconActive: {
    color: colors.primary,
  },
  optionText: {
    flex: 1,
    gap: spacing.xs,
  },
  optionLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  optionLabelActive: {
    color: colors.primary,
  },
  optionDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  proTeaser: {
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
  },
  proText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    height: spacing.lg,
  },
});


