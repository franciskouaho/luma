import { NextRequest, NextResponse } from 'next/server';
import { videoService } from '@/lib/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    // Récupérer les vidéos de l'utilisateur
    const videos = await videoService.getByUserId(userId, limit);

    // Filtrer par statut si spécifié
    const filteredVideos = status 
      ? videos.filter(video => video.status === status)
      : videos;

    return NextResponse.json({
      videos: filteredVideos,
      total: filteredVideos.length,
      hasMore: filteredVideos.length === limit
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des vidéos:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, title, storageKey, duration, size } = await request.json();

    // Validation des paramètres
    if (!userId || !title || !storageKey || !duration || !size) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Créer une nouvelle vidéo
    const videoId = await videoService.create({
      userId,
      title,
      storageKey,
      thumbnailKey: storageKey.replace(/\.(mp4|mov|avi|wmv|webm)$/, '.jpg'),
      duration,
      size,
      status: 'uploaded',
    });

    // Récupérer la vidéo créée
    const newVideo = await videoService.getById(videoId);

    return NextResponse.json(newVideo, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la vidéo:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
