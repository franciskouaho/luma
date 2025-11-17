'use client';

import { usePlanLimits } from '@/hooks/use-plan-limits';
import { Crown, Zap } from 'lucide-react';

interface PlanBadgeProps {
  showUpgradeLink?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function PlanBadge({ showUpgradeLink = false, size = 'md' }: PlanBadgeProps) {
  const { plan, planName, planColor, loading } = usePlanLimits();

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
      </div>
    );
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const Icon = plan === 'premium' ? Crown : Zap;

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
        style={{
          backgroundColor: `${planColor}20`,
          color: planColor,
        }}
      >
        <Icon className={iconSize[size]} />
        {planName}
      </span>
      {showUpgradeLink && plan !== 'premium' && (
        <a
          href="/dashboard/settings/billing"
          className="text-xs text-purple-600 hover:text-purple-700 font-medium underline"
        >
          Upgrade
        </a>
      )}
    </div>
  );
}
