import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Récupérer le nombre de crédits à déduire
    const { credits = 1 } = await req.json();

    if (typeof credits !== "number" || credits < 0) {
      return NextResponse.json(
        { error: "Nombre de crédits invalide" },
        { status: 400 }
      );
    }

    // Mettre à jour les crédits utilisés dans Firestore
    const statsRef = adminDb.doc(`stats/${userId}_usage`);

    // Récupérer les stats actuelles
    const statsDoc = await statsRef.get();
    const currentCredits = statsDoc.data()?.aiCreditsUsed || 0;

    // Mettre à jour avec increment
    await statsRef.set({
      aiCreditsUsed: currentCredits + credits,
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      creditsDeducted: credits,
      totalCreditsUsed: currentCredits + credits,
    });
  } catch (error) {
    console.error("Error deducting AI credits:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
