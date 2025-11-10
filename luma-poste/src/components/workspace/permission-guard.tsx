'use client';

import { ReactNode } from 'react';
import { useWorkspacePermissions } from '@/hooks/use-workspace-permissions';
import { useWorkspaceContext } from '@/contexts/workspace-context';
import { Card } from '@/components/ui/card';
import { Users, Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission: keyof ReturnType<typeof useWorkspacePermissions>;
  fallback?: ReactNode;
  showMessage?: boolean;
}

export function PermissionGuard({ 
  children, 
  permission, 
  fallback,
  showMessage = true 
}: PermissionGuardProps) {
  const permissions = useWorkspacePermissions();
  const hasPermission = permissions[permission];

  if (hasPermission) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showMessage) {
    return null;
  }

  return (
    <Card className="p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-gray-100 rounded-full">
          <Lock className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Accès restreint
          </h3>
          <p className="text-gray-600">
            Vous n'avez pas les permissions nécessaires pour effectuer cette action.
          </p>
        </div>
      </div>
    </Card>
  );
}

interface WorkspaceRequiredProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function WorkspaceRequired({ children, fallback }: WorkspaceRequiredProps) {
  const { selectedWorkspace } = useWorkspaceContext();

  if (selectedWorkspace) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="p-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-blue-100 rounded-full">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Aucun workspace sélectionné
          </h3>
          <p className="text-gray-600">
            Veuillez sélectionner un workspace pour accéder à cette fonctionnalité.
          </p>
        </div>
      </div>
    </Card>
  );
}
