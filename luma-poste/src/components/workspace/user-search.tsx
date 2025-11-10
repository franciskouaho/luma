'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  UserPlus, 
  Check, 
  Loader2,
  Users,
  AlertCircle
} from 'lucide-react';

interface UserSearchProps {
  isOpen: boolean;
  onUserSelect: (user: { uid: string; email: string; displayName: string; photoURL?: string }) => void;
  onClose: () => void;
}

interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export function UserSearch({ isOpen, onUserSelect, onClose }: UserSearchProps) {
  const [email, setEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  const searchUser = async () => {
    if (!email.trim() || !isAuthenticated || !user) return;

    try {
      setSearching(true);
      setError(null);
      setFoundUser(null);

      const token = await user.getIdToken();
      const response = await fetch('/api/users/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche');
      }

      if (data.user) {
        setFoundUser(data.user);
      } else {
        setError('Aucun utilisateur trouvé avec cet email');
      }
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = () => {
    if (foundUser) {
      onUserSelect(foundUser);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchUser();
    }
  };

  const handleClose = () => {
    setEmail('');
    setFoundUser(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white text-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Rechercher un utilisateur
          </DialogTitle>
          <DialogDescription>
            Recherchez un utilisateur par son adresse email pour l'ajouter au workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="utilisateur@exemple.com"
                disabled={searching}
              />
              <Button
                onClick={searchUser}
                disabled={!email.trim() || searching}
                size="sm"
              >
                {searching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}

          {foundUser && (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-10 w-10">
                  {foundUser.photoURL ? (
                    <img src={foundUser.photoURL} alt={foundUser.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gray-200 flex items-center justify-center h-full w-full">
                      <Users className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{foundUser.displayName}</h4>
                  <p className="text-sm text-gray-500">{foundUser.email}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Trouvé
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleSelectUser}
                  className="flex-1"
                  size="sm"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Ajouter au workspace
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFoundUser(null);
                    setEmail('');
                  }}
                  size="sm"
                >
                  Effacer
                </Button>
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Note importante :</h4>
            <p className="text-xs text-blue-800">
              L&apos;utilisateur doit être déjà inscrit dans l&apos;application pour pouvoir être ajouté au workspace.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
