import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { borderRadius, colors, spacing } from "../../src/theme/colors";

export default function ViralityScore() {
  const router = useRouter();

  const handleFinish = () => {
    router.push("/onboarding/notifications");
  };

  const viralityScore = 91;

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
        <View style={styles.content}>
          <Text style={styles.title}>Score de viralité : {viralityScore}</Text>

          <View style={styles.chartCard}>
            <Text style={styles.chartLabel}>Nombre de vues</Text>

            <View style={styles.chartContainer}>
              {/* Y-axis labels */}
              <View style={styles.yAxisLabels}>
                <Text style={styles.yAxisLabel}>x48</Text>
                <Text style={styles.yAxisLabel}>x11</Text>
                <Text style={styles.yAxisLabel}>x4</Text>
                <Text style={styles.yAxisLabel}>x0</Text>
              </View>

              {/* Chart bars */}
              <View style={styles.barsContainer}>
                <View style={styles.barGroup}>
                  <View style={[styles.bar, { height: 0 }]} />
                  <Text style={styles.barLabel}>Jour 1</Text>
                </View>
                <View style={styles.barGroup}>
                  <View style={[styles.bar, { height: 40 }]} />
                  <Text style={styles.barLabel}>Jour 7</Text>
                </View>
                <View style={styles.barGroup}>
                  <View style={[styles.bar, { height: 90 }]} />
                  <Text style={styles.barLabel}>Jour 14</Text>
                </View>
                <View style={styles.barGroup}>
                  <View style={[styles.bar, { height: 160 }]} />
                  <Text style={styles.barLabel}>Jour 30</Text>
                  <View style={styles.growthArrow}>
                    <Text style={styles.arrowText}>📈</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.messageCard}>
            <Text style={styles.messageTitle}>Fais exploser tes vues</Text>
            <Text style={styles.messageText}>
              Ton compte a un énorme potentiel.{"\n"}
              En suivant ton plan d'action fait par l'IA, il va exploser dans
              les prochaines semaines.
            </Text>
          </View>
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleFinish}>
            <Text style={styles.primaryButtonText}>ATTEINDRE MON POTENTIEL</Text>
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
    gap: spacing.xl,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
  },
  chartCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  chartLabel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: spacing.md,
  },
  chartContainer: {
    flexDirection: "row",
    height: 200,
    gap: spacing.md,
  },
  yAxisLabels: {
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  yAxisLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  barsContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingBottom: spacing.lg,
  },
  barGroup: {
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  bar: {
    width: 40,
    backgroundColor: colors.primary,
    borderRadius: 6,
    minHeight: 4,
  },
  barLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  growthArrow: {
    position: "absolute",
    top: -30,
    right: 0,
  },
  arrowText: {
    fontSize: 24,
  },
  messageCard: {
    backgroundColor: "rgba(252, 38, 82, 0.1)",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(252, 38, 82, 0.3)",
    padding: spacing.lg,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  messageTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  messageText: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
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
  primaryButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
