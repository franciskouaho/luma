import { NextRequest, NextResponse } from 'next/server';
import { TikTokAccountService } from '@/lib/firestore';
import { tiktokAPIService } from '@/lib/tiktok-api';

export async function POST(request: NextRequest) {
  try {
    const { publishId, accountId, userId } = await request.json();

    if (!publishId || !accountId || !userId) {
      return NextResponse.json(
        {
          error: 'publishId, accountId et userId sont requis',
        },
        { status: 400 },
      );
    }

    const accountService = new TikTokAccountService();
    const account = await accountService.getById(accountId);

    if (!account || account.userId !== userId) {
      return NextResponse.json(
        {
          error: "Compte TikTok introuvable ou vous n'y avez pas accès",
        },
        { status: 404 },
      );
    }

    const statusResult = await tiktokAPIService.fetchPublishStatus(
      account,
      publishId,
      accountService,
    );

    return NextResponse.json(
      {
        success: true,
        status: statusResult.status,
        failReason: statusResult.failReason,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Erreur API publish/status:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Erreur inconnue lors de la récupération du statut',
      },
      { status: 500 },
    );
  }
}

