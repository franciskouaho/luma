import { NextRequest, NextResponse } from 'next/server';
import { TikTokAccountService } from '@/lib/firestore';
import { tiktokAPIService } from '@/lib/tiktok-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const accountId = searchParams.get('accountId');

    if (!userId || !accountId) {
      return NextResponse.json(
        { error: 'userId et accountId sont requis' },
        { status: 400 }
      );
    }

    // Récupérer le compte TikTok
    const accountService = new TikTokAccountService();
    const accounts = await accountService.getByUserId(userId);
    const account = accounts.find(acc => acc.id === accountId);

    if (!account) {
      return NextResponse.json(
        { error: 'Compte TikTok non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer les informations du créateur
    const creatorInfo = await tiktokAPIService.getCreatorInfo(account);

    if (!creatorInfo) {
      return NextResponse.json(
        { error: 'Impossible de récupérer les informations du créateur' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      creatorInfo
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des infos créateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
