import { NextRequest, NextResponse } from "next/server";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { adminAuth } from "@/lib/firebase";

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email;

    // Récupérer les données de la requête
    const { variantId, plan, workspaceName } = await req.json();

    if (!variantId || !plan) {
      return NextResponse.json(
        { error: "Missing variantId or plan" },
        { status: 400 }
      );
    }

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
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
        },
      }
    );

    if (checkout.error) {
      console.error("Lemon Squeezy checkout error:", checkout.error);
      return NextResponse.json(
        { error: "Failed to create checkout" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkoutUrl: checkout.data?.data.attributes.url,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
