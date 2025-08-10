import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
import { getUserSubscriptionInfo } from "@/lib/stripe-tables";
import { createClientForServer } from "@/utils/supabase/server";
import { PricingDisplay } from "./pricing-display";

// Prices are fresh for one hour max
export const revalidate = 3600;

export default async function PricingPage() {
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

  return <PricingDisplay proPrices={proPrices} currentPlan={currentPlan} />;
}
