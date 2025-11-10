import { NextRequest, NextResponse } from 'next/server';
import { tiktokAPIService } from '@/lib/tiktok-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId est requis' },
        { status: 400 }
      );
    }

    // Générer l'URL d'autorisation TikTok
    const authUrl = tiktokAPIService.getAuthorizationUrl(userId);

    return NextResponse.json({
      authUrl,
    });

  } catch (error) {
    console.error('Erreur lors de la génération de l\'URL d\'autorisation:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
