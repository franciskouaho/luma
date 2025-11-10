import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action requise' },
        { status: 400 }
      );
    }

    // Note: La planification est maintenant gérée par la Cloud Function checkScheduledPosts
    // qui tourne toutes les minutes. Cette route retourne juste un succès.

    console.log('Cloud Tasks action:', action, 'data:', data);

    // Retourner succès - la Cloud Function checkScheduledPosts gérera la publication
    return NextResponse.json({
      success: true,
      message: 'Schedule enregistré - sera traité par checkScheduledPosts',
      action,
      scheduledAt: data.scheduledAt
    });

  } catch (error) {
    console.error('Erreur Cloud Tasks:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
