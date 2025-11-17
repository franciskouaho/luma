'use client';

import { useState } from 'react';
import { useWorkspaces, Workspace } from '@/hooks/use-workspaces';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Settings, ChevronDown } from 'lucide-react';

interface WorkspaceSelectorProps {
  selectedWorkspace: Workspace | null;
  onWorkspaceChange: (workspace: Workspace | null) => void;
  onCreateWorkspace: () => void;
  workspaces?: Workspace[];
  loading?: boolean;
}

export function WorkspaceSelector({
  selectedWorkspace,
  onWorkspaceChange,
  onCreateWorkspace,
  workspaces: propWorkspaces,
  loading: propLoading
}: WorkspaceSelectorProps) {
  const { workspaces: hookWorkspaces, loading: hookLoading } = useWorkspaces();
  const [isOpen, setIsOpen] = useState(false);
  
  // Utiliser les workspaces passés en props ou ceux du hook
  const workspaces = propWorkspaces || hookWorkspaces;
  const loading = propLoading !== undefined ? propLoading : hookLoading;

  // Déduplication côté client pour éviter les doublons
  const uniqueWorkspaces = workspaces.reduce((acc, workspace) => {
    const existing = acc.find(w => w.id === workspace.id);
    if (!existing) {
      acc.push(workspace);
    }
    return acc;
  }, [] as typeof workspaces);


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

  if (loading) {
    return (
      <div className="w-full max-w-sm">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-sm">
      <Button
        variant="outline"
        className="w-full justify-between h-12 bg-white border-gray-300 text-gray-900 hover:bg-gray-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-600" />
          <span className="truncate">
            {selectedWorkspace ? selectedWorkspace.name : 'Sélectionner un workspace'}
          </span>
          {selectedWorkspace && (
            <Badge className={`${getRoleColor(selectedWorkspace.memberRole)} whitespace-nowrap`}>
              {getRoleLabel(selectedWorkspace.memberRole)}
            </Badge>
          )}
        </div>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {uniqueWorkspaces.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun workspace trouvé</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    onCreateWorkspace();
                    setIsOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Créer un workspace
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {uniqueWorkspaces.map((workspace, index) => (
                  <Card
                    key={`${workspace.id}-${index}`}
                    className={`p-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedWorkspace?.id === workspace.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => {
                      onWorkspaceChange(workspace);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm truncate">{workspace.name}</h3>
                        {workspace.description && (
                          <p className="text-xs text-gray-500 truncate">{workspace.description}</p>
                        )}
                      </div>
                      <Badge className={`${getRoleColor(workspace.memberRole)} whitespace-nowrap`}>
                        {getRoleLabel(workspace.memberRole)}
                      </Badge>
                    </div>
                  </Card>
                ))}

                <div className="mt-2 pt-2 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onCreateWorkspace();
                      setIsOpen(false);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Créer un nouveau workspace
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay pour fermer le dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
