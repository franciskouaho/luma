"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "active" | "pending" | "suspended";
}

interface UseWorkspaceMembersOptions {
  workspaceId: string | null;
}

export function useWorkspaceMembers({ workspaceId }: UseWorkspaceMembersOptions) {
  const { user } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(
    async (wsId: string) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/workspaces/${wsId}/members`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Erreur API workspace members:", response.status, errorData);
          throw new Error(errorData.error || "Échec de la récupération des membres");
        }

        const data = await response.json();
        setMembers(data.members || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des membres:", err);
        setError(
          err instanceof Error ? err.message : "Erreur de récupération",
        );
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (workspaceId) {
      fetchMembers(workspaceId);
    } else {
      setMembers([]);
    }
  }, [workspaceId, fetchMembers]);

  return {
    members,
    loading,
    error,
    refetch: () => workspaceId && fetchMembers(workspaceId),
  };
}
