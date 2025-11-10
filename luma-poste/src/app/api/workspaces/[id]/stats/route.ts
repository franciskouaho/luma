import { NextRequest, NextResponse } from 'next/server';
import { workspaceMemberService, workspaceService, scheduleService } from '@/lib/firestore';
import { adminAuth } from '@/lib/firebase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: workspaceId } = await params;
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

    // Vérifier que l'utilisateur a accès au workspace
    const member = await workspaceMemberService.getByWorkspaceAndUser(workspaceId, userId);
    
    if (!member) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce workspace' },
        { status: 403 }
      );
    }

    // Récupérer les statistiques du workspace
    const [
      members,
      allSchedules
    ] = await Promise.all([
      // Nombre de membres
      workspaceMemberService.getByWorkspaceId(workspaceId).then(members => members.length),
      
      // Récupérer tous les schedules du workspace
      scheduleService.getByWorkspaceId(workspaceId)
    ]);

    // Calculer les statistiques à partir des schedules
    const posts = allSchedules.filter(schedule => schedule.status === 'published').length;
    const scheduled = allSchedules.filter(schedule => schedule.status === 'scheduled').length;
    const views = allSchedules
      .filter(schedule => schedule.status === 'published')
      .reduce((total, schedule) => total + (schedule.views || 0), 0);

    const stats = {
      members,
      posts,
      scheduled,
      views
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
