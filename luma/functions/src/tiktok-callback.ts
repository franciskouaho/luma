import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

// Configuration TikTok
const TIKTOK_CLIENT_KEY = functions.config().tiktok?.client_id || "";
const TIKTOK_CLIENT_SECRET = functions.config().tiktok?.client_secret || "";
const TIKTOK_REDIRECT_URI =
  functions.config().tiktok?.redirect_uri ||
  "https://luma-post.emplica.fr/api/auth/tiktok/callback";

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  open_id: string;
  error?: string;
  error_description?: string;
}

/**
 * Callback HTTP TikTok pour l'app mobile
 * Cette fonction est appelée par TikTok après l'authentification
 */
export const tiktokCallback = functions.https.onRequest(async (req, res): Promise<void> => {
  try {
    const { code, state, error } = req.query;

    // Logs détaillés pour debugging
    console.log("========================================");
    console.log("🔔 TikTok Callback reçu");
    console.log("========================================");
    console.log("📍 URL complète:", req.url);
    console.log("📍 Host:", req.get("host"));
    console.log("📍 User-Agent:", req.get("user-agent"));
    console.log("📦 Query params:", req.query);
    console.log("📦 Code présent:", !!code);
    console.log("📦 State:", state);
    console.log("📦 Error:", error);
    console.log("========================================");

    // Gérer les erreurs TikTok
    if (error) {
      console.error("Erreur TikTok:", error);
      redirectToApp(res, null, `Erreur d'authentification: ${error}`);
      return;
    }

    // Vérifier les paramètres requis
    if (!code || typeof code !== "string") {
      console.error("Code manquant");
      return redirectToApp(res, null, "Code d'autorisation manquant");
    }

    if (!state || typeof state !== "string") {
      console.error("State manquant");
      return redirectToApp(res, null, "Paramètre state manquant");
    }

    // Détecter si c'est l'app mobile
    const isMobileApp = state.startsWith("mobile_");
    console.log("🔍 Détection app mobile:", isMobileApp ? "✅ OUI" : "❌ NON");

    // Si ce n'est pas l'app mobile, renvoyer une erreur
    if (!isMobileApp) {
      console.log("⚠️ Callback appelé depuis app web, rejeté");
      res.status(400).json({
        error: "Cette fonction est réservée à l'app mobile",
      });
      return;
    }

    console.log("📱 App mobile détectée, traitement du callback...");

    // Échanger le code contre des tokens
    const redirectUri = TIKTOK_REDIRECT_URI;
    console.log("🔄 Échange du code OAuth...");
    console.log("   Client Key:", TIKTOK_CLIENT_KEY);
    console.log("   Redirect URI:", redirectUri);

    const tokenResponse = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
        },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: TIKTOK_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      }
    );

    console.log("📥 Réponse TikTok:", tokenResponse.status);
    const tokenData: TikTokTokenResponse = await tokenResponse.json();
    console.log("📥 Token data:", {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      openId: tokenData.open_id,
      error: tokenData.error
    });

    // Vérifier les erreurs
    if (tokenData.error) {
      console.error("Erreur échange token:", tokenData);
      redirectToApp(
        res,
        null,
        tokenData.error_description || tokenData.error || "Échec de l'échange de token"
      );
      return;
    }

    console.log("✅ Token TikTok obtenu:", tokenData.open_id);

    // Récupérer les informations du profil TikTok
    console.log("👤 Récupération des infos utilisateur...");
    const userInfo = await fetchTikTokUserInfo(tokenData.access_token);
    console.log("👤 User info:", userInfo ? `✅ ${userInfo.displayName}` : "❌ Échec");

    if (!userInfo) {
      console.error("Impossible de récupérer les infos utilisateur");
      redirectToApp(
        res,
        null,
        "Impossible de récupérer les informations du profil"
      );
      return;
    }

    console.log("✅ Infos utilisateur TikTok:", userInfo.displayName);

    // Créer un token de session temporaire (valide 5 minutes)
    console.log("🔑 Génération du token de session...");
    const sessionToken = generateSessionToken();
    console.log("🔑 Session token:", sessionToken);
    const sessionData = {
      tiktok: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: Date.now() + tokenData.expires_in * 1000,
        openId: tokenData.open_id,
        scope: tokenData.scope,
        userInfo,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    };

    // Sauvegarder la session temporaire dans Firestore
    console.log("💾 Sauvegarde dans Firestore...");
    await admin
      .firestore()
      .collection("tiktok_sessions")
      .doc(sessionToken)
      .set(sessionData);

    console.log("✅ Session temporaire créée dans Firestore:", sessionToken);
    console.log("🔄 Redirection vers l'app mobile...");
    console.log("📱 Deep link:", `luma://auth/tiktok/callback?session=${sessionToken}`);
    console.log("========================================");

    // Rediriger vers l'app mobile avec le token de session
    redirectToApp(res, sessionToken);
    return;
  } catch (error: any) {
    console.error("========================================");
    console.error("❌ ERREUR dans tiktokCallback");
    console.error("========================================");
    console.error("Type:", error.constructor.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("========================================");
    redirectToApp(
      res,
      null,
      error.message || "Erreur interne du serveur"
    );
    return;
  }
});

