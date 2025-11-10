import { useCallback, useEffect, useState } from "react";

export interface TikTokAccount {
  id: string;
  userId: string;
  platform: "tiktok";
  tiktokUserId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  accessTokenEnc: string;
  refreshTokenEnc: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UseTikTokAccountsOptions {
  userId: string | null;
  initialAccounts?: TikTokAccount[];
}

export function useTikTokAccounts({
  userId,
  initialAccounts = [],
}: UseTikTokAccountsOptions) {
  const [accounts, setAccounts] = useState<TikTokAccount[]>(initialAccounts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccounts = useCallback(async (currentUserId: string) => {
    console.log("🔍 Hook fetchAccounts - starting with userId:", currentUserId);
    setLoading(true);
    setError(null);
    try {
      const url = `/api/accounts?userId=${currentUserId}`;
      console.log("🔍 Hook fetchAccounts - calling:", url);
      const response = await fetch(url);
      console.log("🔍 Hook fetchAccounts - response status:", response.status);
      if (!response.ok) {
        throw new Error("Failed to fetch TikTok accounts");
      }
      const data = await response.json();
      console.log("🔍 Hook fetchAccounts - received data:", data);
      setAccounts(data.accounts || []);
      console.log(
        "✅ Hook fetchAccounts - success, accounts count:",
        data.accounts?.length || 0,
      );
    } catch (err: unknown) {
      console.error("❌ Hook fetchAccounts - error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch accounts");
    } finally {
      setLoading(false);
      console.log("🔍 Hook fetchAccounts - finished");
    }
  }, []);

  useEffect(() => {
    console.log("🔍 Hook useEffect - userId changed:", userId);
    if (userId) {
      fetchAccounts(userId);
    } else {
      console.log("🔍 Hook useEffect - no userId, clearing accounts");
      setAccounts([]);
    }
  }, [userId, fetchAccounts]);

  const addAccount = useCallback(
    async (
      accountData: Omit<TikTokAccount, "id" | "createdAt" | "updatedAt">,
    ) => {
      if (!userId) {
        setError("User not authenticated");
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...accountData, userId }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to add TikTok account");
        }
        const addedAccount: TikTokAccount = await response.json();
        setAccounts((prev) => [addedAccount, ...prev]);
        return addedAccount;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch accounts",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const updateAccount = useCallback(
    async (accountId: string, updateData: Partial<TikTokAccount>) => {
      if (!userId) {
        setError("User not authenticated");
        return null;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update TikTok account");
        }
        const updatedAccount: TikTokAccount = await response.json();
        setAccounts((prev) =>
          prev.map((acc) => (acc.id === accountId ? updatedAccount : acc)),
        );
        return updatedAccount;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch accounts",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  const deleteAccount = useCallback(
    async (accountId: string) => {
      if (!userId) {
        setError("User not authenticated");
        return false;
      }
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/accounts/${accountId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete TikTok account");
        }
        setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
        return true;
      } catch (err: unknown) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch accounts",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  return {
    accounts,
    loading,
    error,
    fetchAccounts: () => userId && fetchAccounts(userId),
    addAccount,
    updateAccount,
    deleteAccount,
  };
}
