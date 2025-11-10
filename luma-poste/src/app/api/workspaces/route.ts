import { NextRequest, NextResponse } from 'next/server';
import { workspaceService, workspaceMemberService } from '@/lib/firestore';
import { adminAuth } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
      try {
        // Récupérer le token d'authentification depuis les headers
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
        let ownedWorkspaces = [];
        let memberWorkspaces = [];
        
        try {
          ownedWorkspaces = await workspaceService.getByOwnerId(userId);
          memberWorkspaces = await workspaceMemberService.getByUserId(userId);
        } catch (dbError) {
          console.error('Erreur base de données:', dbError);
          throw dbError;
        }

    // Récupérer les détails des workspaces dont l'utilisateur est membre
    const memberWorkspaceDetails = await Promise.all(
      memberWorkspaces.map(async (member) => {
        const workspace = await workspaceService.getById(member.workspaceId);
        return workspace ? { ...workspace, memberRole: member.role } : null;
      })
    );

    const allWorkspaces = [
      ...ownedWorkspaces.map(ws => ({ ...ws, memberRole: 'owner' as const })),
      ...memberWorkspaceDetails.filter(Boolean)
    ].filter(Boolean) as NonNullable<typeof memberWorkspaceDetails[0]>[];

    // Déduplication des workspaces (au cas où l'utilisateur serait à la fois propriétaire et membre)
    const uniqueWorkspaces = allWorkspaces.reduce((acc, workspace) => {
      const existing = acc.find(w => w.id === workspace.id);
      if (!existing) {
        acc.push(workspace);
      } else {
        // Si l'utilisateur est à la fois propriétaire et membre, privilégier le rôle de propriétaire
        if (workspace.memberRole === 'owner') {
          const index = acc.findIndex(w => w.id === workspace.id);
          acc[index] = workspace;
        }
      }
      return acc;
    }, [] as typeof allWorkspaces);

        return NextResponse.json({
          success: true,
          workspaces: uniqueWorkspaces
        });

  } catch (error) {
    console.error('Erreur lors de la récupération des workspaces:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Le nom du workspace est requis' },
        { status: 400 }
      );
    }

    // Créer le workspace
    const workspaceId = await workspaceService.create({
      name,
      description,
      ownerId: userId,
      settings: {
        allowMemberInvites: true,
        requireApprovalForPosts: false,
        allowMemberAccountConnections: true
      }
    });

    // Récupérer les informations de l'utilisateur
    const userInfo = await adminAuth.getUser(userId);
    
    // Ajouter le propriétaire comme membre
    await workspaceMemberService.create({
      workspaceId,
      userId,
      email: userInfo.email || '',
      displayName: userInfo.displayName || '',
      photoURL: userInfo.photoURL || '',
      role: 'owner',
      status: 'active',
      invitedBy: userId,
      joinedAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({
      success: true,
      workspaceId
    });

  } catch (error) {
    console.error('Erreur lors de la création du workspace:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
