import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { analyzeProfile } from "../src/lib/functions";
import { colors, borderRadius, spacing } from "../src/theme/colors";
import { LinearGradient } from "expo-linear-gradient";
import type { AnalyticsInsight } from "../src/types/tiktok";

export default function AnalyticsScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [profileData, setProfileData] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!username.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un nom d'utilisateur TikTok");
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeProfile(username.trim());
      setProfileData(result.profile);
      setInsights(result.insights);
    } catch (error) {
      Alert.alert("Erreur", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "strength": return "✅";
      case "opportunity": return "💡";
      case "warning": return "⚠️";
      default: return "ℹ️";
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case "strength": return "#4CAF50";
      case "opportunity": return colors.secondary;
      case "warning": return "#FFC107";
      default: return colors.textSecondary;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.middle, colors.gradient.end]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtitle}>Analysez votre profil TikTok</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput style={styles.input} placeholder="Nom d'utilisateur TikTok (@username)" placeholderTextColor={colors.textSecondary} value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TouchableOpacity style={[styles.analyzeButton, loading && styles.analyzeButtonDisabled]} onPress={handleAnalyze} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.analyzeButtonText}>Analyser</Text>}
          </TouchableOpacity>
        </View>
        {profileData && (
          <View style={styles.profileCard}>
            <Text style={styles.profileUsername}>@{profileData.username}</Text>
            {profileData.bio && <Text style={styles.profileBio}>{profileData.bio}</Text>}
            <View style={styles.statsContainer}>
              <View style={styles.stat}><Text style={styles.statValue}>{profileData.followers?.toLocaleString() || "0"}</Text><Text style={styles.statLabel}>Abonnés</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>{profileData.following?.toLocaleString() || "0"}</Text><Text style={styles.statLabel}>Abonnements</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>{profileData.likes?.toLocaleString() || "0"}</Text><Text style={styles.statLabel}>J'aime</Text></View>
              <View style={styles.stat}><Text style={styles.statValue}>{profileData.videos?.toLocaleString() || "0"}</Text><Text style={styles.statLabel}>Vidéos</Text></View>
            </View>
          </View>
        )}
        {insights.length > 0 && (
          <View style={styles.insightsSection}>
            <Text style={styles.insightsTitle}>Insights</Text>
            {insights.map((insight, index) => (
              <View key={index} style={[styles.insightCard, { borderLeftColor: getInsightColor(insight.type) }]}>
                <View style={styles.insightHeader}>
                  <Text style={styles.insightIcon}>{getInsightIcon(insight.type)}</Text>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            ))}
          </View>
        )}
        {!loading && !profileData && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Entrez un nom d'utilisateur TikTok</Text>
            <Text style={styles.emptySubtext}>Découvrez vos forces et opportunités de croissance</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gradient: { position: "absolute", left: 0, right: 0, top: 0, height: "100%", opacity: 0.05 },
  scrollView: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingTop: spacing.xl * 2 },
  header: { marginBottom: spacing.xl },
  backButton: { fontSize: 16, color: colors.textSecondary, marginBottom: spacing.md },
  title: { fontSize: 32, fontWeight: "800", color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  searchContainer: { gap: spacing.md, marginBottom: spacing.xl },
  input: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: borderRadius.card, padding: spacing.md, fontSize: 16, color: colors.text },
  analyzeButton: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: borderRadius.button, alignItems: "center" },
  analyzeButtonDisabled: { opacity: 0.5 },
  analyzeButtonText: { fontSize: 18, fontWeight: "700", color: colors.text },
  profileCard: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", borderRadius: borderRadius.card, padding: spacing.lg, marginBottom: spacing.xl },
  profileUsername: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  profileBio: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, lineHeight: 20 },
  statsContainer: { flexDirection: "row", justifyContent: "space-around", paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: "rgba(255, 255, 255, 0.1)" },
  stat: { alignItems: "center" },
  statValue: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.xs },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  insightsSection: { gap: spacing.md },
  insightsTitle: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  insightCard: { backgroundColor: "rgba(255, 255, 255, 0.05)", borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", borderLeftWidth: 4, borderRadius: borderRadius.card, padding: spacing.lg, gap: spacing.sm },
  insightHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  insightIcon: { fontSize: 24 },
  insightTitle: { fontSize: 18, fontWeight: "700", color: colors.text, flex: 1 },
  insightDescription: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingVertical: spacing.xl * 2 },
  emptyIcon: { fontSize: 64, marginBottom: spacing.md },
  emptyText: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.xs, textAlign: "center" },
  emptySubtext: { fontSize: 16, color: colors.textSecondary, textAlign: "center" },
});
