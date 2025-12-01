import { EncryptionService } from "./encryption";

interface TikTokTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface TikTokUserInfo {
  data: {
    user: {
      open_id: string;
      display_name: string;
      avatar_url: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

interface TikTokAccount {
  id: string;
  username: string;
  accessTokenEnc: string;
  refreshTokenEnc?: string;
  userId: string;
}

interface TikTokPostSettings {
  privacyLevel: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  commercialContent: {
    enabled: boolean;
    yourBrand: boolean;
    brandedContent: boolean;
  };
}

interface CreatorInfo {
  nickname: string;
  privacy_level_options: string[];
  max_video_post_duration_sec: number;
  can_post: boolean;
  max_posts_reached: boolean;
  duet_disabled: boolean;
  stitch_disabled: boolean;
  comment_disabled: boolean;
}

type TikTokErrorResponse = { error?: { code?: string; message?: string } };

class TikTokAPIService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  // Helper pour parsing sécurisé des erreurs TikTok
  private safeJsonParse(text: string): TikTokErrorResponse {
    try {
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === "object"
        ? (parsed as TikTokErrorResponse)
        : {};
    } catch {
      console.warn("⚠️ Réponse TikTok non-JSON:", text);
      return { error: { message: text, code: "invalid_response" } };
    }
  }

  constructor() {
    this.clientId = process.env.TIKTOK_CLIENT_ID || "";
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || "";
    this.redirectUri =
      process.env.TIKTOK_REDIRECT_URI ||
      "https://luma-post.emplica.fr/api/auth/tiktok/callback";
  }

  // Fonction de déchiffrement avec AES-256-GCM
  private decryptToken(encryptedToken: string): string {
    try {
      return EncryptionService.decrypt(encryptedToken);
    } catch (error) {
      console.error("Erreur déchiffrement token:", error);
      throw new Error("Impossible de déchiffrer le token d'accès");
    }
  }

  // Fonction pour vérifier si une URL peut être utilisée avec PULL_FROM_URL
  private canUsePullFromUrl(): boolean {
    // Google Cloud Storage n'est pas vérifié par TikTok, donc on utilise toujours FILE_UPLOAD
    // pour éviter l'erreur url_ownership_unverified
    return false; // Toujours utiliser FILE_UPLOAD
  }

  // Fonction pour refresh un token expiré
  async refreshAccessToken(refreshToken: string): Promise<TikTokTokenResponse> {
    const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";

    const params = `client_key=${this.clientId}&client_secret=${this.clientSecret}&grant_type=refresh_token&refresh_token=${refreshToken}`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur lors du rafraîchissement du token:", errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Erreur TikTok: ${data.error.message || data.error}`);
    }

    return data;
  }

  getAuthorizationUrl(userId: string): string {
    const baseUrl = "https://www.tiktok.com/v2/auth/authorize/";

    // Nettoyer l'URI de redirection pour éviter la duplication du paramètre state
    const cleanRedirectUri = this.redirectUri.split("?")[0];

    // Ajouter un timestamp pour forcer une nouvelle autorisation
    const timestamp = Date.now();

    const params = new URLSearchParams({
      client_key: this.clientId,
      scope: "user.info.basic,video.publish,video.upload",
      response_type: "code",
      redirect_uri: cleanRedirectUri,
      state: `${userId}_${timestamp}_${Math.random().toString(36)}`,
      // Force consent screen with multiple parameters
      prompt: "consent",
      approval_prompt: "force",
      access_type: "offline",
      // Additional parameters to force new authorization
      force_login: "true",
      force_verify: "true",
      reauth: "true",
      // Cache busting parameters
      _t: timestamp.toString(),
      _r: Math.random().toString(36),
      // Force consent explicitly
      force_consent: "1",
      no_cache: "1",
      // Additional TikTok specific parameters
      include_granted_scopes: "false",
      force_reauth: "true",
    });

    return `${baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<TikTokTokenResponse> {
    const tokenUrl = "https://open.tiktokapis.com/v2/oauth/token/";

    // Construire les paramètres manuellement pour éviter l'encodage automatique
    const params = `client_key=${this.clientId}&client_secret=${this.clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${this.redirectUri}`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erreur lors de l'échange de tokens:", errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Erreur TikTok: ${data.error.message || data.error}`);
    }

    return data;
  }

