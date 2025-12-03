"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

export interface SocialAccount {
  id: string;
  workspaceId: string;
  platform: "tiktok" | "instagram" | "youtube" | "facebook" | "twitter" | "linkedin" | "autre";
  accountName: string;
  username: string;
  email?: string;
  password?: string;
  notes?: string;
  addedBy: string;
  addedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UseSocialAccountsOptions {
  workspaceId: string | null;
}

export function useSocialAccounts({ workspaceId }: UseSocialAccountsOptions) {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(
    async (wsId: string) => {
      if (!user) return;

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch(
          `/api/social-accounts?workspaceId=${wsId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Erreur API social-accounts:", response.status, errorData);
          throw new Error(errorData.error || "Échec de la récupération des comptes");
        }

        const data = await response.json();
        setAccounts(data.accounts || []);
      } catch (err) {
        console.error("Erreur lors de la récupération des comptes:", err);
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
      fetchAccounts(workspaceId);
    } else {
      setAccounts([]);
    }
  }, [workspaceId, fetchAccounts]);

  const addAccount = useCallback(
    async (
      accountData: Omit<
        SocialAccount,
        "id" | "addedBy" | "addedByName" | "createdAt" | "updatedAt"
      >,
    ) => {
      if (!user || !workspaceId) {
        setError("Utilisateur non authentifié ou workspace non sélectionné");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/social-accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...accountData, workspaceId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Échec de l'ajout du compte");
        }

        const addedAccount: SocialAccount = await response.json();
        setAccounts((prev) => [addedAccount, ...prev]);
        return addedAccount;
      } catch (err) {
        console.error("Erreur lors de l'ajout du compte:", err);
        setError(err instanceof Error ? err.message : "Erreur d'ajout");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, workspaceId],
  );

  const updateAccount = useCallback(
    async (accountId: string, updates: Partial<SocialAccount>) => {
      if (!user) {
        setError("Utilisateur non authentifié");
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/social-accounts/${accountId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Échec de la mise à jour du compte",
          );
        }

        const updatedAccount: SocialAccount = await response.json();
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === accountId ? updatedAccount : acc)),
        );
        return updatedAccount;
      } catch (err) {
        console.error("Erreur lors de la mise à jour du compte:", err);
        setError(err instanceof Error ? err.message : "Erreur de mise à jour");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      if (!user) {
        setError("Utilisateur non authentifié");
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/social-accounts/${accountId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Échec de la suppression du compte",
          );
        }

        setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        return true;
      } catch (err) {
        console.error("Erreur lors de la suppression du compte:", err);
        setError(err instanceof Error ? err.message : "Erreur de suppression");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  return {
    accounts,
    loading,
    error,
    fetchAccounts: () => workspaceId && fetchAccounts(workspaceId),
    addAccount,
    updateAccount,
    deleteAccount,
  };
}
