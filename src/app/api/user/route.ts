import { getUserSubscriptionInfo } from "@/lib/stripe-tables";
import { createClientForServer } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClientForServer();

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // Get user profile data
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (userError || !user || profileError || !profileData) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get subscription information from Stripe tables
  const subscriptionInfo = await getUserSubscriptionInfo(user.id);
  const isProUser = subscriptionInfo?.isProUser || profileData?.role === "admin" || profileData?.role === "owner";

  // Combine profile data with subscription info
  const userData = {
    subscription_status: subscriptionInfo?.subscriptionStatus ?? null,
    plan_name: subscriptionInfo?.planName ?? null,
    billing_period: subscriptionInfo?.billingPeriod ?? null,
    isProUser,
    stripe_customer_id: subscriptionInfo?.customerId ?? null,
    stripe_subscription_id: subscriptionInfo?.subscriptionId ?? null,
    role: profileData?.role ?? "user",
  };

  return Response.json(userData);
}
