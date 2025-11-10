import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/lib/firestore';
import { adminAuth } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        userId = decodedToken.uid;
      } catch (error) {
        console.error('Erreur de vérification du token:', error);
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'L\'email est requis' },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur par email
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return NextResponse.json({
        success: true,
        user: null,
        message: 'Aucun utilisateur trouvé avec cet email'
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }
    });

  } catch (error) {
    console.error('Erreur lors de la recherche d\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
