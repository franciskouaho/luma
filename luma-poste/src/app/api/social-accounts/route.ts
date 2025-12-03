import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase";
import { socialAccountService } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.error("❌ GET /api/social-accounts - Pas de token");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    console.log("📥 GET /api/social-accounts - userId:", userId, "workspaceId:", workspaceId);

    if (!workspaceId) {
      console.error("❌ GET /api/social-accounts - Pas de workspaceId");
      return NextResponse.json(
        { error: "workspaceId requis" },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur est membre du workspace
    const { workspaceMemberService } = await import("@/lib/firestore");
    const member = await workspaceMemberService.getByWorkspaceAndUser(
      workspaceId,
      userId,
    );

    console.log("👤 Member trouvé:", member ? `${member.role} (${member.status})` : "null");

    if (!member || member.status !== "active") {
      console.error("❌ GET /api/social-accounts - Utilisateur non membre ou inactif");
      return NextResponse.json(
        { error: "Accès non autorisé au workspace" },
        { status: 403 },
      );
    }

    const accounts = await socialAccountService.getByWorkspaceId(workspaceId);
    console.log("✅ GET /api/social-accounts - Retour de", accounts.length, "comptes");

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des comptes sociaux:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const body = await request.json();
    const { workspaceId, platform, accountName, username, email, password, notes } = body;

    if (!workspaceId || !platform || !accountName || !username) {
      return NextResponse.json(
        { error: "Champs requis manquants" },
        { status: 400 },
      );
    }

    // Vérifier que l'utilisateur est membre du workspace avec permissions
    const { workspaceMemberService, userService } = await import("@/lib/firestore");
    const member = await workspaceMemberService.getByWorkspaceAndUser(
      workspaceId,
      userId,
    );

    if (!member || member.status !== "active") {
      return NextResponse.json(
        { error: "Accès non autorisé au workspace" },
        { status: 403 },
      );
    }

    // Seuls owner, admin et editor peuvent ajouter des comptes
    if (!["owner", "admin", "editor"].includes(member.role)) {
      return NextResponse.json(
        { error: "Permissions insuffisantes" },
        { status: 403 },
      );
    }

    // Récupérer le nom de l'utilisateur
    const user = await userService.getUserById(userId);

    // Créer le compte
    const accountId = await socialAccountService.create({
      workspaceId,
      platform,
      accountName,
      username,
      email: email || undefined,
      password: password || undefined, // TODO: crypter le mot de passe
      notes: notes || undefined,
      addedBy: userId,
      addedByName: user?.displayName || "Utilisateur",
    });

    const newAccount = await socialAccountService.getById(accountId);

    return NextResponse.json(newAccount, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du compte social:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
