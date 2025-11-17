'use client';

import { AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import Link from 'next/link';

interface UpgradePromptProps {
  message: string;
  type?: 'banner' | 'modal' | 'inline';
  onClose?: () => void;
}

export function UpgradePrompt({ message, type = 'inline', onClose }: UpgradePromptProps) {
  if (type === 'banner') {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Passez au niveau supérieur
            </h3>
            <p className="text-sm text-gray-600 mb-3">{message}</p>
            <Link
              href="/dashboard/settings/billing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voir les plans
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (type === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Limite atteinte
            </h2>
            <p className="text-gray-600">{message}</p>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/settings/billing"
              className="block w-full px-6 py-3 bg-purple-600 text-white text-center font-semibold rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voir les plans
            </Link>
            {onClose && (
              <button
                onClick={onClose}
                className="block w-full px-6 py-3 bg-gray-100 text-gray-700 text-center font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Plus tard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Inline (default)
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-amber-900 mb-2">{message}</p>
          <Link
            href="/dashboard/settings/billing"
            className="text-sm font-medium text-amber-700 hover:text-amber-800 underline"
          >
            Mettre à niveau mon plan →
          </Link>
        </div>
      </div>
    </div>
  );
}
