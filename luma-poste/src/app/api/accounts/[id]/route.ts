import { NextRequest, NextResponse } from 'next/server';
import { tiktokAccountService } from '@/lib/firestore';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const accountId = resolvedParams.id;

    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID requis' },
        { status: 400 }
      );
    }

    
    // Supprimer le compte depuis Firestore
    await tiktokAccountService.delete(accountId);
    

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