/**
 * Récupère les informations du profil TikTok
 */
async function fetchTikTokUserInfo(accessToken: string) {
  try {
    const response = await fetch("https://open.tiktokapis.com/v2/user/info/", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error("Erreur récupération infos TikTok:", data.error);
      return null;
    }

    return {
      displayName: data.data?.user?.display_name || null,
      username: data.data?.user?.username || null,
      avatarUrl: data.data?.user?.avatar_url || null,
      followerCount: data.data?.user?.follower_count || 0,
      followingCount: data.data?.user?.following_count || 0,
      likesCount: data.data?.user?.likes_count || 0,
      videoCount: data.data?.user?.video_count || 0,
    };
  } catch (error) {
    console.error("Erreur fetching TikTok user info:", error);
    return null;
  }
}

/**
 * Génère un token de session aléatoire
 */
function generateSessionToken(): string {
  return (
    Math.random().toString(36).substring(2) +
    Date.now().toString(36) +
    Math.random().toString(36).substring(2)
  );
}

/**
 * Redirige vers l'app mobile avec une page HTML
 */
function redirectToApp(
  res: functions.Response,
  sessionToken: string | null,
  error?: string
): void {
  // Construire l'URL de deep link
  let deepLink: string;
  if (sessionToken) {
    // Succès - passer le token de session
    deepLink = `luma://auth/tiktok/callback?session=${sessionToken}`;
  } else if (error) {
    // Erreur - passer le message d'erreur
    deepLink = `luma://auth/tiktok/callback?error=${encodeURIComponent(error)}`;
  } else {
    // Erreur générique
    deepLink = `luma://auth/tiktok/callback?error=unknown`;
  }

  // Page HTML avec redirection automatique vers l'app mobile
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${sessionToken ? "Connexion réussie" : "Erreur"} | Luma</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #1E1E1E 0%, #2A2A2A 100%);
      color: white;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background: #FC2652;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    .spinner {
      width: 50px;
      height: 50px;
      margin: 20px auto;
      border: 4px solid #444;
      border-top-color: #FC2652;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h1 {
      font-size: 24px;
      margin-bottom: 10px;
      color: ${sessionToken ? "#4CAF50" : "#FF5252"};
    }
    p {
      color: #999;
      font-size: 16px;
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      margin-top: 20px;
      padding: 14px 32px;
      background: #FC2652;
      color: white;
      border: none;
      border-radius: 24px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.2s;
    }
    .button:hover {
      transform: scale(1.05);
    }
    .button:active {
      transform: scale(0.95);
    }
    .error-message {
      background: rgba(255, 82, 82, 0.1);
      border: 1px solid #FF5252;
      border-radius: 12px;
      padding: 16px;
      margin-top: 20px;
      font-size: 14px;
      color: #FF8A80;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">📱</div>
    ${
      sessionToken
        ? `
      <h1>✅ Connexion réussie !</h1>
      <p>Retour vers l'application Luma...</p>
      <div class="spinner"></div>
    `
        : `
      <h1>❌ Erreur</h1>
      <p>Une erreur est survenue lors de la connexion</p>
      ${error ? `<div class="error-message">${error}</div>` : ""}
    `
    }
    <a href="${deepLink}" class="button" id="manualLink" style="display:none">
      Ouvrir Luma
    </a>
  </div>
  <script>
    // Rediriger immédiatement vers l'app mobile avec custom scheme
    setTimeout(function() {
      window.location.href = "${deepLink}";
    }, 500);

    // Afficher le bouton manuel après 3 secondes
    setTimeout(function() {
      document.getElementById('manualLink').style.display = 'inline-block';
    }, 3000);
  </script>
</body>
</html>
  `;

  res.status(200).set("Content-Type", "text/html").send(html);
}
