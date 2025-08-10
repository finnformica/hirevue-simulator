import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { getUserSubscriptionInfo } from "@/lib/stripe-tables";
import { createClientForServer } from "@/utils/supabase/server";

// Prices are fresh for one hour max
export const revalidate = 3600;

export interface ProPrice {
  id: string;
  productId: string;
  unitAmount: number | null;
  currency: string;
  interval: string | undefined;
}

export interface PricingData {
  proPrices: ProPrice[];
  currentPlan: string;
}

/**
 * Fetch pricing data and user subscription status
 * This function can be reused across different pages to avoid duplication
 */
export async function getPricingData(): Promise<PricingData> {
  // Get pricing data from Stripe
  const [prices, products] = await Promise.all([
    getStripePrices(),
    getStripeProducts(),
  ]);

  const proPlan = products.find((product) => product.name === "Pro");
  const proPrices = prices.filter((price) => price.productId === proPlan?.id);

  // Get user's current subscription status
  const supabase = await createClientForServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let currentPlan = "Free";

  if (user) {
    const subscriptionInfo = await getUserSubscriptionInfo(user.id);
    if (subscriptionInfo?.isProUser) {
      currentPlan = "Pro";
    }
  }

  return {
    proPrices,
    currentPlan,
  };
}