  async getUserInfo(accessToken: string): Promise<TikTokUserInfo> {
    const userInfoUrl = "https://open.tiktokapis.com/v2/user/info/";

    const params = new URLSearchParams({
      fields: "open_id,display_name,avatar_url",
    });

    const response = await fetch(`${userInfoUrl}?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Erreur lors de la récupération des infos utilisateur:",
        errorText,
      );
      throw new Error(`Erreur HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    return data;
  }

  // Nouvelle méthode pour récupérer les informations du créateur
  async getCreatorInfo(account: TikTokAccount): Promise<CreatorInfo | null> {
    try {
      const accessToken = this.decryptToken(account.accessTokenEnc);

      // Utiliser l'endpoint creator_info/query/ qui est plus approprié
      const creatorResponse = await fetch(
        "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
        },
      );

      if (!creatorResponse.ok) {
        const errorText = await creatorResponse.text();
        console.error(
          "Erreur lors de la récupération des infos créateur:",
          errorText,
        );

        // Si le token est invalide, essayer de le rafraîchir
        try {
          const errorData = this.safeJsonParse(errorText);
          if (
            errorData.error?.code === "access_token_invalid" &&
            account.refreshTokenEnc
          ) {
            const refreshToken = this.decryptToken(account.refreshTokenEnc);
            const newTokens = await this.refreshAccessToken(refreshToken);

            // Retry avec le nouveau token
            const retryResponse = await fetch(
              "https://open.tiktokapis.com/v2/post/publish/creator_info/query/",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${newTokens.access_token}`,
                  "Content-Type": "application/json; charset=UTF-8",
                },
              },
            );

            if (retryResponse.ok) {
              const retryResult = await retryResponse.json();

              if (retryResult.error && retryResult.error.code !== "ok") {
                console.error(
                  `Erreur TikTok Creator Info: ${retryResult.error.message || retryResult.error}`,
                );
                return null;
              }

              const {
                nickname,
                privacy_level_options,
                max_video_post_duration_sec,
                can_post,
                max_posts_reached,
                duet_disabled,
                stitch_disabled,
                comment_disabled,
              } = retryResult.data;

              return {
                nickname,
                privacy_level_options,
                max_video_post_duration_sec,
                can_post,
                max_posts_reached,
                duet_disabled,
                stitch_disabled,
                comment_disabled,
              };
            }
          }
        } catch (refreshError) {
          console.error("Erreur lors du rafraîchissement:", refreshError);
        }

        return null;
      }

      const creatorResult = await creatorResponse.json();

      if (creatorResult.error && creatorResult.error.code !== "ok") {
        console.error(
          `Erreur TikTok Creator Info: ${creatorResult.error.message || creatorResult.error}`,
        );
        return null;
      }

      const {
        nickname,
        privacy_level_options,
        max_video_post_duration_sec,
        can_post,
        max_posts_reached,
        duet_disabled,
        stitch_disabled,
        comment_disabled,
      } = creatorResult.data;

      return {
        nickname,
        privacy_level_options,
        max_video_post_duration_sec,
        can_post,
        max_posts_reached,
        duet_disabled,
        stitch_disabled,
        comment_disabled,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des infos créateur:",
        error,
      );
      return null;
    }
  }

  async publishVideoComplete(
    account: TikTokAccount,
    videoData: {
      videoUrl: string;
      title?: string;
      description?: string;
      hashtags?: string[];
    },
    settings: TikTokPostSettings,
    accountService?: {
      update: (id: string, updates: Record<string, unknown>) => Promise<void>;
    },
  ) {
    try {
      // Déchiffrer le token d'accès
      let accessToken = this.decryptToken(account.accessTokenEnc);

      // ÉTAPE 0: Query Creator Info (requis par la nouvelle API)
      const creatorInfoUrl =
        "https://open.tiktokapis.com/v2/post/publish/creator_info/query/";

      const creatorResponse = await fetch(creatorInfoUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
      });

      if (!creatorResponse.ok) {
        const errorText = await creatorResponse.text();
        const errorData = this.safeJsonParse(errorText);

        // Si le token est invalide, essayer de le rafraîchir
        if (
          errorData.error?.code === "access_token_invalid" &&
          account.refreshTokenEnc &&
          accountService
        ) {
          try {
            const refreshToken = this.decryptToken(account.refreshTokenEnc);
            const newTokens = await this.refreshAccessToken(refreshToken);

            // Mettre à jour le token dans la base de données
            await accountService.update(account.id, {
              accessTokenEnc: EncryptionService.encrypt(newTokens.access_token),
              refreshTokenEnc: EncryptionService.encrypt(
                newTokens.refresh_token,
              ),
              expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
            });

            accessToken = newTokens.access_token;

            // Réessayer la requête avec le nouveau token
            const retryResponse = await fetch(creatorInfoUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json; charset=UTF-8",
              },
            });

            if (!retryResponse.ok) {
              const retryErrorText = await retryResponse.text();
              console.error(
                "Erreur après rafraîchissement du token:",
                retryErrorText,
              );
              throw new Error(
                `Erreur HTTP ${retryResponse.status}: ${retryErrorText}`,
              );
            }

            const creatorResult = await retryResponse.json();

            if (creatorResult.error && creatorResult.error.code !== "ok") {
              throw new Error(
                `Erreur TikTok Creator Info: ${creatorResult.error.message || creatorResult.error}`,
              );
            }

            const { privacy_level_options } = creatorResult.data;

            // Continuer avec la publication...
            return this.continuePublishing(
              account,
              accessToken,
              privacy_level_options,
              videoData,
              settings,
            );
          } catch (refreshError) {
            console.error("Échec du rafraîchissement du token:", refreshError);
            throw new Error(
              `Token expiré et impossible de le rafraîchir: ${refreshError instanceof Error ? refreshError.message : "Erreur inconnue"}`,
            );
          }
        }

        console.error(
          "Erreur lors de la récupération des infos créateur:",
          errorText,
        );
        throw new Error(`Erreur HTTP ${creatorResponse.status}: ${errorText}`);
      }

      const creatorResult = await creatorResponse.json();

      if (creatorResult.error && creatorResult.error.code !== "ok") {
        throw new Error(
          `Erreur TikTok Creator Info: ${creatorResult.error.message || creatorResult.error}`,
        );
      }

      const {
        privacy_level_options,
        can_post,
        max_video_post_duration_sec,
        max_posts_reached,
        nickname,
      } = creatorResult.data;

      // Bloquer tôt si l'utilisateur ne peut pas poster ou a atteint la limite
      if (max_posts_reached === true) {
        throw new Error(
          "Quota quotidien de posts atteint (max_posts_reached).",
        );
      }
      if (can_post === false) {
        throw new Error(
          "Ce compte ne peut pas publier via API (can_post=false).",
        );
      }

      // Continuer avec la publication
      return this.continuePublishing(
        account,
        accessToken,
        privacy_level_options,
        videoData,
        settings,
      );
    } catch (error) {
      console.error("Erreur lors de la publication TikTok:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erreur inconnue",
      };
    }
  }

  private async continuePublishing(
    account: TikTokAccount,
    accessToken: string,
    privacyLevelOptions: string[],
    videoData: {
      videoUrl: string;
      title?: string;
      description?: string;
      hashtags?: string[];
    },
    settings: TikTokPostSettings,
  ) {
    // Vérification simple du token via getUserInfo
    console.log("🔍 Vérification du token TikTok...");
    try {
      const userInfo = await this.getUserInfo(accessToken);

      if (userInfo.error && userInfo.error.code !== "ok") {
        throw new Error(`Token TikTok invalide: ${userInfo.error.message}`);
      }

      if (!userInfo.data?.user?.open_id) {
        throw new Error("Token TikTok invalide ou indisponible");
      }

      console.log("✅ Token TikTok valide");
    } catch (error) {
      console.error("❌ Erreur vérification token:", error);
      throw new Error(
        "Token TikTok invalide ou indisponible. Réessayez ou reconnectez le compte.",
      );
    }
    // Construire la description avec hashtags
    let description = videoData.description || videoData.title || "";
    if (videoData.hashtags && videoData.hashtags.length > 0) {
      const hashtagsString = videoData.hashtags
        .map((tag) => `#${tag}`)
        .join(" ");
      description = `${description}\n\n${hashtagsString}`;
    }

    // Si la description est vide, utiliser un texte par défaut
    if (!description.trim()) {
      description = "Vidéo publiée via Luma Post";
    }

    // Récupérer la vidéo depuis l'URL et la convertir en Buffer (côté serveur)
    const videoResponse = await fetch(videoData.videoUrl);
    if (!videoResponse.ok) {
      throw new Error("Impossible de récupérer la vidéo depuis l'URL fournie");
    }

    // Convertir en Buffer pour éviter les problèmes avec l'objet File côté serveur
    const videoArrayBuffer = await videoResponse.arrayBuffer();
    const videoBuffer = Buffer.from(videoArrayBuffer);
    const videoSize = videoBuffer.length;

    const videoUrl = videoData.videoUrl;
    const isHttps = !!videoUrl && videoUrl.startsWith("https://");
    const allowedDomains = [
      "luma-post.emplica.fr",
      "firebasestorage.googleapis.com",
    ];
    let useFileUpload = false;
    let sourceInfo: {
      source: "PULL_FROM_URL" | "FILE_UPLOAD";
      video_url?: string;
    };

    if (!isHttps) {
      useFileUpload = true;
    } else {
      const urlObj = new URL(videoUrl);
      const isAllowedDomain = allowedDomains.some(
        (domain) =>
          urlObj.hostname === domain || urlObj.hostname.endsWith("." + domain),
      );
      useFileUpload = !isAllowedDomain;
    }

    if (useFileUpload) {
      console.log(
        `📦 FILE_UPLOAD: ${videoSize} bytes (domaine non autorisé pour PULL_FROM_URL ou URL non-HTTPS)`,
      );
      sourceInfo = { source: "FILE_UPLOAD" };
    } else {
      console.log(`📊 PULL_FROM_URL: ${videoSize} bytes depuis ${videoUrl}`);
      sourceInfo = { source: "PULL_FROM_URL", video_url: videoUrl };
    }

    // ÉTAPE 2: Initialisation - FORCER Direct Post uniquement

    let initResult;
    const useInboxEndpoint = false; // Toujours false - on force Direct Post

    // Essayer UNIQUEMENT l'endpoint Direct Post (pas de fallback vers inbox)
    try {
      const directPostUrl =
        "https://open.tiktokapis.com/v2/post/publish/video/init/";

      // Choisir un privacy_level strictement autorisé par privacy_level_options
      let privacyLevel:
        | "PUBLIC_TO_EVERYONE"
        | "MUTUAL_FOLLOW_FRIENDS"
        | "SELF_ONLY";
      if (privacyLevelOptions.includes(settings.privacyLevel)) {
        privacyLevel = settings.privacyLevel;
      } else if (privacyLevelOptions.includes("SELF_ONLY")) {
        privacyLevel = "SELF_ONLY";
      } else {
        throw new Error(
          `Aucun privacy_level valide disponible. Options autorisées: ${privacyLevelOptions.join(", ")}`,
        );
      }

      const directPostData: any = {
        post_info: {
          title: description,
          privacy_level: privacyLevel,
          disable_duet: !settings.allowDuet,
          disable_comment: !settings.allowComments,
          disable_stitch: !settings.allowStitch,
          brand_content_toggle: settings.commercialContent.brandedContent,
          brand_organic_toggle: settings.commercialContent.yourBrand,
          video_cover_timestamp_ms: 1000, // Utiliser la première seconde comme couverture
        },
        source_info: sourceInfo,
      };

      // TikTok exige des métadonnées côté init pour FILE_UPLOAD directement sous source_info
      if (useFileUpload) {
        const defaultChunkSize = videoSize; // upload en un seul PUT
        directPostData.source_info = {
          source: "FILE_UPLOAD",
          video_size: videoSize,
          chunk_size: defaultChunkSize,
          total_chunk_count: 1,
        };
      }

      const directPostResponse = await fetch(directPostUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(directPostData),
      });

      if (!directPostResponse.ok) {
        const statusCode = directPostResponse.status;
        const errorText = await directPostResponse.text();
        const errorData = this.safeJsonParse(errorText);
        console.error("❌ INIT Direct Post échoué:", {
          statusCode,
          error: errorData,
          body: errorText,
        });

        // Gestion des erreurs - FORCER Direct Post (pas de fallback inbox)
        switch (errorData.error?.code) {
          case "unaudited_client_can_only_post_to_private_accounts":
            console.error(
              "⚠️ ERREUR CRITIQUE: Ce compte TikTok ne peut pas utiliser l'API de publication.",
            );
            console.error("📋 Solutions possibles:");
            console.error(
              "   1. ✅ Convertir le compte en Business Account (https://www.tiktok.com/business)",
            );
            console.error(
              "   2. ✅ Vérifier que le compte est bien un Business Account",
            );
            console.error(
              "   3. ✅ Vérifier que le compte TikTok est dans une région supportée",
            );
            console.error(
              "   4. ✅ Attendre 24-48h après la conversion en Business Account",
            );

            // Retry avec SELF_ONLY si ce n'était pas déjà le cas
            if (privacyLevel !== "SELF_ONLY") {
              console.log(
                "🔄 Tentative de publication en mode PRIVÉ (SELF_ONLY)...",
              );
              const retryData = {
                ...directPostData,
                post_info: {
                  ...directPostData.post_info,
                  privacy_level: "SELF_ONLY",
                },
              };

              const retryResponse = await fetch(directPostUrl, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  "Content-Type": "application/json; charset=UTF-8",
                },
                body: JSON.stringify(retryData),
              });

              if (retryResponse.ok) {
                initResult = await retryResponse.json();
                console.log("✅ Publication en mode PRIVÉ réussie !");
                break;
              } else {
                const retryErrorText = await retryResponse.text();
                console.error("❌ Échec même en mode PRIVÉ:", retryErrorText);
                throw new Error(`Ce compte TikTok ne peut pas publier via l'API. Veuillez:
1. Convertir le compte en Business Account (https://www.tiktok.com/business)
2. Vérifier que vous utilisez bien un Business Account
3. Attendre 24-48h après la conversion
4. Vérifier que votre compte est dans une région supportée

Erreur TikTok: ${errorData.error?.message || "Compte non autorisé"}`);
              }
            } else {
              throw new Error(`Ce compte TikTok ne peut pas publier via l'API. Veuillez:
1. Convertir le compte en Business Account (https://www.tiktok.com/business)
2. Vérifier que vous utilisez bien un Business Account
3. Attendre 24-48h après la conversion

Erreur TikTok: ${errorData.error?.message || "Compte non autorisé"}`);
            }
            break;

          case "privacy_level_option_mismatch":
            const fallbackData = {
              ...directPostData,
              post_info: {
                ...directPostData.post_info,
                privacy_level: "SELF_ONLY",
              },
            };

            const fallbackResponse = await fetch(directPostUrl, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json; charset=UTF-8",
              },
              body: JSON.stringify(fallbackData),
            });

            if (fallbackResponse.ok) {
              initResult = await fallbackResponse.json();
            } else {
              // Pas de fallback vers inbox - on lance une erreur
              throw new Error(
                "Erreur de niveau de confidentialité - impossible de publier directement.",
              );
            }
            break;

          case "spam_risk_too_many_posts":
            throw new Error(
              "Limite quotidienne de posts atteinte pour cet utilisateur",
            );

          case "spam_risk_user_banned_from_posting":
            throw new Error("L'utilisateur est banni de TikTok");

          case "reached_active_user_cap":
            throw new Error("Quota quotidien d'utilisateurs actifs atteint");

          case "rate_limit_exceeded":
            await new Promise((resolve) => setTimeout(resolve, 10000));
            throw new Error(
              "Limite de taux dépassée - veuillez réessayer dans quelques minutes",
            );

          default:
            console.error("Erreur Direct Post:", errorText);
            throw new Error(
              `Erreur HTTP ${directPostResponse.status}: ${errorText}`,
            );
        }
      } else {
        initResult = await directPostResponse.json();
      }
    } catch (error) {
      // Pas de fallback vers inbox - on relance l'erreur
      throw error;
    }

