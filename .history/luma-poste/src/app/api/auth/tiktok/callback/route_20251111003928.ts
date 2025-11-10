import { EncryptionService } from "@/lib/encryption";
import { adminDb } from "@/lib/firebase";
import { tiktokAccountService } from "@/lib/firestore";
import { tiktokAPIService } from "@/lib/tiktok-api";
import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";

const MOBILE_UNIVERSAL_LINK =
  process.env.TIKTOK_MOBILE_UNIVERSAL_LINK ||
  "https://luma-post.emplica.fr/auth/tiktok/callback";
const MOBILE_CUSTOM_SCHEME =
  process.env.TIKTOK_MOBILE_CUSTOM_SCHEME ||
  "luma://auth/tiktok/callback";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state"); // Format: mobile_randomState OU userId_timestamp_random
    const error = searchParams.get("error");

    // Extraire la plateforme dynamiquement depuis l'URL
    const url = new URL(request.url);
    const platform = url.pathname.split("/")[3]; // /api/auth/[platform]/callback

    // DÉTECTION APP MOBILE: Si state commence par "mobile_", c'est l'app mobile
    const isMobileApp = state?.startsWith("mobile_");

    console.log("📡 TikTok callback reçu", {
      url: request.url,
      codePresent: !!code,
      state,
      error,
      isMobileApp,
    });

    if (isMobileApp) {
      return await handleMobileCallback({
        code,
        state,
        error,
      });
    }

    // Extract userId from state
    // Format mobile: mobile_randomState
    // Format web: userId_timestamp_random
    const userId = state && !isMobileApp ? state.split("_")[0] : null;

    if (error) {
      return NextResponse.json(
        { error: `Erreur d'autorisation TikTok: ${error}` },
        { status: 400 },
      );
    }

    if (!code || !state || !userId) {
      return NextResponse.json(
        { error: "Code d'autorisation et state requis" },
        { status: 400 },
      );
    }

    // Échanger le code contre des tokens
    const tokenResponse = await tiktokAPIService.exchangeCodeForTokens(code);

    // VALIDATION STRICTE DES SCOPES - FORCER LES 3 SCOPES REQUIS
    console.log("🔍 Validation des scopes TikTok reçus:", tokenResponse.scope);
    const scopes = new Set(
      tokenResponse.scope.split(",").map((s: string) => s.trim()),
    );
    const requiredScopes = ["user.info.basic", "video.upload", "video.publish"];
    const missingScopes = requiredScopes.filter((s) => !scopes.has(s));

    if (missingScopes.length > 0) {
      console.error("❌ Scopes manquants:", missingScopes);
      return NextResponse.json(
        {
          error: `Scopes manquants: ${missingScopes.join(", ")}`,
          details:
            "Veuillez révoquer l'accès à cette application depuis TikTok et refaire le login pour autoriser tous les scopes requis.",
          missingScopes,
          requiredScopes,
          receivedScopes: Array.from(scopes),
        },
        { status: 403 },
      );
    }

    console.log("✅ Tous les scopes requis sont présents:", Array.from(scopes));

    // Obtenir les informations de l'utilisateur TikTok
    const userInfo = await tiktokAPIService.getUserInfo(
      tokenResponse.access_token,
    );

    const openId = userInfo.data.user.open_id;
    console.log("✅ Compte TikTok connecté - Open ID:", openId);

    if (userInfo.error && userInfo.error.code !== "ok") {
      return NextResponse.json(
        {
          error: `Erreur lors de la récupération des informations utilisateur: ${userInfo.error.message}`,
        },
        { status: 400 },
      );
    }

    // Utiliser le service de chiffrement pour les tokens

    // Créer le compte TikTok avec le vrai userId (extrait du state)
    await tiktokAccountService.create({
      userId: userId, // Le userId extrait du state (format userId_timestamp_random)
      platform: platform as "tiktok", // Plateforme extraite dynamiquement de l'URL
      tiktokUserId: userInfo.data.user.open_id,
      username: userInfo.data.user.display_name,
      displayName: userInfo.data.user.display_name,
      avatarUrl: userInfo.data.user.avatar_url,
      accessTokenEnc: EncryptionService.encrypt(tokenResponse.access_token),
      refreshTokenEnc: EncryptionService.encrypt(tokenResponse.refresh_token),
      expiresAt: FieldValue.serverTimestamp(),
      isActive: true,
      scopes: tokenResponse.scope ? tokenResponse.scope.split(",") : [], // Sauvegarder les scopes
    });

    // Rediriger vers le dashboard avec un message de succès
    // Utiliser TIKTOK_REDIRECT_URI pour construire l'URL de base
    const baseUrl =
      process.env.TIKTOK_REDIRECT_URI?.replace(
        "/api/auth/tiktok/callback",
        "",
      ) || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/dashboard/accounts?connected=true`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("=== Erreur dans TikTok Callback ===");
    console.error(
      "Type d'erreur:",
      error instanceof Error ? error.constructor.name : typeof error,
    );
    console.error(
      "Message:",
      error instanceof Error ? error.message : String(error),
    );
    console.error("Stack:", error instanceof Error ? error.stack : "No stack");
    console.error("=== Fin de l'erreur ===");

    // Rediriger vers le dashboard avec un message d'erreur
    const baseUrl =
      process.env.TIKTOK_REDIRECT_URI?.replace(
        "/api/auth/tiktok/callback",
        "",
      ) || "http://localhost:3000";
    const redirectUrl = `${baseUrl}/dashboard/accounts?error=connection_failed`;

    return NextResponse.redirect(redirectUrl);
  }
}

interface MobileCallbackParams {
  code: string | null;
  state: string | null;
  error: string | null;
}

async function handleMobileCallback({
  code,
  state,
  error,
}: MobileCallbackParams): Promise<NextResponse> {
  console.log("📱 Gestion callback mobile", {
    codePresent: !!code,
    state,
    error,
  });

  if (error) {
    console.error("❌ Erreur d'autorisation TikTok (mobile):", error);
    return buildMobileRedirectResponse({
      errorMessage: `Erreur d'autorisation TikTok: ${error}`,
    });
  }

  if (!code) {
    console.error("❌ Code TikTok manquant pour flux mobile");
    return buildMobileRedirectResponse({
      errorMessage: "Code d'autorisation TikTok manquant",
    });
  }

  if (!state) {
    console.error("❌ State TikTok manquant pour flux mobile");
    return buildMobileRedirectResponse({
      errorMessage: "Paramètre state manquant",
    });
  }

  try {
    // Échanger le code contre des tokens
    const tokenResponse = await tiktokAPIService.exchangeCodeForTokens(code);
    console.log("🔄 Tokens TikTok mobile obtenus", {
      hasAccessToken: !!tokenResponse.access_token,
      hasRefreshToken: !!tokenResponse.refresh_token,
      scope: tokenResponse.scope,
    });

    // Validation des scopes
    const scopes = new Set(
      tokenResponse.scope.split(",").map((s: string) => s.trim()),
    );
    const requiredScopes = ["user.info.basic", "video.upload", "video.publish"];
    const missingScopes = requiredScopes.filter((s) => !scopes.has(s));

    if (missingScopes.length > 0) {
      console.error("❌ Scopes manquants (mobile):", missingScopes);
      return buildMobileRedirectResponse({
        errorMessage: `Scopes manquants: ${missingScopes.join(", ")}`,
      });
    }

    // Récupérer les informations de l'utilisateur TikTok
    const userInfo = await tiktokAPIService.getUserInfo(
      tokenResponse.access_token,
    );
    const rawUser = userInfo?.data?.user;

    if (userInfo.error && userInfo.error.code !== "ok") {
      console.error(
        "❌ Erreur récupération infos TikTok (mobile):",
        userInfo.error,
      );
      return buildMobileRedirectResponse({
        errorMessage: `Erreur infos utilisateur: ${userInfo.error.message}`,
      });
    }

    if (!rawUser?.open_id) {
      console.error(
        "❌ Infos utilisateur TikTok incomplètes (mobile):",
        rawUser,
      );
      return buildMobileRedirectResponse({
        errorMessage:
          "Impossible de récupérer les informations du profil TikTok",
      });
    }

    const normalizedUserInfo = {
      displayName: rawUser.display_name ?? null,
      username: (rawUser as { username?: string })?.username ?? null,
      avatarUrl: rawUser.avatar_url ?? null,
      followerCount: (rawUser as { follower_count?: number })?.follower_count ?? 0,
      followingCount: (rawUser as { following_count?: number })?.following_count ?? 0,
      likesCount: (rawUser as { likes_count?: number })?.likes_count ?? 0,
      videoCount: (rawUser as { video_count?: number })?.video_count ?? 0,
    };

    const sessionToken = state;
    const expiresAt = Date.now() + 5 * 60 * 1000;

    console.log("🔐 Création session mobile TikTok", {
      sessionToken,
      expiresAt,
      hasAccessToken: !!tokenResponse.access_token,
      hasRefreshToken: !!tokenResponse.refresh_token,
      rawUserKeys: Object.keys(rawUser ?? {}),
    });

    const sessionPayload = {
      tiktok: {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiry: Date.now() + tokenResponse.expires_in * 1000,
        openId: rawUser.open_id,
        scope: tokenResponse.scope,
        userInfo: normalizedUserInfo,
      },
      createdAt: FieldValue.serverTimestamp(),
      expiresAt,
      state,
      code,
      source: "next-api",
    };

    console.log("📝 Données session à enregistrer:", {
      sessionToken,
      payloadPreview: {
        expiresAt,
        state,
        codePresent: !!code,
        userInfo: normalizedUserInfo,
      },
    });

    await adminDb
      .collection("tiktok_sessions")
      .doc(sessionToken)
      .set(sessionPayload);

    console.log("✅ Session mobile TikTok enregistrée", {
      sessionToken,
    });

    return buildMobileRedirectResponse({ sessionToken });
  } catch (err) {
    console.error("❌ Erreur dans handleMobileCallback:", err);

    const message =
      err instanceof Error ? err.message : "Erreur inconnue lors du callback";

    return buildMobileRedirectResponse({
      errorMessage: message,
    });
  }
}

