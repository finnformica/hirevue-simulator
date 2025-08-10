import { stripe } from "@/lib/payments/stripe";
import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.redirect(new URL(paths.pricing, request.url));
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    });

    if (!session.customer || typeof session.customer === "string") {
      throw new Error("Invalid customer data from Stripe.");
    }

    const customerId = session.customer.id;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : session.subscription?.id;

    if (!subscriptionId) {
      throw new Error("No subscription found for this session.");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price.product"],
    });

    const plan = subscription.items.data[0]?.price;

    if (!plan) {
      throw new Error("No plan found for this subscription.");
    }

    const productId = (plan.product as Stripe.Product).id;

    if (!productId) {
      throw new Error("No product ID found for this subscription.");
    }

    const userId = session.client_reference_id; // Defined in the createCheckoutSession function
    if (!userId) {
      throw new Error("No user ID found in session's metadata.");
    }

    // Update user profile with subscription data
    const supabase = await createClientForServer();

    const interval = subscription.items.data[0]?.price.recurring?.interval;
    const intervalCount =
      subscription.items.data[0]?.price.recurring?.interval_count;
    const billingPeriod =
      interval === "month" && intervalCount === 3 ? "quarterly" : "monthly";

    const payload = {
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_product_id: productId,
      plan_name: (plan.product as Stripe.Product).name,
      subscription_status: subscription.status,
      billing_period: billingPeriod,
    };

    const { error: updateError } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating user profile:", updateError);
      throw new Error("Failed to update user subscription data.");
    }

    // Redirect to success page
    return NextResponse.redirect(new URL(paths.profile, request.url));
  } catch (error) {
    console.error("Error handling successful checkout:", error);
    return NextResponse.redirect(new URL(paths.error[404], request.url));
  }
}
