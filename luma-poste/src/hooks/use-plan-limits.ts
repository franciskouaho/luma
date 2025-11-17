'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './use-auth';
import {
  PlanType,
  PlanLimits,
  getPlanLimits,
  hasFeatureAccess,
  isLimitReached,
  getUpgradeMessage,
  getPlanName,
  getPlanColor,
} from '@/lib/plans';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export interface UsePlanLimitsReturn {
  // Plan info
  plan: PlanType;
  planName: string;
  planColor: string;
  limits: PlanLimits;

  // Loading states
  loading: boolean;

  // Usage stats
  currentUsage: {
    accounts: number;
    publications: number;
    teamMembers: number;
    aiCredits: number;
  };

  // Permission checks
  canAddAccount: boolean;
  canAddPublication: boolean;
  canAddTeamMember: boolean;
  hasAICredits: boolean;

  // Helper functions
  checkFeatureAccess: (feature: keyof PlanLimits['features']) => boolean;
  checkLimitReached: (limitType: 'accounts' | 'publications' | 'teamMembers') => boolean;
  getUpgradeMsg: (limitType: 'accounts' | 'publications' | 'teamMembers' | 'feature') => string;

  // Refresh function
  refresh: () => Promise<void>;
}

export function usePlanLimits(): UsePlanLimitsReturn {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanType>('starter');
  const [loading, setLoading] = useState(true);
  const [currentUsage, setCurrentUsage] = useState({
    accounts: 0,
    publications: 0,
    teamMembers: 1,
    aiCredits: 0,
  });

  const limits = getPlanLimits(plan);
  const planName = getPlanName(plan);
  const planColor = getPlanColor(plan);

  const fetchPlanAndUsage = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Récupérer le plan de l'utilisateur
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      // Si l'utilisateur a un code promo beta, forcer le plan starter avec restrictions
      const hasBetaPromo = userData?.promoCode && 
        (userData.promoCode.toUpperCase().includes('BETA') || 
         userData.promoCode.toUpperCase().startsWith('BETA'));
      
      const userPlan = hasBetaPromo ? 'starter' : ((userData?.plan || 'starter') as PlanType);
      setPlan(userPlan);

      // Récupérer les stats d'utilisation
      // TODO: Implémenter la récupération réelle des stats depuis Firestore
      // Pour l'instant, on utilise des valeurs par défaut

      // Compter les comptes connectés
      const accountsSnapshot = await getDoc(doc(db, 'stats', `${user.uid}_usage`));
      const statsData = accountsSnapshot.data();

      setCurrentUsage({
        accounts: statsData?.accountsCount || 0,
        publications: statsData?.publicationsThisMonth || 0,
        teamMembers: statsData?.teamMembersCount || 1,
        aiCredits: statsData?.aiCreditsUsed || 0,
      });
    } catch (error) {
      console.error('Error fetching plan limits:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanAndUsage();
  }, [user]);

  const canAddAccount = !isLimitReached(plan, 'accounts', currentUsage.accounts);
  const canAddPublication = !isLimitReached(plan, 'publications', currentUsage.publications);
  const canAddTeamMember = !isLimitReached(plan, 'teamMembers', currentUsage.teamMembers);
  const hasAICredits = currentUsage.aiCredits < limits.aiCreditsPerMonth;

  return {
    plan,
    planName,
    planColor,
    limits,
    loading,
    currentUsage,
    canAddAccount,
    canAddPublication,
    canAddTeamMember,
    hasAICredits,
    checkFeatureAccess: (feature) => hasFeatureAccess(plan, feature),
    checkLimitReached: (limitType) => isLimitReached(plan, limitType, currentUsage[limitType]),
    getUpgradeMsg: (limitType) => getUpgradeMessage(plan, limitType),
    refresh: fetchPlanAndUsage,
  };
}
