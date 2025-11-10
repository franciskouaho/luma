import { useState, useEffect } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

export interface Schedule {
  id: string;
  userId: string;
  caption: string;
  videoUrl: string;
  thumbnailUrl?: string;
  platforms: string[];
  scheduledAt: string;
  status: 'scheduled' | 'published' | 'failed';
  createdAt: string;
  videoFileName?: string;
}

export function useSchedules(userId?: string, status?: string) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const fetchSchedules = async () => {
    if (!userId) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      
      // Utiliser l'API au lieu de Firebase directement
      const url = status 
        ? `/api/schedules?userId=${userId}&status=${status}`
        : `/api/schedules?userId=${userId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const schedulesData: Schedule[] = data.schedules || [];
      
      // Debug et conversion des dates
      schedulesData.forEach((schedule, index) => {
        
        // Convertir la date si nécessaire
        if (schedule.scheduledAt && typeof schedule.scheduledAt === 'string') {
          if (schedule.scheduledAt.includes('octobre') || schedule.scheduledAt.includes('à')) {
            try {
              const match = schedule.scheduledAt.match(/(\d+) octobre (\d+) à (\d+):(\d+):(\d+) UTC\+(\d+)/);
              
              if (match) {
                const [, day, year, hour, minute, second, timezone] = match;
                
                const isoDate = `${year}-10-${day.padStart(2, '0')}T${hour}:${minute}:${second}+0${timezone}:00`;
                
                const testDate = new Date(isoDate);
                
                schedule.scheduledAt = testDate.toISOString();
              } else {
                console.error('❌ Regex ne matche pas pour:', schedule.scheduledAt);
              }
            } catch (error) {
              console.error('❌ Erreur conversion date française:', error);
            }
          }
        }
      });
      
      setSchedules(schedulesData);
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des planifications:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      await deleteDoc(doc(db, 'schedules', scheduleId));
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [userId]);

  return {
    schedules,
    loading,
    error,
    refetch: fetchSchedules,
    deleteSchedule
  };
}