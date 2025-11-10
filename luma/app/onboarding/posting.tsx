import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

const postingOptions = [
  {
    id: "light",
    label: "1-2 vidéos par semaine",
    icon: "calendar-outline",
  },
  {
    id: "steady",
    label: "3-5 vidéos par semaine",
    icon: "timer-outline",
  },
  {
    id: "intense",
    label: "6+ vidéos par semaine",
    icon: "flame-outline",
  },
];

export default function OnboardingPosting() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (isTransitioning) return;
    setSelectedOption(optionId);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/onboarding/dream");
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
        <OnboardingHeader currentStep={2} totalSteps={10} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.body}>
            <View style={styles.heading}>
              <Text style={styles.title}>Combien de posts par semaine ?</Text>
              <Text style={styles.subtitle}>
                Choisis le volume auquel tu souhaites t’engager. Nous te proposerons le
                plan d’action et les idées pour tenir la cadence.
              </Text>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.options}>
                {postingOptions.map((option) => {
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
                  </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.proTeaser}>
                <Text style={styles.proTitle}>Astuce Luma Pro</Text>
                <Text style={styles.proText}>
                  Nos membres reçoivent un calendrier prêt à l’emploi pour chaque semaine,
                  avec des scripts et transitions adaptés à leur cadence.
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
  },
  optionLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  optionLabelActive: {
    color: colors.primary,
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


