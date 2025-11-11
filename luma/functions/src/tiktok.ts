import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Configuration TikTok depuis Firebase Functions config
// Pour configurer: firebase functions:config:set tiktok.client_id="..." tiktok.client_secret="..." tiktok.redirect_uri="..."
const TIKTOK_CLIENT_KEY = functions.config().tiktok?.client_id || "";
const TIKTOK_CLIENT_SECRET = functions.config().tiktok?.client_secret || "";
const TIKTOK_REDIRECT_URI = functions.config().tiktok?.redirect_uri || "";

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
 * Échange le code d'autorisation TikTok contre un access token
 */
export const exchangeTikTokCode = functions.https.onCall(
  async (data, context) => {
    // Vérifier que l'utilisateur est authentifié
    if (!context.auth) {
      console.error("exchangeTikTokCode: utilisateur non authentifié");
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { code } = data;

    if (!code) {
      console.error("exchangeTikTokCode: code manquant", {
        dataKeys: Object.keys(data || {}),
      });
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Authorization code is required"
      );
    }

    console.log("exchangeTikTokCode: appel reçu", {
      uid: context.auth.uid,
      hasCode: true,
      redirectUri: TIKTOK_REDIRECT_URI,
    });

    try {
      // Échanger le code contre un access token
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
            code,
            grant_type: "authorization_code",
            redirect_uri: TIKTOK_REDIRECT_URI,
          }),
        }
      );

      const responseText = await tokenResponse.text();
      let tokenData: TikTokTokenResponse;
      try {
        tokenData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("exchangeTikTokCode: réponse non JSON", {
          status: tokenResponse.status,
          ok: tokenResponse.ok,
          body: responseText,
        });
        throw new Error(
          `Réponse TikTok invalide (status ${tokenResponse.status})`
        );
      }

      console.log("exchangeTikTokCode: réponse TikTok", {
        status: tokenResponse.status,
        ok: tokenResponse.ok,
        hasAccessToken: !!tokenData.access_token,
        hasRefreshToken: !!tokenData.refresh_token,
        scope: tokenData.scope,
        openId: tokenData.open_id,
        error: tokenData.error,
      });

      if (!tokenResponse.ok) {
        console.error("exchangeTikTokCode: HTTP error", {
          status: tokenResponse.status,
          body: tokenData,
        });
        throw new Error(
          tokenData.error_description ||
            tokenData.error ||
            `HTTP ${tokenResponse.status}`
        );
      }

      // Vérifier s'il y a une erreur
      if (tokenData.error) {
        console.error("TikTok token error:", tokenData);
        throw new Error(
          tokenData.error_description || tokenData.error || "Token exchange failed"
        );
      }

      // Récupérer les informations du profil TikTok
      const userInfo = await fetchTikTokUserInfo(tokenData.access_token);

      // Sauvegarder le token et les infos utilisateur dans Firestore
      console.log("exchangeTikTokCode: sauvegarde Firestore", {
        uid: context.auth.uid,
        hasUserInfo: !!userInfo,
        openId: tokenData.open_id,
      });
      await admin
        .firestore()
        .collection("users")
        .doc(context.auth.uid)
        .set(
          {
            tiktok: {
              accessToken: tokenData.access_token,
              refreshToken: tokenData.refresh_token,
              tokenExpiry: Date.now() + tokenData.expires_in * 1000,
              openId: tokenData.open_id,
              scope: tokenData.scope,
              connectedAt: admin.firestore.FieldValue.serverTimestamp(),
              userInfo,
            },
          },
          { merge: true }
        );

      console.log("exchangeTikTokCode: succès", {
        uid: context.auth.uid,
        expiresIn: tokenData.expires_in,
      });

      return {
        success: true,
        expiresIn: tokenData.expires_in,
        userInfo,
      };
    } catch (error: any) {
      console.error("TikTok token exchange error:", {
        message: error?.message,
        stack: error?.stack,
      });
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Failed to exchange TikTok authorization code"
      );
    }
  }
);

/**
 * Récupère les informations du profil TikTok
 */
async function fetchTikTokUserInfo(accessToken: string) {
  try {
    // L'API TikTok exige maintenant le paramètre 'fields' pour spécifier les champs à récupérer
    const fields = [
      "open_id",
      "avatar_url",
      "display_name",
      "username",
      "follower_count",
      "following_count",
      "likes_count",
      "video_count",
      "bio_description",
      "is_verified",
    ].join(",");

    const url = new URL("https://open.tiktokapis.com/v2/user/info/");
    url.searchParams.append("fields", fields);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error("TikTok user info error:", data);
      return null;
    }

    console.log("TikTok user info success:", {
      hasDisplayName: !!data.data?.user?.display_name,
      hasUsername: !!data.data?.user?.username,
      hasAvatar: !!data.data?.user?.avatar_url,
    });

    return {
      displayName: data.data?.user?.display_name || null,
      username: data.data?.user?.username || null,
      avatarUrl: data.data?.user?.avatar_url || null,
      followerCount: data.data?.user?.follower_count || 0,
      followingCount: data.data?.user?.following_count || 0,
      likesCount: data.data?.user?.likes_count || 0,
      videoCount: data.data?.user?.video_count || 0,
      bioDescription: data.data?.user?.bio_description || null,
      isVerified: data.data?.user?.is_verified || false,
    };
  } catch (error) {
    console.error("Error fetching TikTok user info:", error);
    return null;
  }
}

/**
 * Rafraîchit le token TikTok
 */
export const refreshTikTokToken = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    try {
      // Récupérer le refresh token depuis Firestore
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(context.auth.uid)
        .get();

      const userData = userDoc.data();
      const refreshToken = userData?.tiktok?.refreshToken;

      if (!refreshToken) {
        throw new Error("No refresh token found. Please reconnect TikTok.");
      }

      // Rafraîchir le token
      const tokenResponse = await fetch(
        "https://open.tiktokapis.com/v2/oauth/token/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_key: TIKTOK_CLIENT_KEY,
            client_secret: TIKTOK_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
          }),
        }
      );

      const tokenData: TikTokTokenResponse = await tokenResponse.json();

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      // Mettre à jour le token dans Firestore
      await admin
        .firestore()
        .collection("users")
        .doc(context.auth.uid)
        .update({
          "tiktok.accessToken": tokenData.access_token,
          "tiktok.refreshToken": tokenData.refresh_token,
          "tiktok.tokenExpiry": Date.now() + tokenData.expires_in * 1000,
          "tiktok.lastRefreshed": admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        expiresIn: tokenData.expires_in,
      };
    } catch (error: any) {
      console.error("TikTok token refresh error:", error);
      throw new functions.https.HttpsError(
        "internal",
        error.message || "Failed to refresh TikTok token"
      );
    }
  }
);

/**
 * Déconnecte TikTok (révoque le token et supprime les données)
 */
export const disconnectTikTok = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }

  try {
    // Supprimer les données TikTok de Firestore
    await admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid)
      .update({
        tiktok: admin.firestore.FieldValue.delete(),
      });

    return { success: true };
  } catch (error: any) {
    console.error("TikTok disconnect error:", error);
    throw new functions.https.HttpsError(
      "internal",
      error.message || "Failed to disconnect TikTok"
    );
  }
});
