import { getUserSubscriptionInfo } from "@/lib/stripe-tables";
import { createClientForServer } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClientForServer();

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get subscription information from Stripe tables
  const subscriptionInfo = await getUserSubscriptionInfo(user.id);

  // Combine profile data with subscription info
  const userData = {
    subscription_status: subscriptionInfo?.subscriptionStatus ?? null,
    plan_name: subscriptionInfo?.planName ?? null,
    billing_period: subscriptionInfo?.billingPeriod ?? null,
    isProUser: subscriptionInfo?.isProUser ?? false,
    stripe_customer_id: subscriptionInfo?.customerId ?? null,
    stripe_subscription_id: subscriptionInfo?.subscriptionId ?? null,
  };

  return Response.json(userData);
}
