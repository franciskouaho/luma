'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface ConnectedAccount {
  id: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'twitter' | 'linkedin';
  username: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
}

export function useConnectedAccounts() {
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchAccounts = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const response = await fetch(`/api/accounts?userId=${user.uid}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const connectedAccounts: ConnectedAccount[] = (data.accounts || [])
        .filter((account: Record<string, unknown>) => account.isActive)
        .map((account: Record<string, unknown>) => ({
          id: account.id as string,
          platform: account.platform as ConnectedAccount['platform'],
          username: account.username as string,
          displayName: (account.displayName as string) || (account.username as string),
          avatarUrl: account.avatarUrl as string | undefined,
          isActive: account.isActive as boolean
        }));

      setAccounts(connectedAccounts);
    } catch (err) {
      console.error('Erreur lors de la récupération des comptes:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Fonction pour vérifier si une plateforme est connectée
  const isPlatformConnected = useCallback((platform: string) => {
    return accounts.some(account => account.platform === platform);
  }, [accounts]);

  // Fonction pour obtenir les plateformes connectées
  const getConnectedPlatforms = useCallback(() => {
    return accounts.map(account => account.platform);
  }, [accounts]);

  return {
    accounts,
    loading,
    error,
    isPlatformConnected,
    getConnectedPlatforms,
    refetch: fetchAccounts
  };
}
