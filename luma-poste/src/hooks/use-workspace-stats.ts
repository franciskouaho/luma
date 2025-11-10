'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface WorkspaceStats {
  members: number;
  posts: number;
  scheduled: number;
  views: number;
}

export function useWorkspaceStats(workspaceId: string | null) {
  const [stats, setStats] = useState<WorkspaceStats>({
    members: 0,
    posts: 0,
    scheduled: 0,
    views: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated || !user || !workspaceId) return;

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      
      const response = await fetch(`/api/workspaces/${workspaceId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data.stats || {
        members: 0,
        posts: 0,
        scheduled: 0,
        views: 0
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, workspaceId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
