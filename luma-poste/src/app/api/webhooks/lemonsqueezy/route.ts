import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

// Vérifier la signature du webhook Lemon Squeezy
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 401 });
    }

    // Vérifier la signature
    const webhookSecret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET!;
    const isValid = verifySignature(rawBody, signature, webhookSecret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event.meta.event_name;
    const eventData = event.data;
    const customData = eventData.attributes.first_order_item?.product_name ?
      JSON.parse(eventData.attributes.first_order_item.product_name) :
      eventData.attributes.custom_data;

    console.log("Lemon Squeezy webhook event:", eventName);

    switch (eventName) {
      case "order_created":
        await handleOrderCreated(eventData, customData);
        break;

      case "subscription_created":
        await handleSubscriptionCreated(eventData, customData);
        break;

      case "subscription_updated":
        await handleSubscriptionUpdated(eventData, customData);
        break;

      case "subscription_cancelled":
      case "subscription_expired":
        await handleSubscriptionCancelled(eventData, customData);
        break;

      default:
        console.log("Unhandled event:", eventName);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleOrderCreated(data: any, customData: any) {
  const userId = customData?.user_id;
  const plan = customData?.plan;

  if (!userId) {
    console.error("No user_id in custom data");
    return;
  }

  // Mettre à jour le workspace avec le plan acheté
  const workspaceId = `${userId}_default`;
  await adminDb.collection("workspaces").doc(workspaceId).update({
    plan: plan,
    paymentStatus: "paid",
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Mettre à jour l'utilisateur
  await adminDb.collection("users").doc(userId).update({
    subscriptionStatus: "active",
    plan: plan,
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`Order created for user ${userId} with plan ${plan}`);
}

async function handleSubscriptionCreated(data: any, customData: any) {
  const userId = customData?.user_id;
  const plan = customData?.plan;
  const subscriptionId = data.id;

  if (!userId) {
    console.error("No user_id in custom data");
    return;
  }

  // Créer ou mettre à jour le document d'abonnement
  await adminDb.collection("subscriptions").doc(subscriptionId).set({
    userId: userId,
    plan: plan,
    status: data.attributes.status,
    variantId: data.attributes.variant_id,
    orderId: data.attributes.order_id,
    customerId: data.attributes.customer_id,
    renewsAt: data.attributes.renews_at,
    endsAt: data.attributes.ends_at,
    trialEndsAt: data.attributes.trial_ends_at,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Mettre à jour l'utilisateur
  await adminDb.collection("users").doc(userId).update({
    subscriptionId: subscriptionId,
    subscriptionStatus: data.attributes.status,
    plan: plan,
    updatedAt: FieldValue.serverTimestamp(),
  });

  console.log(`Subscription created for user ${userId}`);
}

async function handleSubscriptionUpdated(data: any, customData: any) {
  const subscriptionId = data.id;

  // Mettre à jour le document d'abonnement
  await adminDb.collection("subscriptions").doc(subscriptionId).update({
    status: data.attributes.status,
    renewsAt: data.attributes.renews_at,
    endsAt: data.attributes.ends_at,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Récupérer le userId depuis l'abonnement
  const subDoc = await adminDb.collection("subscriptions").doc(subscriptionId).get();
  const userId = subDoc.data()?.userId;

  if (userId) {
    await adminDb.collection("users").doc(userId).update({
      subscriptionStatus: data.attributes.status,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(`Subscription updated: ${subscriptionId}`);
}

async function handleSubscriptionCancelled(data: any, customData: any) {
  const subscriptionId = data.id;

  // Mettre à jour le statut
  await adminDb.collection("subscriptions").doc(subscriptionId).update({
    status: "cancelled",
    endsAt: data.attributes.ends_at,
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Récupérer le userId
  const subDoc = await adminDb.collection("subscriptions").doc(subscriptionId).get();
  const userId = subDoc.data()?.userId;

  if (userId) {
    await adminDb.collection("users").doc(userId).update({
      subscriptionStatus: "cancelled",
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(`Subscription cancelled: ${subscriptionId}`);
}
