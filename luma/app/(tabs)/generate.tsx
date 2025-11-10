import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { borderRadius, colors, spacing } from "../../src/theme/colors";

const contentCategories = [
  { id: "tutorial", label: "Tutoriel", icon: "school" as const, color: "#00ACC1" },
  { id: "story", label: "Story", icon: "book" as const, color: "#D946A6" },
  { id: "challenge", label: "Challenge", icon: "trophy" as const, color: "#FF9800" },
  { id: "review", label: "Review", icon: "star" as const, color: "#5E7CE2" },
];

const toneOptions = [
  { id: "fun", label: "Fun & Léger" },
  { id: "professional", label: "Professionnel" },
  { id: "motivational", label: "Motivant" },
  { id: "educational", label: "Éducatif" },
];

const generationHistory = [
  {
    id: "1",
    title: "10 accroches pour reels beauté",
    category: "Tutorial",
    date: "Aujourd'hui · 09:42",
    status: "completed" as const,
  },
  {
    id: "2",
    title: "Storyboard vidéo FAQ client",
    category: "Story",
    date: "Hier · 18:23",
    status: "completed" as const,
  },
];

export default function GenerateScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [topic, setTopic] = useState("");

  return (
    <View style={styles.container}>
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Générer</Text>
          <Text style={styles.headerSubtitle}>
            Crée du contenu viral avec l'IA en quelques secondes
          </Text>
        </View>

        {/* Main Generation Card */}
        <View style={styles.generationCard}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <Ionicons name="sparkles" size={24} color={colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Nouvelle génération</Text>
          </View>

          {/* Topic Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>De quoi veux-tu parler ?</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ex: mes recettes de pâtisserie..."
                placeholderTextColor={colors.textSecondary}
                value={topic}
                onChangeText={setTopic}
                multiline
              />
            </View>
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Type de contenu</Text>
            <View style={styles.categoriesGrid}>
              {contentCategories.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardSelected,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        { backgroundColor: isSelected ? category.color : `${category.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={category.icon}
                        size={20}
                        color={isSelected ? colors.text : category.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryLabel,
                        isSelected && styles.categoryLabelSelected,
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Tone Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tonalité</Text>
            <View style={styles.tonesGrid}>
              {toneOptions.map((tone) => {
                const isSelected = selectedTone === tone.id;
                return (
                  <TouchableOpacity
                    key={tone.id}
                    style={[
                      styles.toneChip,
                      isSelected && styles.toneChipSelected,
                    ]}
                    onPress={() => setSelectedTone(tone.id)}
                  >
                    <Text
                      style={[
                        styles.toneText,
                        isSelected && styles.toneTextSelected,
                      ]}
                    >
                      {tone.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[
              styles.generateButton,
              (!topic || !selectedCategory || !selectedTone) &&
                styles.generateButtonDisabled,
            ]}
            disabled={!topic || !selectedCategory || !selectedTone}
          >
            <Ionicons name="flash" size={20} color={colors.text} />
            <Text style={styles.generateButtonText}>Générer des idées</Text>
          </TouchableOpacity>
        </View>

        {/* History Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Historique</Text>
            <TouchableOpacity>
              <Text style={styles.historyLink}>Tout voir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.historyList}>
            {generationHistory.map((item) => (
              <TouchableOpacity key={item.id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                  <Ionicons name="document-text" size={20} color={colors.primary} />
                </View>
                <View style={styles.historyContent}>
                  <Text style={styles.historyItemTitle}>{item.title}</Text>
                  <View style={styles.historyMeta}>
                    <View style={styles.historyBadge}>
                      <Text style={styles.historyBadgeText}>{item.category}</Text>
                    </View>
                    <Text style={styles.historyDate}>{item.date}</Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    opacity: 0.08,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: 120,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  generationCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.card + 4,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  inputSection: {
    gap: spacing.sm,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    padding: spacing.md,
    gap: spacing.sm,
  },
  inputIcon: {
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    minHeight: 60,
    maxHeight: 120,
    textAlignVertical: "top",
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: borderRadius.card,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    gap: spacing.sm,
  },
  categoryCardSelected: {
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  categoryLabelSelected: {
    color: colors.text,
  },
  tonesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  toneChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  toneChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toneText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  toneTextSelected: {
    color: colors.text,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.button,
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  generateButtonDisabled: {
    opacity: 0.4,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  historySection: {
    gap: spacing.md,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  historyLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: borderRadius.card,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    gap: spacing.md,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  historyContent: {
    flex: 1,
    gap: spacing.xs,
  },
  historyItemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  historyMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  historyBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.card,
  },
  historyBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
