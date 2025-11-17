'use client';

import { Lock } from 'lucide-react';
import { usePlanLimits } from '@/hooks/use-plan-limits';
import { PlanLimits } from '@/lib/plans';
import { ReactNode } from 'react';
import Link from 'next/link';

interface FeatureLockProps {
  feature: keyof PlanLimits['features'];
  children: ReactNode;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export function FeatureLock({ feature, children, fallback, showMessage = true }: FeatureLockProps) {
  const { checkFeatureAccess, getUpgradeMsg, planName } = usePlanLimits();

  const hasAccess = checkFeatureAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  // Default locked UI
  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none blur-sm">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm text-center">
          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">
            Fonctionnalité Premium
          </h3>
          {showMessage && (
            <p className="text-sm text-gray-600 mb-4">
              {getUpgradeMsg('feature')}
            </p>
          )}
          <Link
            href="/dashboard/settings/billing"
            className="inline-block px-6 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            Mettre à niveau
          </Link>
        </div>
      </div>
    </div>
  );
}
