import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase";
import { APP_CONFIG } from "@/lib/config";

export async function GET() {
  try {
    // Récupérer le nombre d'inscriptions waitlist via Admin SDK
    const waitlistRef = adminDb.collection("waitlist");
    const snapshot = await waitlistRef.count().get();
    const realCount = snapshot.data().count;

    // Ajouter l'offset configuré (ex: 70 + 4 réels = 74 affichés)
    const displayCount = realCount + APP_CONFIG.waitlist.offset;

    return NextResponse.json({
      success: true,
      count: displayCount,
    });
  } catch (error) {
    console.error("Error fetching waitlist count:", error);
    return NextResponse.json(
      { error: "Erreur serveur", count: APP_CONFIG.waitlist.offset },
      { status: 500 }
    );
  }
}

