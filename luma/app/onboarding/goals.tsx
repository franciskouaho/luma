import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

const objectives = [
  {
    id: "community",
    title: "Booster ma communauté",
    description: "Accélérer la croissance d'abonnés qualifiés",
    icon: "people-outline",
  },
  {
    id: "sales",
    title: "Vendre plus",
    description: "Transformer mon audience en clients récurrents",
    icon: "cart-outline",
  },
  {
    id: "authority",
    title: "Devenir une référence",
    description: "Imposer ma signature créative sur ma niche",
    icon: "ribbon-outline",
  },
];

export default function OnboardingGoals() {
  const router = useRouter();
  const [selectedObjective, setSelectedObjective] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectObjective = (objectiveId: string) => {
    if (isTransitioning) return;
    setSelectedObjective(objectiveId);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/onboarding/posting");
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
          <OnboardingHeader currentStep={2} totalSteps={8} />
          <View style={styles.heading}>
            <Text style={styles.title}>Quel est ton objectif principal ?</Text>
            <Text style={styles.subtitle}>
              Dis-nous ce que tu veux accomplir. Nous adapterons notre accompagnement et
              nos suggestions pour atteindre ce résultat.
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ton objectif principal</Text>
              <View style={styles.cardList}>
                {objectives.map((objective) => {
                  const active = selectedObjective === objective.id;
                  return (
                    <TouchableOpacity
                      key={objective.id}
                      onPress={() => handleSelectObjective(objective.id)}
                      style={[
                        styles.objectiveCard,
                        active && styles.objectiveCardActive,
                      ]}
                    >
                      <Ionicons
                        name={objective.icon as any}
                        size={20}
                        color={active ? colors.background : colors.text}
                        style={[
                          styles.optionIcon,
                          active && styles.optionIconActive,
                        ]}
                      />
                      <View style={styles.objectiveText}>
                        <Text
                          style={[
                            styles.objectiveTitle,
                            active && styles.objectiveTitleActive,
                          ]}
                        >
                          {objective.title}
                        </Text>
                        <Text style={styles.objectiveDescription}>
                          {objective.description}
                        </Text>
                      </View>
                      {active && (
                        <Text style={styles.objectiveBadge}>
                          + Accès aux templates prêts à poster
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.proTeaser}>
              <Text style={styles.proTitle}>Avec Luma Pro</Text>
              <Text style={styles.proText}>
                Tu reçois chaque semaine un plan d’action personnalisé avec les meilleurs
                horaires de publication et les formats qui convertissent.
              </Text>
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
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  cardList: {
    gap: spacing.md,
  },
  objectiveCard: {
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
  objectiveCardActive: {
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
  objectiveText: {
    flex: 1,
    gap: spacing.xs,
  },
  objectiveTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  objectiveTitleActive: {
    color: colors.primary,
  },
  objectiveDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  objectiveBadge: {
    color: colors.text,
    fontSize: 13,
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
});


