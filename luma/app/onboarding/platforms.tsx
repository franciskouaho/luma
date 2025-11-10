import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

const platformOptions = [
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4+", label: "4+" },
];

export default function OnboardingPlatforms() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (isTransitioning) return;
    setSelectedOption(optionId);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/onboarding/diagnostic-intro");
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

        <OnboardingHeader currentStep={7} totalSteps={10} />

        <View style={styles.content}>
          <View style={styles.heading}>
            <Text style={styles.title}>Sur combien de plateformes tu postes ?</Text>
          </View>

          <View style={styles.optionsRow}>
            {platformOptions.map((option) => {
              const active = selectedOption === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  onPress={() => handleSelectOption(option.id)}
                  style={[styles.optionCard, active && styles.optionCardActive]}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      active && styles.optionLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: spacing.xl,
  },
  heading: {
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
  },
  optionsRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingVertical: spacing.md,
    justifyContent: "center",
  },
  optionCard: {
    minWidth: 80,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(252, 38, 82, 0.1)",
  },
  optionLabel: {
    color: colors.text,
    fontSize: 32,
    fontWeight: "700",
  },
  optionLabelActive: {
    color: colors.primary,
  },
});
