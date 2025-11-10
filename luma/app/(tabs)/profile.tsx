import Ionicons from "@expo/vector-icons/Ionicons";
import auth from "@react-native-firebase/auth";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { borderRadius, colors, spacing } from "../../src/theme/colors";

const stats = [
  { id: "ideas", value: "36", label: "Idées créées", icon: "bulb" as const },
  { id: "analyses", value: "12", label: "Analyses", icon: "analytics" as const },
  { id: "favorites", value: "8", label: "Favoris", icon: "heart" as const },
];

const shortcuts = [
  { id: "analytics", label: "Analyses", icon: "stats-chart" as const, color: "#00ACC1" },
  { id: "ideas", label: "Mes idées", icon: "bulb" as const, color: colors.primary },
  { id: "library", label: "Bibliothèque", icon: "folder" as const, color: "#D946A6" },
];

const menuSections = [
  {
    title: "Compte",
    items: [
      {
        id: "account",
        title: "Informations personnelles",
        description: "Nom, email, photo de profil",
        icon: "person-outline" as const,
      },
      {
        id: "subscription",
        title: "Abonnement",
        description: "Plan Créateur · Gérer l'abonnement",
        icon: "card-outline" as const,
        badge: "Actif",
      },
    ],
  },
  {
    title: "Préférences",
    items: [
      {
        id: "notifications",
        title: "Notifications",
        description: "Push, email, alertes de tendances",
        icon: "notifications-outline" as const,
      },
      {
        id: "language",
        title: "Langue",
        description: "Français",
        icon: "language-outline" as const,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        id: "help",
        title: "Centre d'aide",
        description: "FAQ, guides et tutoriels",
        icon: "help-circle-outline" as const,
      },
      {
        id: "feedback",
        title: "Envoyer un feedback",
        description: "Aidez-nous à améliorer Luma",
        icon: "chatbubble-outline" as const,
      },
    ],
  },
  {
    title: "Développement",
    items: [
      {
        id: "onboarding",
        title: "Revoir l'onboarding",
        description: "Retourner au parcours d'intégration",
        icon: "play-circle-outline" as const,
      },
    ],
  },
];

export default function ProfileScreen() {
  const user = auth().currentUser;
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        {
          text: "Annuler",
          style: "cancel",
        },
        {
          text: "Se déconnecter",
          style: "destructive",
          onPress: async () => {
            try {
              await auth().signOut();
              router.replace("/auth/login");
            } catch (error) {
              Alert.alert(
                "Erreur",
                "Une erreur est survenue lors de la déconnexion. Veuillez réessayer."
              );
            }
          },
        },
      ]
    );
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileHeaderTop}>
            <Text style={styles.headerTitle}>Profil</Text>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="create-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              {user?.photoURL ? (
                <Image
                  source={{ uri: user.photoURL }}
                  style={styles.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarText}>
                    {user?.displayName?.[0]?.toUpperCase() ?? "C"}
                  </Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#00ACC1" />
              </View>
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.displayName ?? "Créateur"}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email ?? "email@exemple.com"}
              </Text>
            </View>

            <View style={styles.planBadge}>
              <LinearGradient
                colors={["rgba(252, 38, 82, 0.15)", "rgba(217, 70, 166, 0.15)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.planGradient}
              />
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.planText}>Plan Créateur</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsSection}>
          {stats.map((stat) => (
            <View key={stat.id} style={styles.statCard}>
              <View style={styles.statIconWrapper}>
                <Ionicons name={stat.icon} size={24} color={colors.primary} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accès rapide</Text>
          <View style={styles.shortcutsGrid}>
            {shortcuts.map((shortcut) => (
              <TouchableOpacity key={shortcut.id} style={styles.shortcutCard}>
                <View
                  style={[
                    styles.shortcutIcon,
                    { backgroundColor: `${shortcut.color}20` },
                  ]}
                >
                  <Ionicons name={shortcut.icon} size={24} color={shortcut.color} />
                </View>
                <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuList}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    itemIndex < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  onPress={() => {
                    if (item.id === "onboarding") {
                      router.push("/onboarding/experience");
                    }
                  }}
                >
                  <View style={styles.menuIconWrapper}>
                    <Ionicons
                      name={item.icon}
                      size={22}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.menuContent}>
                    <View style={styles.menuTitleRow}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      {item.badge && (
                        <View style={styles.menuBadge}>
                          <Text style={styles.menuBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.menuDescription}>{item.description}</Text>
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
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#FF5252" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Luma v1.0.0</Text>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 1.5,
    paddingBottom: 120,
    gap: spacing.xl,
  },
  profileHeader: {
    gap: spacing.lg,
  },
  profileHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.card + 2,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    gap: spacing.lg,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.text,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  profileInfo: {
    alignItems: "center",
    gap: spacing.xs,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  planBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
    borderWidth: 1,
    borderColor: "rgba(252, 38, 82, 0.3)",
    overflow: "hidden",
  },
  planGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  planText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  statsSection: {
    flexDirection: "row",
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.card,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    gap: spacing.sm,
  },
  statIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: "center",
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  shortcutsGrid: {
    flexDirection: "row",
    gap: spacing.md,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: borderRadius.card,
    paddingVertical: spacing.lg,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    gap: spacing.sm,
  },
  shortcutIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutLabel: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 13,
  },
  menuList: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  menuIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  menuTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  menuBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.card,
  },
  menuBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },
  menuDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    borderRadius: borderRadius.button,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.2)",
    marginTop: spacing.md,
  },
  logoutText: {
    color: "#FF5252",
    fontWeight: "700",
    fontSize: 15,
  },
  versionText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
