import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase";
import { socialAccountService, workspaceMemberService } from "@/lib/firestore";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { id } = await params;
    const body = await request.json();

    // Récupérer le compte pour vérifier le workspace
    const account = await socialAccountService.getById(id);
    if (!account) {
      return NextResponse.json(
        { error: "Compte non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier les permissions
    const member = await workspaceMemberService.getByWorkspaceAndUser(
      account.workspaceId,
      userId,
    );

    if (!member || member.status !== "active") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    if (!["owner", "admin", "editor"].includes(member.role)) {
      return NextResponse.json(
        { error: "Permissions insuffisantes" },
        { status: 403 },
      );
    }

    // Mettre à jour le compte
    await socialAccountService.update(id, body);
    const updatedAccount = await socialAccountService.getById(id);

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du compte:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { id } = await params;

    // Récupérer le compte pour vérifier le workspace
    const account = await socialAccountService.getById(id);
    if (!account) {
      return NextResponse.json(
        { error: "Compte non trouvé" },
        { status: 404 },
      );
    }

    // Vérifier les permissions
    const member = await workspaceMemberService.getByWorkspaceAndUser(
      account.workspaceId,
      userId,
    );

    if (!member || member.status !== "active") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    if (!["owner", "admin", "editor"].includes(member.role)) {
      return NextResponse.json(
        { error: "Permissions insuffisantes" },
        { status: 403 },
      );
    }

    await socialAccountService.delete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
