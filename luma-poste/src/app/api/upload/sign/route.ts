import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileData = formData.get('file');
    const fileName = formData.get('fileName') as string;

    if (!fileData) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Vérifier que nous avons bien des données de fichier
    // Note: File n'existe pas côté serveur Node.js, on vérifie les propriétés directement
    if (!fileData || typeof fileData !== 'object') {
      return NextResponse.json(
        { error: 'Format de fichier invalide' },
        { status: 400 }
      );
    }

    // Extraire les propriétés du fichier
    const fileType = fileData.type;
    const fileSize = fileData.size;
    const originalFileName = fileData.name;

    // Vérifier que nous avons les propriétés nécessaires
    if (!fileType || !fileSize || !originalFileName) {
      return NextResponse.json(
        { error: 'Propriétés de fichier manquantes' },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    if (!storageService.validateFileType(fileType)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Formats autorisés: MP4, MOV, AVI, WMV, WebM, JPEG, PNG, GIF, WebP' },
        { status: 400 }
      );
    }

    // Validation de la taille
    if (!storageService.validateFileSize(fileSize)) {
      return NextResponse.json(
        { error: 'La taille du fichier ne doit pas dépasser 200MB' },
        { status: 400 }
      );
    }

    // Utiliser le nom fourni ou générer un nom unique
    const finalFileName = fileName || storageService.generateFileName('user', originalFileName);

    // Convertir le fichier en Buffer pour éviter l'erreur File is not defined
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload direct vers Firebase Storage avec le Buffer
    const uploadResult = await storageService.uploadFile(fileBuffer, finalFileName, fileType);
    
    return NextResponse.json({
      downloadURL: uploadResult.downloadUrl, // Utiliser downloadUrl de l'objet retourné
      fileName: finalFileName,
      size: fileSize,
      type: fileType
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload du fichier:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
