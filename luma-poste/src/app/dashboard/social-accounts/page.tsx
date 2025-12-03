"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useWorkspaceContext } from "@/contexts/workspace-context";
import { useSocialAccounts, SocialAccount } from "@/hooks/use-social-accounts";
import { useWorkspaceMembers } from "@/hooks/use-workspace-members";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Plus, Trash2, AlertTriangle, Copy, Eye, EyeOff, Users, Clipboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok", icon: "🎵", color: "bg-black text-white" },
  { value: "instagram", label: "Instagram", icon: "📷", color: "bg-gradient-to-br from-purple-500 to-pink-500 text-white" },
  { value: "youtube", label: "YouTube", icon: "📺", color: "bg-red-600 text-white" },
  { value: "facebook", label: "Facebook", icon: "👥", color: "bg-blue-600 text-white" },
  { value: "twitter", label: "Twitter", icon: "🐦", color: "bg-sky-500 text-white" },
  { value: "linkedin", label: "LinkedIn", icon: "💼", color: "bg-blue-700 text-white" },
  { value: "autre", label: "Autre", icon: "🌐", color: "bg-gray-600 text-white" },
];

export default function SocialAccountsPage() {
  const { selectedWorkspace } = useWorkspaceContext();
  const { user } = useAuth();
  const { accounts, loading, addAccount, updateAccount, deleteAccount, error: accountsError } =
    useSocialAccounts({
      workspaceId: selectedWorkspace?.id || null,
    });
  const { members, error: membersError } = useWorkspaceMembers({
    workspaceId: selectedWorkspace?.id || null,
  });
  const { toast } = useToast();
  const [isFixing, setIsFixing] = useState(false);

  // Fonction pour corriger automatiquement les membres manquants
  const fixWorkspaceMembership = useCallback(async () => {
    if (!user || !selectedWorkspace || isFixing) return;

    setIsFixing(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/workspaces/fix-members', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Recharger la page pour récupérer les données
        window.location.reload();
      }
    } catch (error) {
      console.error('Erreur lors de la correction:', error);
    } finally {
      setIsFixing(false);
    }
  }, [user, selectedWorkspace, isFixing]);

  // Détecter l'erreur 403 et proposer la correction
  useEffect(() => {
    if (accountsError?.includes('non autorisé') || membersError?.includes('non autorisé')) {
      fixWorkspaceMembership();
    }
  }, [accountsError, membersError, fixWorkspaceMembership]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(
    null,
  );
  const [formData, setFormData] = useState({
    platform: "tiktok" as SocialAccount["platform"],
    accountName: "",
    username: "",
    email: "",
    password: "",
    notes: "",
    assignedToUserId: "",
    assignedToName: "",
  });
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAccount) {
      const success = await updateAccount(editingAccount.id, formData);
      if (success) {
        toast({
          title: "Compte mis à jour",
          description: "Le compte a été mis à jour avec succès",
        });
        setIsDialogOpen(false);
        resetForm();
      }
    } else {
      const success = await addAccount(formData);
      if (success) {
        toast({
          title: "Compte ajouté",
          description: "Le compte a été ajouté avec succès",
        });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  };

  const handleEdit = (account: SocialAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      accountName: account.accountName,
      username: account.username,
      email: account.email || "",
      password: account.password || "",
      notes: account.notes || "",
      assignedToUserId: account.addedBy,
      assignedToName: account.addedByName,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (accountId: string) => {
    if (
      !confirm("Êtes-vous sûr de vouloir supprimer ce compte ?")
    )
      return;

    const success = await deleteAccount(accountId);
    if (success) {
      toast({
        title: "Compte supprimé",
        description: "Le compte a été supprimé avec succès",
      });
    }
  };

  const resetForm = () => {
    setEditingAccount(null);
    setFormData({
      platform: "tiktok",
      accountName: "",
      username: "",
      email: "",
      password: "",
      notes: "",
      assignedToUserId: user?.uid || "",
      assignedToName: user?.displayName || "Utilisateur",
    });
  };

  const getPlatformIcon = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform)?.icon || "🌐";
  };

  const getPlatformColor = (platform: string) => {
    return PLATFORMS.find((p) => p.value === platform)?.color || "bg-gray-600 text-white";
  };

  const togglePasswordVisibility = (accountId: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: `${label} copié dans le presse-papiers`,
    });
  };

  const copyAllAccountInfo = (account: SocialAccount) => {
    const info = `
Plateforme: ${PLATFORMS.find(p => p.value === account.platform)?.label || account.platform}
Nom du compte: ${account.accountName}
Identifiant: ${account.username}
Email: ${account.email || "Non renseigné"}
Mot de passe: ${account.password || "Non renseigné"}
Notes: ${account.notes || "Aucune"}
Ajouté par: ${account.addedByName}
    `.trim();

    navigator.clipboard.writeText(info);
    toast({
      title: "Toutes les informations copiées !",
      description: "Les informations complètes du compte ont été copiées",
    });
  };

  if (isFixing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Configuration du workspace...
          </h3>
          <p className="text-gray-600">
            Veuillez patienter, nous configurons vos permissions
          </p>
        </div>
      </div>
    );
  }

  if (!selectedWorkspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Aucun workspace sélectionné
          </h3>
          <p className="text-gray-600">
            Veuillez sélectionner un workspace pour gérer vos comptes sociaux
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comptes réseaux sociaux</h1>
              <p className="text-gray-600 mt-2">
                Gérez les comptes réseaux sociaux partagés avec votre équipe
              </p>
            </div>

            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un compte
                </Button>
              </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto !bg-white">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                {editingAccount ? "Modifier le compte" : "Ajouter un compte"}
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {editingAccount
                  ? "Modifiez les informations du compte réseau social"
                  : "Ajoutez un nouveau compte réseau social partagé avec votre équipe"}
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-sm font-semibold text-gray-700">
                    Plateforme *
                  </Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value: SocialAccount["platform"]) =>
                      setFormData({ ...formData, platform: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner une plateforme">
                        {formData.platform && (
                          <div className="flex items-center gap-2">
                            <span>{PLATFORMS.find(p => p.value === formData.platform)?.icon}</span>
                            <span>{PLATFORMS.find(p => p.value === formData.platform)?.label}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.icon} {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountName" className="text-sm font-semibold text-gray-700">
                    Nom du compte *
                  </Label>
                  <Input
                    id="accountName"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    placeholder="Ex: Compte Principal"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-semibold text-gray-700">
                    Identifiant/Username *
                  </Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    placeholder="Ex: @moncompte"
                    className="h-11"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="email@exemple.com"
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="h-11"
                />
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-800">
                    Le mot de passe sera visible par tous les membres du workspace
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="space-y-2">
                  <Label htmlFor="assignedTo" className="text-sm font-semibold text-gray-700">
                    Assigné à *
                  </Label>
                  <Select
                    value={formData.assignedToUserId}
                    onValueChange={(value) => {
                      const selectedMember = members.find(m => m.userId === value);
                      setFormData({
                        ...formData,
                        assignedToUserId: value,
                        assignedToName: selectedMember?.displayName || ""
                      });
                    }}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Sélectionner un membre">
                        {formData.assignedToUserId && formData.assignedToName && (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-xs font-semibold text-purple-600">
                                {formData.assignedToName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span>{formData.assignedToName}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {members.map((member) => (
                        <SelectItem key={member.userId} value={member.userId}>
                          {member.displayName} ({member.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Personne responsable de ce compte
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Informations supplémentaires, instructions particulières..."
                  rows={4}
                  className="resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="px-6"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enregistrement...</span>
                    </div>
                  ) : editingAccount ? (
                    "Mettre à jour"
                  ) : (
                    "Ajouter le compte"
                  )}
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total des comptes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{accounts.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Plateformes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {new Set(accounts.map(a => a.platform)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Workspace actif</p>
                <p className="text-lg font-semibold text-gray-900 mt-1 truncate max-w-[200px]">
                  {selectedWorkspace.name}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plateforme</TableHead>
              <TableHead>Nom du compte</TableHead>
              <TableHead>Identifiant</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Mot de passe</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead>Ajouté par</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : accounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="text-muted-foreground">
                    <p className="mb-2">Aucun compte enregistré</p>
                    <p className="text-sm">
                      Cliquez sur &quot;Ajouter un compte&quot; pour commencer
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              accounts.map((account) => (
                <TableRow key={account.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg ${getPlatformColor(account.platform)} flex items-center justify-center shadow-sm`}>
                        <span className="text-lg">{getPlatformIcon(account.platform)}</span>
                      </div>
                      <span className="font-medium capitalize text-gray-900">{account.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{account.accountName}</span>
                      <button
                        onClick={() => copyToClipboard(account.accountName, "Nom du compte")}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">{account.username}</span>
                      <button
                        onClick={() => copyToClipboard(account.username, "Identifiant")}
                        className="text-gray-400 hover:text-purple-600 transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {account.email ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 text-sm">{account.email}</span>
                        <button
                          onClick={() => copyToClipboard(account.email!, "Email")}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.password ? (
                      <div className="flex items-center gap-2">
                        <code className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-mono text-gray-900 border border-gray-200">
                          {visiblePasswords[account.id] ? account.password : "••••••••"}
                        </code>
                        <button
                          onClick={() => togglePasswordVisibility(account.id)}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          {visiblePasswords[account.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          onClick={() => copyToClipboard(account.password!, "Mot de passe")}
                          className="text-gray-400 hover:text-purple-600 transition-colors"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.notes ? (
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-600 line-clamp-2 flex-1">
                          {account.notes}
                        </span>
                        <button
                          onClick={() => copyToClipboard(account.notes!, "Notes")}
                          className="text-gray-400 hover:text-purple-600 transition-colors flex-shrink-0 mt-0.5"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{account.addedByName}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyAllAccountInfo(account)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                        title="Copier toutes les informations"
                      >
                        <Clipboard className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(account)}
                        className="hover:bg-purple-50 hover:text-purple-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

        {/* Security Notice */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-yellow-900 text-lg mb-3">
                Sécurité et confidentialité
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Tous les membres du workspace peuvent voir ces comptes et mots de passe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Ne partagez que des comptes destinés à un usage collaboratif</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Utilisez des mots de passe uniques et dédiés pour ces comptes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-0.5">•</span>
                  <span>Activez l'authentification à deux facteurs (2FA) quand c'est possible</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
