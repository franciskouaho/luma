'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface UserSettings {
  profile: {
    name: string;
    email: string;
    timezone: string;
    language: string;
  };
  notifications: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publishSuccess: boolean;
    publishFailure: boolean;
    weeklyReport: boolean;
    newFollower: boolean;
  };
  privacy: {
    dataRetention: string;
    analyticsSharing: boolean;
    profileVisibility: string;
  };
  integrations: {
    autoSync: boolean;
    backupEnabled: boolean;
    apiAccess: boolean;
  };
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  
  const { user: authUser, isAuthenticated } = useAuth();

  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated || !authUser) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await authUser.getIdToken();
      const response = await fetch('/api/settings', {
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
      setSettings(data.settings);
      setUser(data.user);
    } catch (err) {
      console.error('Erreur lors de la récupération des paramètres:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  const updateSettings = useCallback(async (newSettings: UserSettings) => {
    if (!isAuthenticated || !authUser) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const token = await authUser.getIdToken();
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: newSettings }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      setSettings(newSettings);
      return true;
    } catch (err) {
      console.error('Erreur lors de la mise à jour des paramètres:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, authUser]);

  const generateApiKey = useCallback(async () => {
    if (!isAuthenticated || !authUser) {
      return null;
    }

    try {
      setError(null);

      const token = await authUser.getIdToken();
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate-api-key' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setApiKey(data.apiKey);
      return data.apiKey;
    } catch (err) {
      console.error('Erreur lors de la génération de la clé API:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    }
  }, [isAuthenticated, authUser]);

  const exportData = useCallback(async () => {
    if (!isAuthenticated || !authUser) {
      return null;
    }

    try {
      setError(null);

      const token = await authUser.getIdToken();
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'export-data' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Télécharger le fichier JSON
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `luma-post-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return data.data;
    } catch (err) {
      console.error('Erreur lors de l\'export des données:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return null;
    }
  }, [isAuthenticated, authUser]);

  const deleteAccount = useCallback(async () => {
    if (!isAuthenticated || !authUser) {
      return false;
    }

    try {
      setError(null);

      const token = await authUser.getIdToken();
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete-account' }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (err) {
      console.error('Erreur lors de la suppression du compte:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      return false;
    }
  }, [isAuthenticated, authUser]);

  useEffect(() => {
    if (isAuthenticated && authUser) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authUser, fetchSettings]);

  return {
    settings,
    user,
    loading,
    error,
    saving,
    apiKey,
    updateSettings,
    generateApiKey,
    exportData,
    deleteAccount,
    refetch: fetchSettings,
  };
}
