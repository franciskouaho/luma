'use client';

import { useState, useEffect } from 'react';

export interface PostedPost {
  id: string;
  caption: string;
  postedAt: Date;
  status: 'posted';
  platforms: string[];
  userId: string;
  workspaceId?: string;
  createdAt: Date;
  mediaType?: 'video' | 'image' | 'text';
  thumbnailUrl?: string;
}

export function usePosts(userId: string | null) {
  const [posts, setPosts] = useState<PostedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Récupérer les vidéos (posts publiés)
      const videosResponse = await fetch(`/api/videos?userId=${userId}`);
      const videosData = videosResponse.ok ? await videosResponse.json() : { videos: [] };
      
      // Récupérer les posts planifiés qui ont été publiés
      const schedulesResponse = await fetch(`/api/schedules?userId=${userId}&status=posted`);
      const schedulesData = schedulesResponse.ok ? await schedulesResponse.json() : { schedules: [] };
      
      // Combiner les posts publiés
      const postedPosts: PostedPost[] = [
        ...videosData.videos.map((video: Record<string, unknown>) => ({
          id: video.id,
          caption: video.caption,
          postedAt: new Date(video.createdAt as string | number | Date),
          status: 'posted' as const,
          platforms: video.platforms || ['tiktok'],
          userId: video.userId,
          createdAt: new Date(video.createdAt as string | number | Date),
          mediaType: 'video' as const,
          thumbnailUrl: video.thumbnailUrl
        })),
        ...schedulesData.schedules.map((schedule: Record<string, unknown>) => ({
          id: schedule.id,
          caption: schedule.caption,
          postedAt: new Date(schedule.scheduledAt as string | number | Date),
          status: 'posted' as const,
          platforms: schedule.platforms || ['tiktok'],
          userId: schedule.userId,
          createdAt: new Date(schedule.createdAt as string | number | Date),
          mediaType: 'video' as const,
          thumbnailUrl: schedule.thumbnailUrl
        }))
      ];
      
      setPosts(postedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  return {
    posts,
    loading,
    error,
    refreshPosts,
  };
}
