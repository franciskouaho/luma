import { NextRequest, NextResponse } from 'next/server';
import { workspaceService, workspaceMemberService } from '@/lib/firestore';
import { adminAuth } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Route pour corriger les workspaces existants en ajoutant les propriétaires comme membres
 * GET /api/workspaces/fix-members
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer les workspaces de l'utilisateur
    const ownedWorkspaces = await workspaceService.getByOwnerId(userId);

    const fixed = [];
    const skipped = [];

    for (const workspace of ownedWorkspaces) {
      // Vérifier si l'utilisateur est déjà membre
      const existingMember = await workspaceMemberService.getByWorkspaceAndUser(
        workspace.id,
        userId
      );

      if (existingMember) {
        skipped.push({
          workspaceId: workspace.id,
          name: workspace.name,
          reason: 'Déjà membre'
        });
        continue;
      }

      // Récupérer les informations de l'utilisateur
      const userInfo = await adminAuth.getUser(userId);

      // Ajouter le propriétaire comme membre
      await workspaceMemberService.create({
        workspaceId: workspace.id,
        userId,
        email: userInfo.email || '',
        displayName: userInfo.displayName || userInfo.email?.split('@')[0] || 'Utilisateur',
        photoURL: userInfo.photoURL || '',
        role: 'owner',
        status: 'active',
        invitedBy: userId,
        joinedAt: FieldValue.serverTimestamp()
      });

      fixed.push({
        workspaceId: workspace.id,
        name: workspace.name
      });
    }

    return NextResponse.json({
      success: true,
      message: `${fixed.length} workspace(s) corrigé(s), ${skipped.length} ignoré(s)`,
      fixed,
      skipped
    });

  } catch (error) {
    console.error('Erreur lors de la correction des workspaces:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
