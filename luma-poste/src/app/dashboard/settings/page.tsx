"use client";

import { useState, useEffect } from "react";
import { useSettings, UserSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  User,
  Bell,
  Shield,
  Database,
  Globe,
  Save,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Info,
  CheckCircle2,
  RefreshCw,
  Lock,
  Key,
  Mail,
  Clock as ClockIcon,
  Languages,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function SettingsPage() {
  const { 
    settings, 
    user, 
    loading, 
    error, 
    saving, 
    apiKey,
    updateSettings, 
    generateApiKey, 
    exportData, 
    deleteAccount 
  } = useSettings();
  
  const { toast } = useToast();
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState<UserSettings | null>(null);

  // Synchroniser les paramètres locaux avec ceux du serveur
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;
    
    const success = await updateSettings(localSettings);
    if (success) {
      setSaved(true);
      toast({
        title: "Succès",
        description: "Paramètres sauvegardés avec succès",
      });
      setTimeout(() => setSaved(false), 2000);
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de la sauvegarde des paramètres",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    const data = await exportData();
    if (data) {
      toast({
        title: "Succès",
        description: "Données exportées avec succès",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'export des données",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
      )
    ) {
      const success = await deleteAccount();
      if (success) {
        toast({
          title: "Succès",
          description: "Compte marqué pour suppression",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Erreur lors de la suppression du compte",
          variant: "destructive",
        });
      }
    }
  };

  const handleGenerateApiKey = async () => {
    const newApiKey = await generateApiKey();
    if (newApiKey) {
      toast({
        title: "Succès",
        description: "Nouvelle clé API générée",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération de la clé API",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          <span className="text-lg font-medium text-gray-700">Chargement des paramètres...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  if (!settings || !user || !localSettings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucune donnée</h2>
          <p className="text-gray-600">Impossible de charger les paramètres</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Sticky Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Paramètres
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gérez vos préférences et paramètres de compte
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Sauvegardé
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                  Profil
                </p>
                <p className="text-2xl font-bold text-gray-900">Actif</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-lg shadow-slate-500/30 group-hover:scale-110 transition-transform duration-300">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Notifications
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {localSettings ? Object.values(localSettings.notifications).filter(Boolean).length : 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Sécurité
                </p>
                <p className="text-2xl font-bold text-gray-900">Élevée</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200 hover:border-purple-300 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600 uppercase tracking-wide mb-1">
                  Intégrations
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {localSettings ? Object.values(localSettings.integrations).filter(Boolean).length : 0}
                </p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Database className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="relative p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Profil</h3>
                  <p className="text-sm text-gray-600">
                    Informations personnelles
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <User className="w-4 h-4 text-gray-500" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={localSettings.profile.name}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        profile: { ...localSettings.profile, name: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 pr-10 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <ClockIcon className="w-4 h-4 text-gray-500" />
                    Fuseau horaire
                  </label>
                  <select
                    value={localSettings.profile.timezone}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        profile: {
                          ...localSettings.profile,
                          timezone: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200 text-sm"
                  >
                    <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                    <option value="Europe/London">Europe/London (UTC+0)</option>
                    <option value="America/New_York">
                      America/New_York (UTC-5)
                    </option>
                    <option value="America/Los_Angeles">
                      America/Los_Angeles (UTC-8)
                    </option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Languages className="w-4 h-4 text-gray-500" />
                    Langue
                  </label>
                  <select
                    value={localSettings.profile.language}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        profile: {
                          ...localSettings.profile,
                          language: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200 text-sm"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="relative p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
                  <Bell className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Notifications
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configurez vos préférences
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <ToggleOption
                title="Notifications par email"
                description="Recevoir des notifications par email"
                checked={localSettings.notifications.emailNotifications}
                onChange={(checked: boolean) =>
                  setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      emailNotifications: checked,
                    },
                  })
                }
              />

              <ToggleOption
                title="Notifications push"
                description="Recevoir des notifications dans le navigateur"
                checked={localSettings.notifications.pushNotifications}
                onChange={(checked: boolean) =>
                  setLocalSettings({
                    ...localSettings,
                    notifications: {
                      ...localSettings.notifications,
                      pushNotifications: checked,
                    },
                  })
                }
              />

              <div className="ml-6 space-y-3 pt-2 border-l-2 border-gray-100 pl-4">
                <SmallToggle
                  label="Publication réussie"
                  checked={localSettings.notifications.publishSuccess}
                  onChange={(checked: boolean) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        publishSuccess: checked,
                      },
                    })
                  }
                />

                <SmallToggle
                  label="Échec de publication"
                  checked={localSettings.notifications.publishFailure}
                  onChange={(checked: boolean) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        publishFailure: checked,
                      },
                    })
                  }
                />

                <SmallToggle
                  label="Rapport hebdomadaire"
                  checked={localSettings.notifications.weeklyReport}
                  onChange={(checked: boolean) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        weeklyReport: checked,
                      },
                    })
                  }
                />

                <SmallToggle
                  label="Nouveau follower"
                  checked={localSettings.notifications.newFollower}
                  onChange={(checked: boolean) =>
                    setLocalSettings({
                      ...localSettings,
                      notifications: {
                        ...localSettings.notifications,
                        newFollower: checked,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="relative p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Confidentialité
                  </h3>
                  <p className="text-sm text-gray-600">
                    Gérez vos données personnelles
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Rétention des données
                  </label>
                  <select
                    value={localSettings.privacy.dataRetention}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        privacy: {
                          ...localSettings.privacy,
                          dataRetention: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200 text-sm"
                  >
                    <option value="6">6 mois</option>
                    <option value="12">12 mois</option>
                    <option value="24">24 mois</option>
                    <option value="0">Indéfiniment</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Visibilité du profil
                  </label>
                  <select
                    value={localSettings.privacy.profileVisibility}
                    onChange={(e) =>
                      setLocalSettings({
                        ...localSettings,
                        privacy: {
                          ...localSettings.privacy,
                          profileVisibility: e.target.value,
                        },
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white transition-all duration-200 text-sm"
                  >
                    <option value="private">Privé</option>
                    <option value="public">Public</option>
                  </select>
                </div>
              </div>

              <ToggleOption
                title="Partage des données analytiques"
                description="Autoriser le partage anonyme pour améliorer le service"
                checked={localSettings.privacy.analyticsSharing}
                onChange={(checked: boolean) =>
                  setLocalSettings({
                    ...localSettings,
                    privacy: { ...localSettings.privacy, analyticsSharing: checked },
                  })
                }
              />
            </div>
          </div>

          {/* API & Integrations */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="relative p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shadow-md">
                  <Database className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Intégrations
                  </h3>
                  <p className="text-sm text-gray-600">
                    API et synchronisation
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <ToggleOption
                title="Synchronisation automatique"
                description="Synchroniser automatiquement avec TikTok"
                checked={localSettings.integrations.autoSync}
                onChange={(checked: boolean) =>
                  setLocalSettings({
                    ...localSettings,
                    integrations: {
                      ...localSettings.integrations,
                      autoSync: checked,
                    },
                  })
                }
              />

              <ToggleOption
                title="Sauvegarde automatique"
                description="Sauvegarder automatiquement vos données"
                checked={localSettings.integrations.backupEnabled}
                onChange={(checked: boolean) =>
                  setLocalSettings({
                    ...localSettings,
                    integrations: {
                      ...localSettings.integrations,
                      backupEnabled: checked,
                    },
                  })
                }
              />

              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 text-sm">
                    Clé API
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey || "sk_live_..."}
                    readOnly
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 font-mono text-sm text-gray-600"
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4 text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                  <button 
                    onClick={handleGenerateApiKey}
                    className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    title="Générer une nouvelle clé API"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  Utilisez cette clé pour accéder à l'API
                </p>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300">
            <div className="relative p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center shadow-md">
                  <Globe className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Données</h3>
                  <p className="text-sm text-gray-600">
                    Export et suppression
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group">
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm mb-0.5">
                    Exporter mes données
                  </h4>
                  <p className="text-xs text-blue-700">
                    Téléchargez une copie de vos données
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-200 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors group">
                <div>
                  <h4 className="font-semibold text-red-900 text-sm mb-0.5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Supprimer mon compte
                  </h4>
                  <p className="text-xs text-red-700">Action irréversible</p>
                </div>
                <button
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Réinitialiser
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saved ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Sauvegardé
                </>
              ) : saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant Toggle réutilisable
function ToggleOption({ title, description, checked, onChange }: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-500 shadow-inner"></div>
      </label>
    </div>
  );
}

// Composant Toggle petit
function SmallToggle({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-purple-500"></div>
      </label>
    </div>
  );
}
