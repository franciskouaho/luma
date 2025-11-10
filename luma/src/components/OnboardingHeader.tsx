import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { colors, spacing } from "../theme/colors";
import { OnboardingProgress } from "./OnboardingProgress";

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
  showBack?: boolean;
  onBackPress?: () => void;
}

export function OnboardingHeader({
  currentStep,
  totalSteps,
  showBack = true,
  onBackPress,
}: OnboardingHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      {showBack && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </TouchableOpacity>
      )}
      <View style={styles.progressWrapper}>
        <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: spacing.sm,
    paddingTop: 0,
    paddingBottom: spacing.xs,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  progressWrapper: {
    flex: 1,
  },
});