    // Si on arrive ici, c'est que Direct Post a réussi
    // Plus de fallback vers inbox - on utilise uniquement Direct Post

    if (initResult.error && initResult.error.code !== "ok") {
      const errorCode = initResult.error.code;
      let errorMessage = initResult.error.message || "Erreur inconnue";

      // Gestion spécifique des erreurs selon la documentation
      switch (errorCode) {
        case "spam_risk_too_many_posts":
          errorMessage =
            "Limite quotidienne de posts atteinte pour cet utilisateur";
          break;
        case "spam_risk_user_banned_from_posting":
          errorMessage = "L'utilisateur est banni de TikTok";
          break;
        case "reached_active_user_cap":
          errorMessage = "Quota quotidien d'utilisateurs actifs atteint";
          break;
        case "unaudited_client_can_only_post_to_private_accounts":
          errorMessage =
            "Application non audité par TikTok. Le contenu sera publié en mode privé uniquement.";
          break;
        case "privacy_level_option_mismatch":
          errorMessage = "Niveau de confidentialité non valide";
          break;
        case "access_token_invalid":
          errorMessage = "Token d'accès invalide ou expiré";
          break;
        case "scope_not_authorized":
          errorMessage =
            "Scope requis non autorisé - veuillez reconnecter votre compte TikTok";
          break;
        case "rate_limit_exceeded":
          errorMessage = "Limite de taux dépassée (6 requêtes/minute)";
          break;
        case "invalid_params":
          if (errorMessage.includes("total chunk count")) {
            errorMessage =
              "Nombre de chunks invalide - problème de calcul de segmentation";
          }
          break;
      }

      throw new Error(`Erreur TikTok (${errorCode}): ${errorMessage}`);
    }

