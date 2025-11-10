import { adminStorage } from './firebase';

// Service Firebase Storage
export class StorageService {
  private bucket = adminStorage.bucket('lumapost-38e61.firebasestorage.app');

  // Générer une URL signée pour l'upload
  async generateSignedUploadUrl(
    fileName: string, 
    contentType: string, 
    expiresIn: number = 15 * 60 * 1000 // 15 minutes par défaut
  ): Promise<{ signedUrl: string; storageKey: string }> {
    const file = this.bucket.file(fileName);
    
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + expiresIn,
      contentType,
    });

    return {
      signedUrl,
      storageKey: fileName,
    };
  }

  // Générer une URL signée pour le téléchargement
  async generateSignedDownloadUrl(
    storageKey: string,
    expiresIn: number = 15 * 60 * 1000 // 15 minutes par défaut
  ): Promise<string> {
    const file = this.bucket.file(storageKey);
    
    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresIn,
    });

    return signedUrl;
  }

  // Upload direct d'un fichier
  async uploadFile(
    file: File | Buffer | Uint8Array,
    fileName: string,
    contentType?: string,
    metadata?: { [key: string]: string }
  ): Promise<{ storageKey: string; downloadUrl: string }> {
    
    const fileRef = this.bucket.file(fileName);
    
    let fileData: Buffer | Uint8Array;
    let finalContentType = contentType;
    
    // Vérifier si c'est un objet File (navigateur) ou un Buffer/Uint8Array (serveur)
    if (file && typeof file === 'object' && 'arrayBuffer' in file && 'type' in file) {
      // C'est un objet File du navigateur
      const arrayBuffer = await file.arrayBuffer();
      fileData = Buffer.from(arrayBuffer);
      finalContentType = contentType || file.type;
    } else {
      // C'est déjà un Buffer ou Uint8Array côté serveur
      fileData = file;
    }
    
    await fileRef.save(fileData, {
      metadata: {
        contentType: finalContentType,
        ...metadata,
      },
    });

    // Rendre le fichier public (optionnel)
    await fileRef.makePublic();
    
    const downloadUrl = `https://storage.googleapis.com/${this.bucket.name}/${fileName}`;
    
    return {
      storageKey: fileName,
      downloadUrl,
    };
  }

  // Supprimer un fichier
  async deleteFile(storageKey: string): Promise<void> {
    
    const file = this.bucket.file(storageKey);
    
    // Vérifier si le fichier existe avant de le supprimer
    const [exists] = await file.exists();
    
    if (!exists) {
      return;
    }
    
    await file.delete();
  }

  // Obtenir les métadonnées d'un fichier
  async getFileMetadata(storageKey: string) {
    const file = this.bucket.file(storageKey);
    const [metadata] = await file.getMetadata();
    return metadata;
  }

  // Lister les fichiers d'un utilisateur
  async listUserFiles(userId: string, prefix = 'uploads/') {
    const [files] = await this.bucket.getFiles({
      prefix: `${prefix}${userId}/`,
    });
    
    return files.map(file => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      timeCreated: file.metadata.timeCreated,
    }));
  }

  // Générer un nom de fichier unique
  generateFileName(userId: string, originalName: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `uploads/${userId}/${timestamp}-${randomId}.${extension}`;
  }

  // Valider le type de fichier
  validateFileType(contentType: string): boolean {
    const allowedTypes = [
      // Vidéos
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
      'video/webm',
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
    return allowedTypes.includes(contentType);
  }

  // Valider la taille du fichier
  validateFileSize(size: number, maxSizeMB = 200): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return size <= maxSizeBytes;
  }
}

// Instance du service
export const storageService = new StorageService();
