import { NextRequest, NextResponse } from "next/server";
import { lemonSqueezySetup, createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { adminAuth } from "@/lib/firebase";

// Configurer l'API key Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      console.error("Checkout error: No token provided");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    // Récupérer les données de la requête
    const { variantId, plan, workspaceName, redirectUrl } = await req.json();

    console.log("Checkout request:", { variantId, plan, userId, redirectUrl });

    if (!variantId || !plan) {
      console.error("Checkout error: Missing variantId or plan");
      return NextResponse.json(
        { error: "Missing variantId or plan" },
        { status: 400 }
      );
    }

    // Vérifier que les variables d'environnement Lemon Squeezy sont définies
    if (!process.env.LEMONSQUEEZY_API_KEY) {
      console.error("Checkout error: LEMONSQUEEZY_API_KEY not configured");
      return NextResponse.json(
        { error: "LEMONSQUEEZY_API_KEY not configured in environment variables" },
        { status: 500 }
      );
    }

    if (!process.env.LEMONSQUEEZY_STORE_ID) {
      console.error("Checkout error: LEMONSQUEEZY_STORE_ID not configured");
      return NextResponse.json(
        { error: "LEMONSQUEEZY_STORE_ID not configured in environment variables" },
        { status: 500 }
      );
    }

    // URL de redirection par défaut ou personnalisée
    const finalRedirectUrl = redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`;

    console.log("Creating checkout with redirectUrl:", finalRedirectUrl);

    // Créer le checkout Lemon Squeezy
    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutOptions: {
          embed: false,
          media: false,
          logo: true,
        },
        checkoutData: {
          email: userEmail || undefined,
          custom: {
            user_id: userId,
            plan: plan,
            workspace_name: workspaceName || "",
          },
        },
        productOptions: {
          enabledVariants: [variantId],
          redirectUrl: finalRedirectUrl,
        },
      }
    );

    if (checkout.error) {
      console.error("Lemon Squeezy checkout error:", checkout.error);
      console.error("Error details:", JSON.stringify(checkout.error, null, 2));

      // Extraire les détails de l'erreur si disponibles
      const errorDetails = checkout.error.cause || checkout.error.message || checkout.error;
      console.error("Error cause:", errorDetails);

      return NextResponse.json(
        {
          error: `Lemon Squeezy error: ${checkout.error.message || 'Unprocessable Entity'}`,
          details: errorDetails
        },
        { status: 500 }
      );
    }

    const checkoutUrl = checkout.data?.data.attributes.url;
    console.log("Checkout created successfully:", checkoutUrl);

    return NextResponse.json({
      checkoutUrl: checkoutUrl,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
