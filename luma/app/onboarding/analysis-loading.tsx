import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { colors, spacing } from "../../src/theme/colors";

export default function AnalysisLoading() {
  const router = useRouter();
  const [progress] = useState(new Animated.Value(0));
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 100,
      duration: 3000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        router.push("/onboarding/results");
      }, 300);
    });

    const listener = progress.addListener(({ value }) => {
      setDisplayProgress(Math.round(value));
    });

    return () => {
      progress.removeListener(listener);
    };
  }, []);

  const rotation = progress.interpolate({
    inputRange: [0, 100],
    outputRange: ["0deg", "360deg"],
  });

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

      <OnboardingHeader currentStep={9} totalSteps={10} showBack={false} />

        <View style={styles.content}>
          <View style={styles.main}>
            <Text style={styles.title}>Analyse en cours...</Text>
            <Text style={styles.subtitle}>
              Analyse de ton compte en cours...
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressCircle}>
                <Animated.View
                  style={[
                    styles.progressSpinner,
                    { transform: [{ rotate: rotation }] },
                  ]}
                >
                  <View style={styles.spinnerSegment} />
                </Animated.View>
                <View style={styles.progressText}>
                  <Text style={styles.progressNumber}>{displayProgress}%</Text>
                </View>
              </View>
            </View>

            <Text style={styles.hint}>
              Patiente quelques secondes : on prépare ton plan personnalisé
            </Text>
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
    gap: spacing.xl,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: "center",
  },
  progressContainer: {
    marginVertical: spacing.xl * 2,
    alignItems: "center",
  },
  progressCircle: {
    width: 200,
    height: 200,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  progressSpinner: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  spinnerSegment: {
    position: "absolute",
    top: -8,
    left: "50%",
    marginLeft: -4,
    width: 8,
    height: 60,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressNumber: {
    color: colors.text,
    fontSize: 48,
    fontWeight: "800",
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
    lineHeight: 22,
  },
});
