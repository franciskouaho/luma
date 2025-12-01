import { NextRequest, NextResponse } from 'next/server';
import { scheduleService, TikTokAccountService } from '@/lib/firestore';
import { tiktokAPIService } from '@/lib/tiktok-api';
import { FieldValue } from 'firebase-admin/firestore';

// Configuration du timeout pour cette route (300 secondes = 5 minutes)
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      caption, 
      videoUrl,
      thumbnailUrl,
      platforms, 
      mediaType = 'video',
      tiktokSettings
    } = await request.json();


    // Validation des paramètres
    if (!userId || !videoUrl || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'userId, videoUrl et platforms sont requis' },
        { status: 400 }
      );
    }

    // Récupérer les comptes TikTok connectés
    const accountService = new TikTokAccountService();
    const accounts = await accountService.getByUserId(userId);
    
    if (accounts.length === 0) {
      return NextResponse.json(
        { error: 'Aucun compte TikTok connecté' },
        { status: 400 }
      );
    }

    // Trouver le compte TikTok correspondant à la plateforme sélectionnée
    const selectedAccountId = platforms[0];
    const tiktokAccount = accounts.find(account => account.id === selectedAccountId);
    
    if (!tiktokAccount) {
      return NextResponse.json(
        { error: 'Compte TikTok sélectionné non trouvé' },
        { status: 400 }
      );
    }

    // Vérifier les scopes requis pour Direct Post
    const scopes: string[] = Array.isArray(tiktokAccount.scopes) ? tiktokAccount.scopes : [];
    const hasUpload = scopes.includes('video.upload');
    const hasPublish = scopes.includes('video.publish');
    const hasBasic = scopes.includes('user.info.basic');
    
    if (!hasUpload || !hasPublish || !hasBasic) {
      const missingScopes = [];
      if (!hasUpload) missingScopes.push('video.upload');
      if (!hasPublish) missingScopes.push('video.publish');
      if (!hasBasic) missingScopes.push('user.info.basic');
      
      return NextResponse.json(
        { 
          error: `Scopes manquants: ${missingScopes.join(', ')}`,
          details: 'Veuillez révoquer l\'accès à cette application depuis TikTok et refaire le login pour autoriser tous les scopes requis.',
          missingScopes,
          currentScopes: scopes
        },
        { status: 403 }
      );
    }
    
    console.log('✅ Validation scopes côté serveur réussie:', scopes);

    // Publier sur TikTok
    const publishResult = await tiktokAPIService.publishVideoComplete(tiktokAccount, {
      videoUrl: videoUrl,
      title: caption,
      description: caption,
      hashtags: [], // Vous pouvez extraire les hashtags du caption si nécessaire
    }, tiktokSettings || {
      privacyLevel: 'PUBLIC_TO_EVERYONE',
      allowComments: true,
      allowDuet: true,
      allowStitch: true,
      commercialContent: {
        enabled: false,
        yourBrand: false,
        brandedContent: false,
      }
    }, accountService);

    if (!publishResult.success) {
      const errorMessage = 'error' in publishResult ? publishResult.error : 'Erreur inconnue';
      
      // Message spécial pour les applications non auditées
      if (errorMessage.includes('unaudited_client') || errorMessage.includes('non audité')) {
        return NextResponse.json(
          { 
            error: errorMessage,
            suggestion: "Votre application TikTok n'est pas encore audité. La vidéo sera envoyée à TikTok via MEDIA_UPLOAD - vous devrez la finaliser manuellement dans l'application TikTok.",
            unaudited: true
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Erreur de publication TikTok: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Créer le post en base avec statut initial 'queued' - on attend le webhook
    const publishId = 'publishId' in publishResult ? publishResult.publishId : 'unknown';
    const initialStatus = 'queued'; // On attend le webhook pour confirmer la publication
    
    const scheduleId = await scheduleService.create({
      userId,
      caption,
      videoUrl,
      thumbnailUrl,
      platforms,
      scheduledAt: FieldValue.serverTimestamp(),
      status: initialStatus,
      mediaType,
      publishId,
    });


    // Récupérer le post créé
    const newPost = await scheduleService.getById(scheduleId);

    // Construire le message en différenciant Direct Post vs Inbox
    let successMessage = 'Demande de publication envoyée à TikTok';
    const additionalInfo: Record<string, unknown> = {
      inboxMode: false,
      directPostSuccess: false,
      requiresManualPublish: false,
      privacyLevel: ('privacyLevel' in publishResult) ? publishResult.privacyLevel : 'PUBLIC_TO_EVERYONE',
    };

    // Si le service signale explicitement le Direct Post lancé
    if ('directPostSuccess' in publishResult && publishResult.directPostSuccess === true) {
      successMessage = 'Direct Post initialisé – en attente de confirmation';
      additionalInfo.directPostSuccess = true;
    }

    // Si le service renvoie des indices d'Inbox
    if ((publishResult as any).publishType === 'INBOX_SHARE' || (publishResult as any).inboxShare === true) {
      successMessage = 'Upload en Inbox (brouillon) – l\'utilisateur devra finaliser dans l\'app TikTok';
      additionalInfo.inboxMode = true;
      additionalInfo.requiresManualPublish = true;
    }

    // Réponse sans URL finale tant qu'on n'a pas video_id
    return NextResponse.json({
      success: true,
      post: newPost,
      publishId,
      tiktokUrl: undefined, // On attend le webhook avec video_id/share_url
      status: 'queued',
      message: successMessage,
      ...additionalInfo
    }, { status: 201 });

  } catch (error) {
    console.error('=== Erreur lors de la publication immédiate ===');
    console.error('Type d\'erreur:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Message:', error instanceof Error ? error.message : String(error));
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}