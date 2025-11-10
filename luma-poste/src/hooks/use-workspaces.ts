'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberRole: 'owner' | 'admin' | 'editor' | 'viewer';
  settings: {
    allowMemberInvites: boolean;
    requireApprovalForPosts: boolean;
    allowMemberAccountConnections: boolean;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  invitedBy: string;
  joinedAt?: Date;
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

      const fetchWorkspaces = useCallback(async () => {
        if (!isAuthenticated || !user) {
          return;
        }

        try {
          setLoading(true);
          setError(null);

          const token = await user.getIdToken();
          const response = await fetch('/api/workspaces', {
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
          setWorkspaces(data.workspaces || []);
        } catch (err) {
          console.error('Erreur lors de la récupération des workspaces:', err);
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
          setLoading(false);
        }
      }, [isAuthenticated, user]);

  const createWorkspace = useCallback(async (name: string, description?: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du workspace');
      }

      const data = await response.json();
      
      // Rafraîchir la liste des workspaces
      await fetchWorkspaces();
      
      return data.workspaceId;
    } catch (err) {
      console.error('Erreur lors de la création du workspace:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  }, [isAuthenticated, user, fetchWorkspaces]);

  useEffect(() => {
    // Attendre que l'authentification soit chargée
    if (authLoading) {
      return; // Attendre que l'auth soit chargée
    }
    
    if (isAuthenticated && user) {
      fetchWorkspaces();
    } else {
      // Si l'utilisateur n'est pas authentifié, arrêter le loading
      setLoading(false);
    }
  }, [isAuthenticated, user, authLoading, fetchWorkspaces]);

  return {
    workspaces,
    loading,
    error,
    createWorkspace,
    refetch: fetchWorkspaces,
  };
}

export function useWorkspaceMembers(workspaceId: string | null) {
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

      const fetchMembers = useCallback(async () => {
        if (!isAuthenticated || !user || !workspaceId) return;

        try {
          setLoading(true);
          setError(null);

          const token = await user.getIdToken();
          
          const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
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
          setMembers(data.members || []);
        } catch (err) {
          console.error('Erreur lors de la récupération des membres:', err);
          setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
          setLoading(false);
        }
      }, [isAuthenticated, user, workspaceId]);

  const inviteMember = async (email: string, role: 'admin' | 'editor' | 'viewer' = 'editor') => {
    if (!isAuthenticated || !user || !workspaceId) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'ajout du membre');
      }

      // Rafraîchir la liste des membres
      await fetchMembers();
    } catch (err) {
      console.error('Erreur lors de l\'ajout du membre:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  };

  const updateMember = async (memberId: string, updates: { role?: string; status?: string }) => {
    if (!isAuthenticated || !user || !workspaceId) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour du membre');
      }

      // Rafraîchir la liste des membres
      await fetchMembers();
    } catch (err) {
      console.error('Erreur lors de la mise à jour du membre:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  };

  const removeMember = async (memberId: string) => {
    if (!isAuthenticated || !user || !workspaceId) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression du membre');
      }

      // Rafraîchir la liste des membres
      await fetchMembers();
    } catch (err) {
      console.error('Erreur lors de la suppression du membre:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      throw err;
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    loading,
    error,
    inviteMember,
    updateMember,
    removeMember,
    refetch: fetchMembers,
  };
}
