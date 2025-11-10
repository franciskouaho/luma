import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { borderRadius, colors, spacing } from "../../src/theme/colors";

type Idea = {
  id: string;
  title: string;
  description: string;
  category: string;
  updatedAt: string;
  tags: string[];
  isFavorite?: boolean;
};

const filterOptions = ["Tous", "Favoris", "Stories", "Challenges"];

export default function IdeasScreen() {
  const [selectedFilter, setSelectedFilter] = useState("Tous");

  const ideas = useMemo<Idea[]>(
    () => [
      {
        id: "idea-1",
        title: "Série de reels « Dans les coulisses »",
        description:
          "3 épisodes pour montrer les étapes de création d'un produit en moins de 20 secondes par vidéo.",
        category: "Stories",
        updatedAt: "Il y a 2h",
        tags: ["coulisses", "authenticité", "reels"],
        isFavorite: true,
      },
      {
        id: "idea-2",
        title: "Challenge TikTok 7 jours",
        description:
          "Un défi quotidien autour d'une thématique pour engager la communauté avec un hashtag dédié.",
        category: "Challenges",
        updatedAt: "8 novembre",
        tags: ["challenge", "tiktok", "engagement"],
        isFavorite: false,
      },
      {
        id: "idea-3",
        title: "FAQ interactive avec sondage",
        description:
          "Demandez aux abonnés leurs questions, sélectionnez-en 5 et répondez-y dans une vidéo dynamique.",
        category: "Community",
        updatedAt: "5 novembre",
        tags: ["faq", "interaction", "stories"],
        isFavorite: true,
      },
    ],
    []
  );

  const categoryColors: Record<string, string> = {
    Stories: colors.primary,
    Challenges: "#FF9800",
    Community: "#00ACC1",
  };

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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Mes Idées</Text>
            <Text style={styles.subtitle}>{ideas.length} idées sauvegardées</Text>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          {filterOptions.map((filter) => {
            const isSelected = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[styles.filterText, isSelected && styles.filterTextSelected]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <FlatList
        data={ideas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const categoryColor = categoryColors[item.category] || colors.primary;
          return (
            <TouchableOpacity style={styles.ideaCard}>
              <View style={styles.ideaCardHeader}>
                <View style={styles.categoryBadge}>
                  <View
                    style={[styles.categoryDot, { backgroundColor: categoryColor }]}
                  />
                  <Text style={[styles.categoryText, { color: categoryColor }]}>
                    {item.category}
                  </Text>
                </View>
                <View style={styles.ideaActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons
                      name={item.isFavorite ? "heart" : "heart-outline"}
                      size={20}
                      color={item.isFavorite ? colors.primary : colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons
                      name="ellipsis-horizontal"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.ideaTitle}>{item.title}</Text>
              <Text style={styles.ideaDescription} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.ideaFooter}>
                <View style={styles.tagList}>
                  {item.tags.slice(0, 2).map((tag) => (
                    <View key={tag} style={styles.tag}>
                      <Text style={styles.tagText}>#{tag}</Text>
                    </View>
                  ))}
                  {item.tags.length > 2 && (
                    <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
                  )}
                </View>

                <View style={styles.timestampContainer}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.timestamp}>{item.updatedAt}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="bulb-outline" size={48} color={colors.textSecondary} />
            </View>
            <Text style={styles.emptyTitle}>Aucune idée pour le moment</Text>
            <Text style={styles.emptyText}>
              Génère ta première idée de contenu viral avec l'IA
            </Text>
            <TouchableOpacity style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Générer une idée</Text>
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={
          ideas.length > 0 ? (
            <View style={styles.footer}>
              <Ionicons name="sparkles" size={20} color={colors.primary} />
              <Text style={styles.footerText}>
                Besoin d'inspiration ? Génère une nouvelle idée personnalisée
              </Text>
            </View>
          ) : null
        }
      />
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  filtersRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  filterTextSelected: {
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  ideaCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.card + 2,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: spacing.md,
  },
  ideaCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.button,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ideaActions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  ideaTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 24,
  },
  ideaDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  ideaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xs,
  },
  tagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    flex: 1,
  },
  tag: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: borderRadius.card,
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  moreTagsText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
    paddingHorizontal: spacing.xs,
  },
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs / 2,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl * 3,
    gap: spacing.md,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: spacing.xl,
  },
  emptyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
  },
  emptyButtonText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
  },
  footer: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  footerText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
