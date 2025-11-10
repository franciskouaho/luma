import { NextRequest, NextResponse } from 'next/server';
import { workspaceMemberService } from '@/lib/firestore';
import { adminAuth } from '@/lib/firebase';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: workspaceId, memberId } = await params;
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
    const { role, status } = body;

    // Vérifier que l'utilisateur est propriétaire ou admin du workspace
    const currentMember = await workspaceMemberService.getByWorkspaceAndUser(workspaceId, userId);
    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour modifier les membres' },
        { status: 403 }
      );
    }

    // Récupérer le membre à modifier
    const member = await workspaceMemberService.getById(memberId);
    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le membre appartient au workspace
    if (member.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: 'Membre non trouvé dans ce workspace' },
        { status: 404 }
      );
    }

    // Empêcher la modification du propriétaire
    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Impossible de modifier le propriétaire du workspace' },
        { status: 400 }
      );
    }

    // Mettre à jour le membre
    const updates: any = {};
    if (role) updates.role = role;
    if (status) updates.status = status;

    await workspaceMemberService.update(member.id, updates);

    return NextResponse.json({
      success: true,
      message: 'Membre mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du membre:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { id: workspaceId, memberId } = await params;
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

    // Vérifier que l'utilisateur est propriétaire ou admin du workspace
    const currentMember = await workspaceMemberService.getByWorkspaceAndUser(workspaceId, userId);
    if (!currentMember || !['owner', 'admin'].includes(currentMember.role)) {
      return NextResponse.json(
        { error: 'Permissions insuffisantes pour supprimer des membres' },
        { status: 403 }
      );
    }

    // Récupérer le membre à supprimer
    const member = await workspaceMemberService.getById(memberId);
    if (!member) {
      return NextResponse.json(
        { error: 'Membre non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que le membre appartient au workspace
    if (member.workspaceId !== workspaceId) {
      return NextResponse.json(
        { error: 'Membre non trouvé dans ce workspace' },
        { status: 404 }
      );
    }

    // Empêcher la suppression du propriétaire
    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Impossible de supprimer le propriétaire du workspace' },
        { status: 400 }
      );
    }

    // Supprimer le membre
    await workspaceMemberService.delete(member.id);

    return NextResponse.json({
      success: true,
      message: 'Membre supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du membre:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
