"use client";

import TikTokConnectionModal from "@/components/tiktok/TikTokConnectionModal";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { useAuth } from "@/hooks/use-auth";
import { useTikTokAccounts } from "@/hooks/use-tiktok-accounts";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { UpgradePrompt } from "@/components/plan/upgrade-prompt";
import {
  AlertCircle,
  CheckCircle,
  Filter,
  Globe,
  Grid3X3,
  HelpCircle,
  List,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

interface TikTokAccount {
  id: string;
  userId: string;
  platform: "tiktok";
  tiktokUserId: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date | { seconds: number };
  updatedAt: Date | { seconds: number };
}

interface Platform {
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  accounts: Array<{
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  }>;
}

function AccountsPageContent() {
  const { user, loading: authLoading } = useAuth();
  const { accounts, loading, error, deleteAccount, fetchAccounts } =
    useTikTokAccounts({
      userId: user?.uid || "",
    });
  const { canAddAccount, getUpgradeMsg, limits } = usePlanLimits();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showTikTokModal, setShowTikTokModal] = useState(false);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const searchParams = useSearchParams();

  const connected = searchParams?.get("connected");
  const connectionError = searchParams?.get("error");

  useEffect(() => {
    if (connected === "true") {
      // Afficher un message de succès
      console.log("🎉 Connexion TikTok réussie - rechargement des comptes");
      setIsConnecting(false);
      // Clean URL and refresh accounts data
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      window.history.replaceState({}, "", url.toString());
      // Force refresh des comptes
      if (user?.uid) {
        setTimeout(() => {
          fetchAccounts();
        }, 1000);
      }
    } else if (connectionError === "connection_failed") {
      // Afficher un message d'erreur
      console.log("❌ Échec de la connexion TikTok");
      setIsConnecting(false);
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [connected, connectionError, user?.uid, fetchAccounts]);

  // Reset connection state on mount
  useEffect(() => {
    setIsConnecting(false);
  }, []);

  useEffect(() => {
    const initialPlatforms: Platform[] = [
      {
        name: "TikTok",
        icon: "♪",
        color: "bg-black",
        connected: accounts.length > 0,
        accounts: accounts.map((account) => ({
          id: account.id,
          username: account.username,
          displayName: account.displayName,
          avatarUrl: account.avatarUrl,
        })),
      },
    ];

    setPlatforms(initialPlatforms);
  }, [accounts]);

  const handleConnectTikTok = async () => {
    if (!user?.uid) {
      console.error("Utilisateur non authentifié");
      return;
    }

    setIsConnecting(true);
    setShowTikTokModal(false);
    try {
      const response = await fetch(
        `/api/auth/tiktok/authorize?userId=${user.uid}`,
      );
      if (!response.ok) {
        throw new Error(
          "Erreur lors de la récupération de l'URL d'autorisation",
        );
      }

      const data = await response.json();
      // Note: setIsConnecting(false) sera appelé dans useEffect lors du retour
      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Erreur lors de la connexion TikTok:", error);
      setIsConnecting(false);
    }
  };

  const handleConnectPlatform = async (platformName: string) => {
    if (platformName === "TikTok") {
      // Vérifier la limite de comptes
      if (!canAddAccount) {
        alert(getUpgradeMsg('accounts'));
        return;
      }
      setShowTikTokModal(true);
    }
  };

  const handleDisconnectAccount = async (
    platformName: string,
    accountId: string,
  ) => {
    if (platformName === "TikTok") {
      if (confirm("Êtes-vous sûr de vouloir déconnecter ce compte TikTok ?")) {
        await deleteAccount(accountId);
      }
    }
  };

  const handleRefreshPlatform = async (platformName: string) => {
    if (platformName === "TikTok") {
      window.location.reload();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-purple-100 rounded-full mx-auto animate-ping"></div>
          </div>
          <p className="text-gray-700 font-medium">Loading accounts...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  const connectedPlatforms = platforms.filter((p) => p.connected).length;
  const totalAccounts = platforms.reduce(
    (sum, p) => sum + p.accounts.length,
    0,
  );
  const activePlatforms = platforms.filter(
    (p) => p.connected && p.accounts.length > 0,
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Sticky Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Connected Accounts
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your social media connections
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/dashboard/upload")}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Post
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upgrade Banner si limite atteinte */}
        {!canAddAccount && (
          <UpgradePrompt
            message={getUpgradeMsg('accounts')}
            type="banner"
          />
        )}

        {/* Warning si proche de la limite */}
        {canAddAccount && limits.maxAccounts !== null && accounts.length >= limits.maxAccounts * 0.8 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              ⚠️ Vous avez utilisé {accounts.length} sur {limits.maxAccounts} comptes disponibles.
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Connected Platforms
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {connectedPlatforms}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Accounts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalAccounts}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Active
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {activePlatforms}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                  Secured
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {connectedPlatforms}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleConnectPlatform("TikTok")}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Connect TikTok
                  </>
                )}
              </button>
              <button
                onClick={() => handleRefreshPlatform("TikTok")}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200">
                  <option value="all">All Platforms</option>
                  <option value="connected">Connected</option>
                  <option value="available">Available</option>
                </select>
              </div>

              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-white shadow-sm text-purple-600">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-gray-600 hover:text-gray-900">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {connected === "true" && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-bold text-green-800">
                  TikTok Account Connected Successfully!
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  Your TikTok Business account has been connected and is ready
                  to use. Page will refresh to show your account.
                </p>
              </div>
            </div>
          </div>
        )}

        {connectionError === "connection_failed" && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-800">
                  TikTok Connection Failed
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  An error occurred while connecting your TikTok account. Please
                  try again.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {platforms.map((platform) => {
            const isDisabled = platform.name !== "TikTok";
            return (
              <div
                key={platform.name}
                className={`bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 ${isDisabled ? "opacity-50" : "hover:shadow-xl"} transition-all duration-300 ${!isDisabled && "hover:scale-[1.02]"} group`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-lg ${platform.color} flex items-center justify-center text-white font-bold text-2xl shadow-lg ${isDisabled ? "grayscale" : ""}`}
                      >
                        {platform.icon}
                      </div>
                      <div>
                        <h3
                          className={`text-lg font-bold ${isDisabled ? "text-gray-400" : "text-gray-900"}`}
                        >
                          {platform.name}
                        </h3>
                        <p
                          className={`text-sm ${isDisabled ? "text-gray-400" : "text-gray-500"}`}
                        >
                          {platform.accounts.length} account(s)
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${platform.connected ? "bg-green-500 shadow-lg shadow-green-500/50" : "bg-gray-300"}`}
                    ></div>
                  </div>

                  {/* Connect Button */}
                  <div className="mb-6">
                    <button
                      onClick={() => handleConnectPlatform(platform.name)}
                      disabled={
                        (isConnecting && platform.name === "TikTok") ||
                        isDisabled
                      }
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        isDisabled
                          ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                          : platform.connected
                            ? "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
                            : "bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105"
                      }`}
                    >
                      {isConnecting && platform.name === "TikTok" ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Connecting...
                        </>
                      ) : platform.connected ? (
                        <>
                          <Plus className="w-4 h-4" />
                          Connect Another
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Connect TikTok
                        </>
                      )}
                    </button>
                  </div>

                  {/* Connected Accounts */}
                  {platform.connected && platform.accounts.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Connected Accounts
                        </span>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                          {platform.accounts.length}
                        </span>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {platform.accounts.map((account) => (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group/account"
                          >
                            <div className="flex items-center gap-3">
                              <PlatformIcon
                                platform={platform.name.toLowerCase()}
                                size="md"
                                profileImageUrl={account.avatarUrl}
                                username={account.username}
                                className="w-12 h-12"
                              />
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  {account.displayName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  @{account.username}
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleDisconnectAccount(
                                  platform.name,
                                  account.id,
                                )
                              }
                              disabled={isDisabled}
                              className="opacity-0 group-hover/account:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-all duration-200 group/delete"
                            >
                              <X className="w-4 h-4 text-gray-400 group-hover/delete:text-red-600 transition-colors" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {platform.connected && platform.accounts.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        No accounts connected
                      </p>
                    </div>
                  )}

                  {!platform.connected && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Globe className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500 font-medium">
                        Platform not connected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/30">
              <HelpCircle className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Need Help?</h3>
              <p className="text-sm text-gray-500">
                Account connection and management
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="flex items-center justify-start gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                TikTok Connection Guide
              </span>
            </button>
            <button className="flex items-center justify-start gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Settings className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Security Settings
              </span>
            </button>
            <button className="flex items-center justify-start gap-3 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 group">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <Shield className="w-5 h-5 text-gray-500" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                Data Privacy
              </span>
            </button>
          </div>
        </div>

        {/* TikTok Connection Modal */}
        <TikTokConnectionModal
          isOpen={showTikTokModal}
          onClose={() => setShowTikTokModal(false)}
          onConnect={handleConnectTikTok}
          isConnecting={isConnecting}
        />
      </div>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <AccountsPageContent />
    </Suspense>
  );
}
