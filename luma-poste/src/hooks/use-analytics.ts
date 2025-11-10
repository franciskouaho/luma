'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  topPosts: Array<{
    id: string;
    title: string;
    platform: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
    createdAt: Date;
  }>;
  postsByPlatform: Record<string, number>;
  postsByDay: Array<{
    date: string;
    count: number;
  }>;
  postsByStatus: {
    published: number;
    scheduled: number;
    draft: number;
    failed: number;
    queued: number;
  };
  upcomingPosts: Array<{
    id: string;
    title: string;
    platform: string;
    scheduledAt: string;
    status: string;
  }>;
  changes: {
    posts: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagement: number;
  };
}

export function useAnalytics(userId: string, timeRange: string = '7d') {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/analytics?userId=${userId}&timeRange=${timeRange}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || 'Erreur inconnue');
        }

      } catch (err) {
        console.error('Erreur lors de la récupération des analytics:', err);
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, timeRange]);

  return { data, loading, error };
}
