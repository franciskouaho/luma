import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { OnboardingHeader } from "../../src/components/OnboardingHeader";
import { borderRadius, colors, spacing } from "../../src/theme/colors";

const contentStyles = [
  {
    id: "educational",
    title: "Educatif & concret",
    description: "Des tutoriels, des astuces, des frameworks à succès.",
    icon: "bulb-outline",
  },
  {
    id: "entertaining",
    title: "Divertissant & viral",
    description: "Des formats fun, challenges, storytelling mémorable.",
    icon: "color-palette-outline",
  },
  {
    id: "inspirational",
    title: "Inspiration & lifestyle",
    description: "Des coulisses, routines et témoignages inspirants.",
    icon: "planet-outline",
  },
];

export default function OnboardingStrategy() {
  const router = useRouter();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelectStyle = (styleId: string) => {
    if (isTransitioning) return;
    setSelectedStyle(styleId);
    setIsTransitioning(true);
    setTimeout(() => {
      router.push("/onboarding/tonality");
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
          <OnboardingHeader currentStep={5} totalSteps={8} />
          <View style={styles.heading}>
            <Text style={styles.title}>Quel style de contenu te définit ?</Text>
            <Text style={styles.subtitle}>
              Nous adaptons les scripts, les transitions et les CTA pour coller à ta
              signature créative sur TikTok.
            </Text>
          </View>

          <View style={styles.bottomSection}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Style de contenu</Text>
              <View style={styles.cardList}>
                {contentStyles.map((style) => {
                  const active = selectedStyle === style.id;
                  return (
                    <TouchableOpacity
                      key={style.id}
                      onPress={() => handleSelectStyle(style.id)}
                      style={[styles.card, active && styles.cardActive]}
                    >
                      <Ionicons
                        name={style.icon as any}
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
                          {style.title}
                        </Text>
                        <Text style={styles.cardDescription}>
                          {style.description}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.proTeaser}>
              <Text style={styles.proTitle}>Pourquoi les créateurs restent ?</Text>
              <Text style={styles.proText}>
                Chaque recommandation Luma Pro est testée et optimisée par notre studio.
                Tu reçois des inspirations qui matchent vraiment ta marque.
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


