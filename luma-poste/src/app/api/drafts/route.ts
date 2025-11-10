import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'FGcdXcRXVoVfsSwJIciurCeuCXz1';
    const limit = parseInt(searchParams.get('limit') || '50');


    // Récupérer les drafts depuis Firestore
    // Simplifier la requête pour éviter le besoin d'index composite
    const draftsSnapshot = await adminDb
      .collection('drafts')
      .where('userId', '==', userId)
      .where('status', '==', 'draft')
      .get();

    const drafts = draftsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(),
      };
    });

    // Trier côté JavaScript par createdAt (plus récent en premier)
    drafts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Limiter le nombre de résultats
    const limitedDrafts = drafts.slice(0, limit);


    return NextResponse.json({
      success: true,
      drafts: limitedDrafts
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des drafts:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, caption, videoFile, videoUrl, platforms, mediaType, thumbnailUrl } = await request.json();

    if (!userId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'userId et platforms (tableau non vide) sont requis' },
        { status: 400 }
      );
    }


    const draftData = {
      userId,
      caption: caption || 'Draft post',
      videoFile: videoFile || '',
      videoUrl: videoUrl || '',
      platforms,
      mediaType: mediaType || 'video',
      thumbnailUrl: thumbnailUrl || '',
      status: 'draft',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    const docRef = await adminDb.collection('drafts').add(draftData);


    return NextResponse.json({
      success: true,
      draftId: docRef.id
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création du draft:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('id');

    if (!draftId) {
      return NextResponse.json(
        { error: 'ID du draft requis' },
        { status: 400 }
      );
    }


    // Récupérer les données du draft avant suppression
    const draftDoc = await adminDb.collection('drafts').doc(draftId).get();
    
    if (!draftDoc.exists) {
      return NextResponse.json(
        { error: 'Draft non trouvé' },
        { status: 404 }
      );
    }

    const draftData = draftDoc.data();
    
    // Supprimer la vidéo et la thumbnail du Firebase Storage si elles existent
    const { storageService } = await import('@/lib/storage');
    
    // Log des fichiers à supprimer
    console.log('Suppression des fichiers du draft:', {
      videoUrl: draftData?.videoUrl,
      thumbnailUrl: draftData?.thumbnailUrl,
      caption: draftData?.caption
    });
    
    // Supprimer la vidéo
    if (draftData?.videoUrl) {
      try {
        
        // Extraire le nom du fichier de l'URL Firebase Storage
        let videoStorageKey = '';
        
        if (draftData.videoUrl.includes('storage.googleapis.com')) {
          const urlParts = draftData.videoUrl.split('/');
          const bucketIndex = urlParts.findIndex((part: string) => part.includes('firebasestorage.app'));
          if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
            const pathParts = urlParts.slice(bucketIndex + 1);
            videoStorageKey = pathParts.join('/');
          }
        } else if (draftData.videoUrl.includes('videos/')) {
          const urlParts = draftData.videoUrl.split('/');
          const videosIndex = urlParts.findIndex((part: string) => part === 'videos');
          if (videosIndex !== -1 && videosIndex + 1 < urlParts.length) {
            const fileName = urlParts[videosIndex + 1];
            videoStorageKey = `videos/${fileName}`;
          }
        } else {
          const urlParts = draftData.videoUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          videoStorageKey = `videos/${fileName}`;
        }
        
        
        await storageService.deleteFile(videoStorageKey);
      } catch (error) {
        console.error('❌ Erreur suppression vidéo:', error);
        console.error('Détails de l\'erreur vidéo:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: (error as any)?.code,
          videoUrl: draftData?.videoUrl
        });
      }
    }
    
    // Supprimer la thumbnail
    if (draftData?.thumbnailUrl) {
      try {
        
        // Extraire le nom du fichier de l'URL Firebase Storage
        let thumbnailStorageKey = '';
        
        if (draftData.thumbnailUrl.includes('storage.googleapis.com')) {
          // URL complète Firebase Storage
          const urlParts = draftData.thumbnailUrl.split('/');
          const bucketIndex = urlParts.findIndex((part: string) => part.includes('firebasestorage.app'));
          if (bucketIndex !== -1 && bucketIndex + 1 < urlParts.length) {
            const pathParts = urlParts.slice(bucketIndex + 1);
            thumbnailStorageKey = pathParts.join('/');
          }
        } else if (draftData.thumbnailUrl.includes('thumbnails/')) {
          // URL avec thumbnails/
          const urlParts = draftData.thumbnailUrl.split('/');
          const thumbnailsIndex = urlParts.findIndex((part: string) => part === 'thumbnails');
          if (thumbnailsIndex !== -1 && thumbnailsIndex + 1 < urlParts.length) {
            const fileName = urlParts[thumbnailsIndex + 1];
            thumbnailStorageKey = `thumbnails/${fileName}`;
          }
        } else {
          // Fallback: prendre le dernier segment et l'ajouter à thumbnails/
          const urlParts = draftData.thumbnailUrl.split('/');
          const fileName = urlParts[urlParts.length - 1];
          // Nettoyer le nom de fichier (enlever les paramètres d'URL)
          const cleanFileName = fileName.split('?')[0].split('=')[0];
          thumbnailStorageKey = `thumbnails/${cleanFileName}`;
        }
        
        
        await storageService.deleteFile(thumbnailStorageKey);
      } catch (error) {
        console.error('❌ Erreur suppression thumbnail:', error);
        console.error('Détails de l\'erreur:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          code: (error as any)?.code,
          thumbnailUrl: draftData?.thumbnailUrl
        });
      }
    }

    // Supprimer le draft de Firestore
    await adminDb.collection('drafts').doc(draftId).delete();

    return NextResponse.json({
      success: true,
      message: 'Draft et vidéo supprimés'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du draft:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