interface MobileRedirectParams {
  sessionToken?: string;
  errorMessage?: string;
}

function buildMobileRedirectResponse({
  sessionToken,
  errorMessage,
}: MobileRedirectParams): NextResponse {
  const queryParam = sessionToken
    ? `session=${encodeURIComponent(sessionToken)}`
    : `error=${encodeURIComponent(errorMessage ?? "unknown_error")}`;

  const universalLinkUrl = `${MOBILE_UNIVERSAL_LINK}?${queryParam}`;
  const customSchemeUrl = `${MOBILE_CUSTOM_SCHEME}?${queryParam}`;
  const isSuccess = !!sessionToken;

  const title = isSuccess ? "Connexion réussie !" : "Échec de la connexion";
  const message = isSuccess
    ? "Retour vers l'application..."
    : "Impossible de finaliser la connexion TikTok.";

  const errorHtml = !isSuccess && errorMessage
    ? `<div class="error">${errorMessage}</div>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirection vers Luma...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1E1E1E 0%, #2A2A2A 100%);
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 1rem;
      border: 4px solid #444;
      border-top-color: #FC2652;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #999; }
    .button {
      margin-top: 2rem;
      padding: 12px 24px;
      background: #FC2652;
      color: white;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    .error {
      margin-top: 1.5rem;
      padding: 1rem;
      border-radius: 12px;
      background: rgba(255, 82, 82, 0.12);
      border: 1px solid rgba(255, 82, 82, 0.4);
      color: #FF8A80;
      font-size: 0.95rem;
      line-height: 1.4;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>${title}</h1>
    <p>${message}</p>
    ${errorHtml}
    <a href="${customSchemeUrl}" class="button" id="manualLink" style="display:none">
      Ouvrir Luma
    </a>
  </div>
  <script>
    // Tenter d'abord l'universal link
    window.location.href = "${universalLinkUrl}";

    // Fallback vers le custom scheme après 1.5 secondes
    setTimeout(function() {
      window.location.href = "${customSchemeUrl}";
    }, 1500);

    // Afficher un bouton manuel après 3 secondes
    setTimeout(function() {
      const manualLink = document.getElementById('manualLink');
      if (manualLink) {
        manualLink.style.display = 'inline-block';
      }
    }, 3000);
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
