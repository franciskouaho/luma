import { adminAuth } from "@/lib/firebase";
import { tiktokAccountService } from "@/lib/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get("userId");

    console.log("🔍 API /accounts - userId from params:", userId);

    // Récupérer le token d'authentification depuis les headers si pas de userId
    if (!userId) {
      const authHeader = request.headers.get("authorization");

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        try {
          const decodedToken = await adminAuth.verifyIdToken(token);
          userId = decodedToken.uid;
          console.log("🔍 API /accounts - userId from token:", userId);
        } catch (error) {
          console.error("Erreur de vérification du token:", error);
        }
      }
    }

    // Vérifier qu'on a un userId authentifié
    if (!userId) {
      console.error("🔍 API /accounts - No userId available");
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    console.log("🔍 API /accounts - fetching accounts for userId:", userId);

    // Récupérer les comptes TikTok depuis Firestore
    const accounts = await tiktokAccountService.getByUserId(userId);

    console.log("✅ API /accounts - found accounts:", accounts.length);
    console.log(
      "✅ API /accounts - accounts data:",
      JSON.stringify(accounts, null, 2),
    );

    return NextResponse.json({
      success: true,
      accounts: accounts.map((account) => ({
        id: account.id,
        username: account.username,
        displayName: account.displayName,
        avatarUrl: account.avatarUrl,
        isActive: account.isActive,
        platform: account.platform,
      })),
    });
  } catch (error) {
    console.error(
      "❌ API /accounts - Erreur lors de la récupération des comptes:",
      error,
    );
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
