'use client';

import { useState } from 'react';
import { useWorkspaceMembers, WorkspaceMember } from '@/hooks/use-workspaces';
import { UserSearch } from './user-search';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Users, 
  UserPlus, 
  MoreVertical, 
  Crown, 
  Shield, 
  Edit, 
  Eye,
  Trash2,
  Loader2,
  Search,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Settings,
  Zap
} from 'lucide-react';

interface TeamManagementProps {
  workspaceId: string;
  currentUserRole: 'owner' | 'admin' | 'editor' | 'viewer';
}

export function TeamManagement({ workspaceId, currentUserRole }: TeamManagementProps) {
  const { members, loading, inviteMember, updateMember, removeMember } = useWorkspaceMembers(workspaceId);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canManageMembers = ['owner', 'admin'].includes(currentUserRole);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-purple-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-blue-600" />;
      case 'editor': return <Edit className="h-4 w-4 text-green-600" />;
      case 'viewer': return <Eye className="h-4 w-4 text-gray-600" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-blue-100 text-blue-800';
      case 'editor': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Propriétaire';
      case 'admin': return 'Administrateur';
      case 'editor': return 'Éditeur';
      case 'viewer': return 'Observateur';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'pending': return 'En attente';
      case 'suspended': return 'Suspendu';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />;
      case 'suspended': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;
    
    try {
      setIsDeleting(true);
      await removeMember(selectedMember.id);
      setSelectedMember(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUserSelect = async (user: { uid: string; email: string; displayName: string; photoURL?: string }) => {
    try {
      setIsInviting(true);
      await inviteMember(user.email, inviteRole);
      setInviteRole('editor');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du membre:', error);
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMember = async (memberId: string, updates: { role?: string; status?: string }) => {
    try {
      setIsUpdating(true);
      await updateMember(memberId, updates);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsUpdating(false);
    }
  };


  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Chargement des membres...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        {/* Invitation de nouveaux membres */}
        {canManageMembers && (
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-emerald-50 to-white">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Ajouter des membres</h3>
                  <p className="text-sm text-gray-600">Invitez de nouveaux utilisateurs dans votre workspace</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-3">
                    Rôle par défaut
                  </Label>
                  <select
                    id="role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm transition-all duration-200"
                  >
                    <option value="editor">Éditeur</option>
                    <option value="admin">Administrateur</option>
                    <option value="viewer">Observateur</option>
                  </select>
                </div>

                <Button
                  onClick={() => setShowUserSearch(true)}
                  disabled={isInviting}
                  className="w-full text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  style={{ background: 'var(--luma-gradient-primary)' }}
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Rechercher un utilisateur
                    </>
                  )}
                </Button>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">Note importante</h4>
                      <p className="text-sm text-blue-800">
                        L'utilisateur doit être déjà inscrit dans l'application pour pouvoir être ajouté au workspace.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

      {/* Liste des membres */}
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Membres de l'équipe</h3>
                <p className="text-gray-600">Gérez les membres et leurs rôles</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-700">Total</span>
                <span className="text-2xl font-bold text-blue-900 ml-2">{members.length}</span>
              </div>
              {canManageMembers && (
                <Button
                  onClick={() => setShowUserSearch(true)}
                  className="text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  style={{ background: 'var(--luma-gradient-primary)' }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inviter
                </Button>
              )}
            </div>
          </div>

          {members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Aucun membre dans ce workspace</h4>
              <p className="text-gray-600">Commencez par inviter des utilisateurs à rejoindre votre équipe</p>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      {member.photoURL ? (
                        <img src={member.photoURL} alt={member.displayName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center h-full w-full">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                      )}
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900">{member.displayName}</span>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge className={`${getRoleColor(member.role)} border-0 shadow-sm`}>
                      {getRoleLabel(member.role)}
                    </Badge>
                    <Badge className={`${getStatusColor(member.status)} border-0 shadow-sm`}>
                      {getStatusLabel(member.status)}
                    </Badge>

                    {canManageMembers && member.role !== 'owner' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedMember(member)}
                        disabled={isUpdating}
                        className="opacity-60 hover:opacity-100 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Dialog de gestion des membres amélioré */}
      <Dialog open={!!selectedMember && canManageMembers} onOpenChange={() => {
        setSelectedMember(null);
        setShowDeleteConfirm(false);
      }}>
        <DialogContent className="sm:max-w-lg bg-white text-gray-900">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">
                  Gérer {selectedMember?.displayName}
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Modifiez le rôle et le statut de ce membre du workspace
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedMember && (
            <div className="space-y-6">
              {/* Informations du membre */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedMember.displayName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{selectedMember.displayName}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{selectedMember.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    {getRoleIcon(selectedMember.role)}
                    <span className="text-gray-600">Rôle actuel:</span>
                    <Badge className={getRoleColor(selectedMember.role)}>
                      {getRoleLabel(selectedMember.role)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(selectedMember.status)}
                    <span className="text-gray-600">Statut:</span>
                    <Badge className={getStatusColor(selectedMember.status)}>
                      {getStatusLabel(selectedMember.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contrôles de modification */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Modifier le rôle</Label>
                  <Select
                    value={selectedMember.role}
                    onValueChange={(value) => handleUpdateMember(selectedMember.id, { role: value })}
                    disabled={isUpdating || selectedMember.role === 'owner'}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      <SelectItem value="admin" disabled={selectedMember.role === 'owner'}>
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Administrateur
                        </div>
                      </SelectItem>
                      <SelectItem value="editor" disabled={selectedMember.role === 'owner'}>
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4 text-green-600" />
                          Éditeur
                        </div>
                      </SelectItem>
                      <SelectItem value="viewer" disabled={selectedMember.role === 'owner'}>
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4 text-gray-600" />
                          Observateur
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {selectedMember.role === 'owner' && (
                    <p className="text-xs text-gray-500">Le propriétaire ne peut pas changer de rôle</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Modifier le statut</Label>
                  <Select
                    value={selectedMember.status}
                    onValueChange={(value) => handleUpdateMember(selectedMember.id, { status: value })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-full bg-white border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-lg">
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Actif
                        </div>
                      </SelectItem>
                      <SelectItem value="suspended">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Suspendu
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMember(null);
                setShowDeleteConfirm(false);
              }}
              disabled={isUpdating || isDeleting}
            >
              Fermer
            </Button>
            
            {selectedMember && selectedMember.role !== 'owner' && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isUpdating || isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer du workspace
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md bg-white border-red-200">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-red-900">
                  Confirmer la suppression
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Cette action est irréversible
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700">
              Êtes-vous sûr de vouloir supprimer <strong className="text-red-600">{selectedMember?.displayName}</strong> du workspace ?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Cette personne perdra immédiatement l'accès au workspace et à tous ses contenus.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMember}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer définitivement
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Search Dialog */}
      <UserSearch
        isOpen={showUserSearch}
        onUserSelect={handleUserSelect}
        onClose={() => setShowUserSearch(false)}
      />
    </div>
  );
}
