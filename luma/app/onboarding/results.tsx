import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { borderRadius, colors, spacing } from "../../src/theme/colors";

export default function OnboardingResults() {
  const router = useRouter();

  const handleContinue = () => {
    router.push("/onboarding/virality-score");
  };

  // Données mockées pour l\u2019exemple
  const profileData = {
    username: "@username",
    followers: "419",
    following: "493",
    likes: "1.3K",
    niche: "Food content Paris — pâtisserie & restaurants",
    summary: `Tu as un œil pour la gourmandise parisienne et un début de communauté engagée. Ton compte oscille entre découvertes locales et passion pâtisserie, mais l\u2019algo ne t\u2019a propulsé qu\u2019une seule fois (49K vues sur le Trompé l\u2019œil). Le reste stagne sous 2K vues. Ton problème n\u2019est pas le sujet, c\u2019est l\u2019exécution : tes vidéos manquent de pattern interrupt, tes hooks n\u2019accrochent pas assez vite, et tu n\u2019exploites pas les formats qui convertissent. Tu as le potentiel pour devenir LA référence food Paris, mais il te faut une stratégie de contenu structurée et des scripts qui retiennent dès la 1ère seconde.`,
    strengths: [
      "1 vidéo virale prouve que l\u2019algo t\u2019aime sur certains topics",
      "Engagement fort : ratio likes/followers à 2,65x",
      "Niche food Paris claire, communauté locale fidèle",
    ],
    weaknesses: [
      "Topics trop larges, manque d\u2019angles viraux précis",
      "Pas de format récurrent, durées incohérentes",
      "Hooks faibles, pas de script optimisé pour retenir",
    ],
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
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color={colors.text} />
            </View>
            <Text style={styles.username}>{profileData.username}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profileData.followers}</Text>
              <Text style={styles.statLabel}>Abonnements</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profileData.following}</Text>
              <Text style={styles.statLabel}>Abonnés</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{profileData.likes}</Text>
              <Text style={styles.statLabel}>J\u2019aime</Text>
            </View>
          </View>

          <View style={styles.analysisBadge}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.analysisBadgeText}>Généré par IA</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Niche</Text>
          <Text style={styles.sectionContent}>{profileData.niche}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <Text style={styles.sectionContent}>{profileData.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points forts</Text>
          {profileData.strengths.map((strength, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{strength}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Points faibles</Text>
          {profileData.weaknesses.map((weakness, index) => (
            <View key={index} style={styles.bulletPoint}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{weakness}</Text>
            </View>
          ))}
        </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
            <Text style={styles.primaryButtonText}>VOIR MON POTENTIEL</Text>
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
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: spacing.lg,
    gap: spacing.md,
  },
  profileHeader: {
    alignItems: "center",
    gap: spacing.sm,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  username: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: spacing.md,
  },
  stat: {
    alignItems: "center",
    gap: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  analysisBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    backgroundColor: "rgba(252, 38, 82, 0.15)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.button,
  },
  analysisBadgeText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionContent: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  bulletPoint: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingLeft: spacing.sm,
  },
  bullet: {
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
  },
  bulletText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 24,
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
