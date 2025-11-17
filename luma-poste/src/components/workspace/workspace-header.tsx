'use client';

import { useWorkspaceContext } from '@/contexts/workspace-context';
import { Badge } from '@/components/ui/badge';
import { Users, Settings } from 'lucide-react';
import Link from 'next/link';

export function WorkspaceHeader() {
  const { selectedWorkspace } = useWorkspaceContext();

  if (!selectedWorkspace) {
    return null;
  }

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

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {selectedWorkspace.name}
              </h1>
              {selectedWorkspace.description && (
                <p className="text-sm text-gray-500">{selectedWorkspace.description}</p>
              )}
            </div>
          </div>
          <Badge className={`${getRoleColor(selectedWorkspace.memberRole)} whitespace-nowrap`}>
            {getRoleLabel(selectedWorkspace.memberRole)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/workspaces">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-4 w-4" />
              Gérer l'équipe
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
