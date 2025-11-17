import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { error: "Non authentifié", valid: false },
        { status: 401 }
      );
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Récupérer le code depuis le body
    const { code } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code manquant", message: "Veuillez entrer un code", valid: false },
        { status: 400 }
      );
    }

    // Vérifier si le code existe dans Firestore
    const promoRef = adminDb.collection("promoCodes").doc(code.toUpperCase());
    const promoDoc = await promoRef.get();

    if (!promoDoc.exists) {
      return NextResponse.json(
        { message: "Code invalide", valid: false },
        { status: 200 }
      );
    }

    const promoData = promoDoc.data();

    // Vérifier si le code est actif
    if (!promoData?.active) {
      return NextResponse.json(
        { message: "Code expiré ou désactivé", valid: false },
        { status: 200 }
      );
    }

    // Vérifier si le code a une limite d'utilisation
    if (promoData.maxUses && promoData.usedCount >= promoData.maxUses) {
      return NextResponse.json(
        { message: "Code épuisé", valid: false },
        { status: 200 }
      );
    }

    // Vérifier si l'utilisateur a déjà utilisé ce code
    if (promoData.usedBy && promoData.usedBy.includes(userId)) {
      return NextResponse.json(
        { message: "Code déjà utilisé", valid: false },
        { status: 200 }
      );
    }

    // Vérifier la date d'expiration si elle existe
    if (promoData.expiresAt) {
      const expiresAt = promoData.expiresAt.toDate();
      if (expiresAt < new Date()) {
        return NextResponse.json(
          { message: "Code expiré", valid: false },
          { status: 200 }
        );
      }
    }

    // Code valide - incrémenter le compteur d'utilisation
    await promoRef.update({
      usedCount: (promoData.usedCount || 0) + 1,
      usedBy: [...(promoData.usedBy || []), userId],
      lastUsedAt: new Date(),
    });

    return NextResponse.json({
      valid: true,
      message: "Code appliqué avec succès",
      promoType: promoData.type || "beta",
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Erreur serveur", message: "Erreur lors de la validation", valid: false },
      { status: 500 }
    );
  }
}
