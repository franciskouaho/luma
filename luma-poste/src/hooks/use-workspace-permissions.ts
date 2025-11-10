'use client';

import { useWorkspaceContext } from '@/contexts/workspace-context';

export function useWorkspacePermissions() {
  const { selectedWorkspace } = useWorkspaceContext();

  if (!selectedWorkspace) {
    return {
      canCreatePosts: false,
      canEditPosts: false,
      canDeletePosts: false,
      canManageMembers: false,
      canManageSettings: false,
      canViewAnalytics: false,
      canConnectAccounts: false,
      canSchedulePosts: false,
      canPublishPosts: false,
    };
  }

  const { memberRole } = selectedWorkspace;

  return {
    // Permissions de base pour tous les membres actifs
    canViewAnalytics: ['owner', 'admin', 'editor', 'viewer'].includes(memberRole),
    canConnectAccounts: ['owner', 'admin', 'editor'].includes(memberRole),
    
    // Permissions d'édition
    canCreatePosts: ['owner', 'admin', 'editor'].includes(memberRole),
    canEditPosts: ['owner', 'admin', 'editor'].includes(memberRole),
    canDeletePosts: ['owner', 'admin'].includes(memberRole),
    
    // Permissions de planification
    canSchedulePosts: ['owner', 'admin', 'editor'].includes(memberRole),
    canPublishPosts: ['owner', 'admin', 'editor'].includes(memberRole),
    
    // Permissions d'administration
    canManageMembers: ['owner', 'admin'].includes(memberRole),
    canManageSettings: ['owner'].includes(memberRole),
  };
}
