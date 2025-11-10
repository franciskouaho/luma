'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Workspace } from '@/hooks/use-workspaces';

interface WorkspaceContextType {
  selectedWorkspace: Workspace | null;
  setSelectedWorkspace: (workspace: Workspace | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger le workspace sélectionné depuis localStorage au démarrage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedWorkspaceId = localStorage.getItem('selectedWorkspaceId');
      if (savedWorkspaceId) {
        // Le workspace sera chargé par le composant parent qui a accès à la liste des workspaces
        // On marque juste qu'on a une sélection sauvegardée
        console.log('Workspace ID sauvegardé trouvé:', savedWorkspaceId);
      }
      setIsInitialized(true);
    }
  }, []);

  // Sauvegarder dans localStorage quand le workspace change
  useEffect(() => {
    if (selectedWorkspace && typeof window !== 'undefined') {
      localStorage.setItem('selectedWorkspaceId', selectedWorkspace.id);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('selectedWorkspaceId');
    }
  }, [selectedWorkspace]);

  return (
    <WorkspaceContext.Provider value={{ selectedWorkspace, setSelectedWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspaceContext must be used within a WorkspaceProvider');
  }
  return context;
}
