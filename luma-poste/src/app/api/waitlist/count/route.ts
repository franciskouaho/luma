import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase";

export async function GET() {
  try {
    // Récupérer le nombre d'inscriptions waitlist via Admin SDK
    const waitlistRef = adminDb.collection("waitlist");
    const snapshot = await waitlistRef.count().get();
    const count = snapshot.data().count;

    return NextResponse.json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Error fetching waitlist count:", error);
    return NextResponse.json(
      { error: "Erreur serveur", count: 0 },
      { status: 500 }
    );
  }
}

