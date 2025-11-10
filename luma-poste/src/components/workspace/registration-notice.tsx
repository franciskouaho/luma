'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink, Mail } from 'lucide-react';

interface RegistrationNoticeProps {
  onInviteUser?: () => void;
}

export function RegistrationNotice({ onInviteUser }: RegistrationNoticeProps) {
  return (
    <Card className="p-6 border-blue-200 bg-blue-50">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Inviter des membres à votre workspace
          </h3>
          
          <div className="space-y-3">
            <p className="text-blue-800">
              Pour ajouter des membres à votre workspace, ils doivent d'abord être inscrits dans l'application Luma Post.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Comment inviter quelqu'un :</h4>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Demandez à la personne de s'inscrire sur Luma Post</li>
                <li>Une fois inscrite, utilisez la fonction "Rechercher un utilisateur"</li>
                <li>Saisissez son adresse email pour l'ajouter au workspace</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              {onInviteUser && (
                <Button
                  onClick={onInviteUser}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email d'invitation
                </Button>
              )}
              
              <Button
                variant="outline"
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => window.open('https://luma-post.com/auth', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Lien d'inscription
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
