/**
 * Configuration des plans et leurs limites
 */

export type PlanType = 'starter' | 'professional' | 'premium';

export interface PlanLimits {
  // Comptes sociaux
  maxAccounts: number | null; // null = illimité

  // Publications
  maxPublicationsPerMonth: number | null; // null = illimité

  // Crédits IA
  aiCreditsPerMonth: number;

  // Équipe
  maxTeamMembers: number | null; // null = illimité

  // Analytics
  hasAdvancedAnalytics: boolean;
  hasReports: boolean;

  // Fonctionnalités
  features: {
    scheduling: boolean;
    carousel: boolean;
    reels: boolean;
    stories: boolean;
    videos: boolean;
    bulkUpload: boolean;
    customBranding: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
    whiteLabel: boolean;
  };
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  starter: {
    maxAccounts: 5,
    maxPublicationsPerMonth: 500,
    aiCreditsPerMonth: 50,
    maxTeamMembers: 1, // Juste le propriétaire
    hasAdvancedAnalytics: false,
    hasReports: false,
    features: {
      scheduling: true,
      carousel: true,
      reels: true,
      stories: true,
      videos: true,
      bulkUpload: false,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
    },
  },
  professional: {
    maxAccounts: 15,
    maxPublicationsPerMonth: null, // Illimité
    aiCreditsPerMonth: 250,
    maxTeamMembers: 3,
    hasAdvancedAnalytics: true,
    hasReports: false,
    features: {
      scheduling: true,
      carousel: true,
      reels: true,
      stories: true,
      videos: true,
      bulkUpload: true,
      customBranding: false,
      apiAccess: false,
      prioritySupport: false,
      whiteLabel: false,
    },
  },
  premium: {
    maxAccounts: null, // Illimité
    maxPublicationsPerMonth: null, // Illimité
    aiCreditsPerMonth: 3000,
    maxTeamMembers: null, // Illimité
    hasAdvancedAnalytics: true,
    hasReports: true,
    features: {
      scheduling: true,
      carousel: true,
      reels: true,
      stories: true,
      videos: true,
      bulkUpload: true,
      customBranding: true,
      apiAccess: true,
      prioritySupport: true,
      whiteLabel: true,
    },
  },
};

/**
 * Récupérer les limites d'un plan
 */
export function getPlanLimits(plan: PlanType): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.starter;
}

/**
 * Vérifier si un plan a accès à une fonctionnalité
 */
export function hasFeatureAccess(
  plan: PlanType,
  feature: keyof PlanLimits['features']
): boolean {
  const limits = getPlanLimits(plan);
  return limits.features[feature];
}

/**
 * Vérifier si une limite est atteinte
 */
export function isLimitReached(
  plan: PlanType,
  limitType: 'accounts' | 'publications' | 'teamMembers',
  currentValue: number
): boolean {
  const limits = getPlanLimits(plan);

  switch (limitType) {
    case 'accounts':
      return limits.maxAccounts !== null && currentValue >= limits.maxAccounts;
    case 'publications':
      return limits.maxPublicationsPerMonth !== null && currentValue >= limits.maxPublicationsPerMonth;
    case 'teamMembers':
      return limits.maxTeamMembers !== null && currentValue >= limits.maxTeamMembers;
    default:
      return false;
  }
}

/**
 * Obtenir le message d'upgrade pour une limite atteinte
 */
export function getUpgradeMessage(
  plan: PlanType,
  limitType: 'accounts' | 'publications' | 'teamMembers' | 'feature'
): string {
  const nextPlan = plan === 'starter' ? 'Pro' : 'Premium';

  switch (limitType) {
    case 'accounts':
      return `Vous avez atteint la limite de comptes sociaux du plan ${plan}. Passez au plan ${nextPlan} pour ajouter plus de comptes.`;
    case 'publications':
      return `Vous avez atteint la limite de publications du plan ${plan}. Passez au plan ${nextPlan} pour des publications illimitées.`;
    case 'teamMembers':
      return `Vous avez atteint la limite de membres d'équipe du plan ${plan}. Passez au plan ${nextPlan} pour ajouter plus de membres.`;
    case 'feature':
      return `Cette fonctionnalité n'est pas disponible dans le plan ${plan}. Passez au plan ${nextPlan} pour y accéder.`;
    default:
      return `Passez au plan ${nextPlan} pour débloquer cette fonctionnalité.`;
  }
}

/**
 * Obtenir le nom du plan formaté
 */
export function getPlanName(plan: PlanType): string {
  const names: Record<PlanType, string> = {
    starter: 'Starter',
    professional: 'Pro',
    premium: 'Premium',
  };
  return names[plan] || 'Starter';
}

/**
 * Obtenir la couleur du plan
 */
export function getPlanColor(plan: PlanType): string {
  const colors: Record<PlanType, string> = {
    starter: '#6B7280', // gray
    professional: '#9B6BFF', // purple
    premium: '#F59E0B', // amber
  };
  return colors[plan] || '#6B7280';
}
