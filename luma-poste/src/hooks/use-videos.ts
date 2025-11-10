'use client';

import { useState, useEffect } from 'react';
import { Video } from '@/lib/firestore';

export function useVideos(userId: string | null) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (status?: string) => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId,
        limit: '50',
      });

      if (status) {
        params.append('status', status);
      }

      const response = await fetch(`/api/videos?${params}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des vidéos');
      }

      const data = await response.json();
      setVideos(data.videos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const createVideo = async (videoData: {
    title: string;
    storageKey: string;
    duration: number;
    size: number;
  }) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          ...videoData,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création de la vidéo');
      }

      const newVideo = await response.json();
      setVideos(prev => [newVideo, ...prev]);
      return newVideo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      throw err;
    }
  };

  const updateVideo = async (videoId: string, updates: Partial<Video>) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la vidéo');
      }

      const updatedVideo = await response.json();
      setVideos(prev => 
        prev.map(video => video.id === videoId ? updatedVideo : video)
      );
      return updatedVideo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      throw err;
    }
  };

  const deleteVideo = async (videoId: string) => {
    try {
      const response = await fetch(`/api/videos/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la vidéo');
      }

      setVideos(prev => prev.filter(video => video.id !== videoId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      throw err;
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [userId]);

  return {
    videos,
    loading,
    error,
    fetchVideos,
    createVideo,
    updateVideo,
    deleteVideo,
  };
}
