import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { colors } from "../theme/colors";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({
  currentStep,
  totalSteps,
}: OnboardingProgressProps) {
  const [trackWidth, setTrackWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const clampedStep = Math.min(Math.max(currentStep, 0), totalSteps);
  const progressWidth =
    totalSteps > 0 ? (trackWidth * clampedStep) / totalSteps : 0;

  return (
    <View style={styles.container}>
      <View style={styles.track} onLayout={handleLayout}>
        {progressWidth > 0 && (
          <LinearGradient
            colors={[
              colors.gradient.start,
              colors.gradient.middle,
              colors.gradient.end,
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progress, { width: progressWidth }]}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  track: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    overflow: "hidden",
  },
  progress: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 999,
  },
});


