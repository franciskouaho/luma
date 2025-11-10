import { NextRequest, NextResponse } from 'next/server';
import { scheduleService } from '@/lib/firestore';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const id = searchParams.get('id');

    // Si un ID spécifique est demandé, récupérer cette planification
    if (id) {

      const schedule = await scheduleService.getById(id);
      
      if (!schedule) {
        return NextResponse.json(
          { error: 'Planification non trouvée' },
          { status: 404 }
        );
      }


      return NextResponse.json({
        success: true,
        schedule
      });
    }

    // Sinon, récupérer toutes les planifications de l'utilisateur
    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }


    // Récupérer les planifications
    const schedules = await scheduleService.getByUserId(userId, status || undefined);


    return NextResponse.json({
      success: true,
      schedules,
      count: schedules.length
    });

  } catch (error) {
    console.error('=== Erreur lors de la récupération des planifications ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      caption, 
      videoUrl,
      thumbnailUrl,
      platforms, 
      scheduledAt, 
      status = 'scheduled',
      mediaType = 'video'
    } = await request.json();


    // Validation des paramètres
    if (!userId || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'userId et platforms sont requis' },
        { status: 400 }
      );
    }

    // Créer le post planifié
    const scheduleId = await scheduleService.create({
      userId,
      caption,
      videoUrl,
      thumbnailUrl,
      platforms,
      scheduledAt: scheduledAt ? Timestamp.fromDate(new Date(scheduledAt)) : FieldValue.serverTimestamp(),
      status,
      mediaType,
    });


    // Programmer la tâche Cloud Tasks pour la publication automatique
    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://luma-post.emplica.fr';
      const payload = {
        action: 'scheduleTask',
        scheduleId: scheduleId,
        videoId: videoUrl,
        accountId: platforms[0],
        userId: userId,
        scheduledAt: scheduledAt || new Date().toISOString()
      };
      const bodyStr = JSON.stringify(payload);
      const cloudTasksResponse = await fetch(`${appUrl}/api/cloud-tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: bodyStr,
      });

      if (!cloudTasksResponse.ok) {
        throw new Error(`Erreur HTTP ${cloudTasksResponse.status}`);
      }

      await cloudTasksResponse.json();
    } catch (taskError) {
      console.error('Erreur lors de la programmation de la tâche Cloud Tasks:', taskError);
      // Ne pas faire échouer la création du post, juste logger l'erreur
    }

    // Récupérer le post créé
    const newSchedule = await scheduleService.getById(scheduleId);

    return NextResponse.json({
      success: true,
      schedule: newSchedule,
      message: 'Post planifié avec succès'
    }, { status: 201 });

  } catch (error) {
    console.error('=== Erreur lors de la création du post planifié ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'ID de la planification requis' },
        { status: 400 }
      );
    }

    const { 
      userId, 
      caption, 
      videoUrl, 
      thumbnailUrl, 
      platforms, 
      scheduledAt, 
      status, 
      mediaType 
    } = await request.json();

    if (!userId || !platforms || !scheduledAt) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }


    // Mettre à jour la planification
    await scheduleService.update(scheduleId, {
      userId,
      caption,
      videoUrl,
      thumbnailUrl,
      platforms,
      scheduledAt: scheduledAt ? Timestamp.fromDate(new Date(scheduledAt)) : FieldValue.serverTimestamp(),
      status,
      mediaType,
    });

    // Récupérer la planification mise à jour
    const updatedSchedule = await scheduleService.getById(scheduleId);


    return NextResponse.json({
      success: true,
      schedule: updatedSchedule,
      message: 'Planification mise à jour avec succès'
    });

  } catch (error) {
    console.error('=== Erreur lors de la mise à jour de la planification ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scheduleId = searchParams.get('id');

    if (!scheduleId) {
      return NextResponse.json(
        { error: 'ID de la planification requis' },
        { status: 400 }
      );
    }


    // Supprimer la planification
    await scheduleService.delete(scheduleId);


    return NextResponse.json({
      success: true,
      message: 'Planification supprimée avec succès'
    });

  } catch (error) {
    console.error('=== Erreur lors de la suppression de la planification ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}