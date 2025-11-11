import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

// Configuration Lemon Squeezy
lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY!,
  onError: (error) => console.error("Lemon Squeezy Error:", error),
});

// IDs des produits Lemon Squeezy (à remplacer par tes vrais IDs)
export const LEMON_SQUEEZY_PRODUCTS = {
  starter: {
    variantId: process.env.NEXT_PUBLIC_LS_STARTER_VARIANT_ID || "",
    name: "Starter",
    price: "€12,99",
  },
  professional: {
    variantId: process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID || "",
    name: "Pro",
    price: "€29,99",
  },
  premium: {
    variantId: process.env.NEXT_PUBLIC_LS_PREMIUM_VARIANT_ID || "",
    name: "Premium",
    price: "€89,99",
  },
};

export { lemonSqueezySetup };
