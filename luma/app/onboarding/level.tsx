import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

const levelOptions = [
  {
    id: "1k",
    label: "1 000 vues",
    icon: "eye-outline",
  },
  {
    id: "10k",
    label: "10 000 vues",
    icon: "eye-outline",
  },
  {
    id: "100k",
    label: "100 000 vues",
    icon: "eye-outline",
  },
  {
    id: "1m",
    label: "1M vues",
    icon: "sparkles-outline",
  },
];

export default function OnboardingLevel() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectOption = (optionId: string) => {
    if (isTransitioning) return;
    setSelectedOption(optionId);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/onboarding/virality");
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
        <OnboardingHeader currentStep={5} totalSteps={10} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.body}>
            <View style={styles.heading}>
              <Text style={styles.title}>À quel niveau tu bloques ?</Text>
            </View>

            <View style={styles.options}>
              {levelOptions.map((option) => {
                const active = selectedOption === option.id;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleSelectOption(option.id)}
                    style={[styles.optionCard, active && styles.optionCardActive]}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={active ? colors.primary : colors.text}
                      style={styles.optionIcon}
                    />
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
    lineHeight: 36,
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    gap: spacing.md,
  },
  optionCardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(252, 38, 82, 0.1)",
  },
  optionIcon: {
    width: 32,
  },
  optionLabel: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 24,
  },
  optionLabelActive: {
    color: colors.primary,
  },
});
