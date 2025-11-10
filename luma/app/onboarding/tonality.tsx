import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

const tones = [
  {
    id: "bold",
    title: "Impact & punchlines",
    hook: "Parfait pour des hooks qui claquent dès les 3 premières secondes.",
    icon: "megaphone-outline",
  },
  {
    id: "warm",
    title: "Chaleureux & accessible",
    hook: "Humanise ton message et crée une connexion immédiate.",
    icon: "chatbubbles-outline",
  },
  {
    id: "expert",
    title: "Expert & premium",
    hook: "Assoie ta crédibilité et rassure ton audience haut de gamme.",
    icon: "ribbon-outline",
  },
];

export default function OnboardingTonality() {
  const router = useRouter();
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectTone = (toneId: string) => {
    if (isTransitioning) return;
    setSelectedTone(toneId);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/onboarding/analysis");
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
          <OnboardingHeader currentStep={6} totalSteps={8} />
          <View style={styles.heading}>
            <Text style={styles.title}>Quelle tonalité adopter ?</Text>
            <Text style={styles.subtitle}>
              Choisis la vibe qui te ressemble : Luma Pro adaptera les scripts, les CTA et
              les transitions pour être en phase avec ton audience.
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.cardList}>
              {tones.map((tone) => {
                const active = selectedTone === tone.id;
                return (
                  <TouchableOpacity
                    key={tone.id}
                    onPress={() => handleSelectTone(tone.id)}
                    style={[styles.card, active && styles.cardActive]}
                  >
                    <Ionicons
                      name={tone.icon as any}
                      size={20}
                      color={active ? colors.background : colors.text}
                      style={[styles.cardIcon, active && styles.cardIconActive]}
                    />
                    <View style={styles.cardText}>
                      <Text
                        style={[
                          styles.cardTitle,
                          active && styles.cardTitleActive,
                        ]}
                      >
                        {tone.title}
                      </Text>
                      <Text style={styles.cardDescription}>{tone.hook}</Text>
                    </View>
                    {active && (
                      <Text style={styles.cardBadge}>
                        Luma Pro pré-écrit tes scripts avec cette tonalité.
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.proTeaser}>
              <Text style={styles.proTitle}>Scripts alignés à ta voix</Text>
              <Text style={styles.proText}>
                Chaque recommandation de Luma Pro respecte ton ton, tes expressions et ta
                manière de raconter des histoires.
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
  cardList: {
    gap: spacing.md,
  },
  card: {
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
  cardActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(252, 38, 82, 0.12)",
  },
  cardIcon: {
    width: 40,
    textAlign: "center",
  },
  cardIconActive: {
    color: colors.primary,
  },
  cardText: {
    flex: 1,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardTitleActive: {
    color: colors.primary,
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cardBadge: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 40,
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


