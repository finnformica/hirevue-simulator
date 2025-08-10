import { endpoints } from "@/utils/endpoints";
import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Stripe from "stripe";

if (process.env.STRIPE_SECRET_KEY === undefined) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
  typescript: true,
});

// Helper function to get or create Stripe customer for user
async function getOrCreateStripeCustomer(user: User) {
  const supabase = await createClientForServer();

  // First check if customer exists in Stripe tables
  const { data: customerData } = await supabase
    .schema("stripe")
    .from("customers")
    .select("id")
    .eq("metadata->>supabase_user_id", user.id)
    .eq("deleted", false)
    .single();

  if (customerData?.id) {
    return customerData.id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      supabase_user_id: user.id,
    },
  });

  // Note: The customer will be automatically added to stripe.customers table by the edge function
  // No need to manually store it in profiles table anymore

  return customer.id;
}

export async function createCheckoutSession({ priceId }: { priceId: string }) {
  const supabase = await createClientForServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(paths.createAccount);
  }

  const customerId = await getOrCreateStripeCustomer(user);

  // Construct URLs with proper scheme
  const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${endpoints.stripe.checkout}?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}${paths.pricing}`;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer: customerId,
    client_reference_id: user.id.toString(), // Used to track the user in the /api/stripe/checkout route
    allow_promotion_codes: true,
  });

  redirect(session.url!);
}

export async function createCustomerPortalSession(user: User) {
  const customerId = await getOrCreateStripeCustomer(user);

  if (!customerId) {
    redirect("/pricing");
  }

  let configuration: Stripe.BillingPortal.Configuration;
  const configurations = await stripe.billingPortal.configurations.list();

  if (configurations.data.length > 0) {
    configuration = configurations.data[0];
  } else {
    // Get the user's current subscription to determine the product
    const supabase = await createClientForServer();
    
    // Get customer from Stripe tables
    const { data: customerData } = await supabase
      .schema("stripe")
      .from("customers")
      .select("id")
      .eq("metadata->>supabase_user_id", user.id)
      .eq("deleted", false)
      .single();

    if (!customerData) {
      throw new Error("User has no Stripe customer record");
    }

    // Get active subscription
    const { data: subscriptionData } = await supabase
      .schema("stripe")
      .from("subscriptions")
      .select("items")
      .eq("customer", customerData.id)
      .in("status", ["active", "trialing"])
      .single();

    if (!subscriptionData) {
      throw new Error("User has no active subscription");
    }

    // Extract product ID from subscription items
    const items = subscriptionData.items as any;
    const firstItem = items?.data?.[0];
    const price = firstItem?.price;
    const productId = price?.product;

    if (!productId) {
      throw new Error("User has no active product subscription");
    }

    const product = await stripe.products.retrieve(productId);
    if (!product.active) {
      throw new Error("User's product is not active in Stripe");
    }

    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });
    if (prices.data.length === 0) {
      throw new Error("No active prices found for the user's product");
    }

    configuration = await stripe.billingPortal.configurations.create({
      business_profile: {
        headline: "Manage your subscription",
      },
      features: {
        subscription_update: {
          enabled: true,
          default_allowed_updates: ["price", "quantity", "promotion_code"],
          proration_behavior: "create_prorations",
          products: [
            {
              product: product.id,
              prices: prices.data.map((price) => price.id),
            },
          ],
        },
        subscription_cancel: {
          enabled: true,
          mode: "at_period_end",
          cancellation_reason: {
            enabled: true,
            options: [
              "too_expensive",
              "missing_features",
              "switched_service",
              "unused",
              "other",
            ],
          },
        },
        payment_method_update: {
          enabled: true,
        },
      },
    });
  }

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}${paths.profile}`,
    configuration: configuration.id,
  });
}


export async function getStripePrices() {
  const prices = await stripe.prices.list({
    expand: ["data.product"],
    active: true,
    type: "recurring",
  });

  return prices.data.map((price) => ({
    id: price.id,
    productId:
      typeof price.product === "string" ? price.product : price.product.id,
    unitAmount: price.unit_amount,
    currency: price.currency,
    interval:
      price.recurring?.interval === "month" &&
      price.recurring?.interval_count === 3
        ? "quarter"
        : price.recurring?.interval,
    trialPeriodDays: price.recurring?.trial_period_days,
  }));
}

export async function getStripeProducts() {
  const products = await stripe.products.list({
    active: true,
    expand: ["data.default_price"],
  });

  return products.data.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    defaultPriceId:
      typeof product.default_price === "string"
        ? product.default_price
        : product.default_price?.id,
  }));
}
