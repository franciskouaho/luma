import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { generateIdeasWithLlama } from "./llama";

admin.initializeApp();

// Export TikTok authentication functions
export {
  exchangeTikTokCode,
  refreshTikTokToken,
  disconnectTikTok,
} from "./tiktok";

// Export TikTok callback handler for mobile app
export { tiktokCallback } from "./tiktok-callback";

/**
 * Récupère la session TikTok temporaire après le callback
 */
export const getTikTokSession = functions.https.onCall(
  async (data, context) => {
    // Vérifier que l'utilisateur est authentifié
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { sessionToken } = data;

    if (!sessionToken) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Session token is required"
      );
    }

    try {
      // Récupérer la session depuis Firestore
      const sessionDoc = await admin
        .firestore()
        .collection("tiktok_sessions")
        .doc(sessionToken)
        .get();

      if (!sessionDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "Session not found or expired"
        );
      }

      const sessionData = sessionDoc.data();

      // Vérifier l'expiration
      if (sessionData && sessionData.expiresAt < Date.now()) {
        // Supprimer la session expirée
        await sessionDoc.ref.delete();
        throw new functions.https.HttpsError(
          "deadline-exceeded",
          "Session has expired"
        );
      }

      // Sauvegarder les données TikTok dans le profil utilisateur
      await admin
        .firestore()
        .collection("users")
        .doc(context.auth.uid)
        .set(
          {
            tiktok: {
              ...sessionData?.tiktok,
              connectedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
          },
          { merge: true }
        );

      // Supprimer la session temporaire
      await sessionDoc.ref.delete();

      return {
        success: true,
        userInfo: sessionData?.tiktok?.userInfo,
      };
    } catch (error: any) {
      console.error("Error getting TikTok session:", error);

      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      throw new functions.https.HttpsError(
        "internal",
        error?.message || "Failed to retrieve TikTok session"
      );
    }
  }
);

/**
 * Generate TikTok content ideas using Llama AI
 */
export const generateIdeas = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to generate ideas"
    );
  }

  const { niche, targetAudience, contentType, tone } = data;

  // Validate required fields
  if (!niche || !targetAudience) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Niche and target audience are required"
    );
  }

  try {
    // Call Llama AI to generate ideas
    const ideas = await generateIdeasWithLlama({
      niche,
      targetAudience,
      contentType,
      tone,
    });

    return { ideas };
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to generate ideas"
    );
  }
});

/**
 * Analyze TikTok profile and provide insights
 */
export const analyzeProfile = functions.https.onCall(async (data, context) => {
  // Check if user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated to analyze profiles"
    );
  }

  const { username } = data;

  if (!username) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Username is required"
    );
  }

  try {
    // Mock profile data (in production, you would fetch from TikTok API)
    const profile = {
      username,
      followers: Math.floor(Math.random() * 100000),
      following: Math.floor(Math.random() * 1000),
      likes: Math.floor(Math.random() * 500000),
      videos: Math.floor(Math.random() * 200),
      bio: "TikTok Creator | Content Specialist",
    };

    // Generate insights based on profile
    const insights = [
      {
        type: "strength",
        title: "Engagement fort",
        description:
          "Votre ratio likes/followers est excellent ! Continuez à créer du contenu engageant.",
        icon: "✅",
      },
      {
        type: "opportunity",
        title: "Augmentez votre fréquence de publication",
        description:
          "Publier 3-5 fois par semaine peut augmenter votre visibilité de 40%.",
        icon: "💡",
      },
      {
        type: "opportunity",
        title: "Diversifiez vos formats",
        description:
          "Essayez différents types de contenu : tutoriels, behind-the-scenes, Q&A.",
        icon: "🎯",
      },
    ];

    return { profile, insights };
  } catch (error) {
    console.error("Error analyzing profile:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to analyze profile"
    );
  }
});