    const { publish_id, upload_url } = initResult.data;

    // ÉTAPE 3: Upload du fichier vers TikTok si FILE_UPLOAD
    if (sourceInfo.source === "FILE_UPLOAD") {
      if (!upload_url) {
        throw new Error("URL de téléversement manquante pour FILE_UPLOAD");
      }
      const contentType = "video/mp4";
      const totalSize = videoBuffer.length;
      const contentRange = `bytes 0-${totalSize - 1}/${totalSize}`;

      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(totalSize),
          "Content-Range": contentRange,
        },
        body: videoBuffer,
      });

      if (!uploadResponse.ok) {
        const uploadErrorText = await uploadResponse.text();
        console.error("Erreur upload vers TikTok:", uploadErrorText);
        throw new Error(
          `Échec de l\'upload vidéo (HTTP ${uploadResponse.status})`,
        );
      }
      console.log("✅ FILE_UPLOAD: vidéo transférée à TikTok");
    } else {
      // Avec PULL_FROM_URL, TikTok récupère automatiquement la vidéo
      console.log(
        "✅ PULL_FROM_URL: TikTok va récupérer la vidéo automatiquement",
      );
    }

    // ÉTAPE 4: Vérifier le statut seulement pour Direct Post
    let finalStatus = "UNKNOWN";
    if (!useInboxEndpoint) {
      const statusUrl =
        "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

      // Réduire le polling pour éviter les timeouts (max 3 tentatives = 30s)
      // Le webhook TikTok mettra à jour le statut final
      let attempts = 0;
      const maxAttempts = 3; // Réduit pour éviter timeout API route

      while (attempts < maxAttempts) {
        const statusResponse = await fetch(statusUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({
            publish_id: publish_id,
          }),
        });

        if (!statusResponse.ok) {
          const errorText = await statusResponse.text();
          console.error("Erreur lors de la vérification du statut:", errorText);
          break;
        }

        const statusResult = await statusResponse.json();

        if (statusResult.error && statusResult.error.code !== "ok") {
          console.error(
            "Erreur dans la réponse de statut:",
            statusResult.error,
          );
          break;
        }

        const status = statusResult.data?.status;
        finalStatus = status;

        if (status === "PROCESSING_DOWNLOAD") {
          console.log("📥 TikTok télécharge la vidéo...");
        } else if (status === "PROCESSING_UPLOAD") {
          console.log("📤 TikTok traite l'upload...");
        } else if (status === "PROCESSING_POST") {
          console.log("🔄 TikTok finalise la publication...");
        } else if (status === "PUBLISHED") {
          console.log("✅ Publication confirmée par TikTok");
          break;
        } else if (status === "FAILED") {
          console.error(
            "❌ Échec de la publication:",
            statusResult.data?.fail_reason,
          );
          throw new Error(
            `Échec de la publication: ${statusResult.data?.fail_reason || "Raison inconnue"}`,
          );
        }

        attempts++;
        if (attempts < maxAttempts) {
          const waitTime = 10000; // 10s d'attente
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }

      if (finalStatus !== "PUBLISHED") {
        console.log(
          `ℹ️ Publication en cours de traitement (${finalStatus}). Le webhook TikTok mettra à jour le statut final.`,
        );
      }
    }

    // Retour pour Direct Post uniquement
    const isPublished = finalStatus === "PUBLISHED";
    return {
      success: true, // La demande a été envoyée avec succès
      publishId: publish_id,
      status: finalStatus,
      message: isPublished
        ? "Vidéo publiée avec succès sur TikTok !"
        : `Direct Post initialisé - Statut: ${finalStatus}`,
      inboxMode: false, // Toujours false - on force Direct Post
      privacyLevel: settings.privacyLevel || "PUBLIC_TO_EVERYONE",
      requiresManualPublish: false,
      directPostSuccess: true, // Indique que Direct Post a été utilisé
      publishType: "DIRECT_POST", // Indication explicite du type
    };
  }

  async fetchPublishStatus(
    account: TikTokAccount,
    publishId: string,
    accountService?: {
      update: (id: string, updates: Record<string, unknown>) => Promise<void>;
    },
  ): Promise<{ status: string; failReason?: string | null }> {
    try {
      let accessToken = this.decryptToken(account.accessTokenEnc);
      const statusUrl =
        "https://open.tiktokapis.com/v2/post/publish/status/fetch/";

      const requestStatus = async (token: string) =>
        fetch(statusUrl, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json; charset=UTF-8",
          },
          body: JSON.stringify({ publish_id: publishId }),
        });

      let statusResponse = await requestStatus(accessToken);

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        const errorData = this.safeJsonParse(errorText);

        if (
          errorData.error?.code === "access_token_invalid" &&
          account.refreshTokenEnc &&
          accountService
        ) {
          try {
            const refreshToken = this.decryptToken(account.refreshTokenEnc);
            const newTokens = await this.refreshAccessToken(refreshToken);
            await accountService.update(account.id, {
              accessTokenEnc: EncryptionService.encrypt(newTokens.access_token),
              refreshTokenEnc: EncryptionService.encrypt(
                newTokens.refresh_token,
              ),
              expiresAt: new Date(Date.now() + newTokens.expires_in * 1000),
            });
            accessToken = newTokens.access_token;
            statusResponse = await requestStatus(accessToken);
          } catch (refreshError) {
            console.error(
              "Erreur lors du rafraîchissement du token pour fetchPublishStatus:",
              refreshError,
            );
            throw new Error("Impossible de rafraîchir le token TikTok");
          }
        } else {
          throw new Error(
            `Erreur HTTP ${statusResponse.status}: ${
              errorData.error?.message || errorText
            }`,
          );
        }
      }

      const statusResult = await statusResponse.json();

      if (statusResult.error && statusResult.error.code !== "ok") {
        throw new Error(
          `Erreur TikTok status fetch: ${statusResult.error.message || statusResult.error.code}`,
        );
      }

      const status = statusResult.data?.status || "UNKNOWN";
      const failReason = statusResult.data?.fail_reason || null;

      return { status, failReason };
    } catch (error) {
      console.error("Erreur lors de fetchPublishStatus:", error);
      throw error instanceof Error
        ? error
        : new Error("Erreur inconnue lors de la récupération du statut TikTok");
    }
  }
}

export const tiktokAPIService = new TikTokAPIService();
