import { getStripePrices, getStripeProducts } from "@/lib/payments/stripe";
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
    const { data: userData } = await supabase
      .from("profiles")
      .select("subscription_status, plan_name")
      .eq("id", user.id)
      .single();

    if (
      userData?.subscription_status === "active" ||
      userData?.subscription_status === "trialing"
    ) {
      currentPlan = "Pro";
    }
  }

  return <PricingDisplay proPrices={proPrices} currentPlan={currentPlan} />;
}
