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

// Global base URL for Stripe redirects
const getBaseUrl = () => {
  return (
    process.env.BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
};

// Helper function to get or create Stripe customer for user
async function getOrCreateStripeCustomer(user: User) {
  const supabase = await createClientForServer();

  const { data: userData } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (userData?.stripe_customer_id) {
    return userData.stripe_customer_id;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email: user.email,
    metadata: {
      supabase_user_id: user.id,
    },
  });

  // Store the Stripe customer ID in the database
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: customer.id })
    .eq("id", user.id);

  return customer.id;
}

// Helper function to get user by Stripe customer ID
async function getUserByStripeCustomerId(customerId: string) {
  const supabase = await createClientForServer();

  const { data: user } = await supabase
    .from("profiles")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .single();

  return user;
}

// Helper function to update user subscription
async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    stripe_subscription_id?: string | null;
    stripe_product_id?: string | null;
    plan_name?: string | null;
    subscription_status?: string | null;
  }
) {
  const supabase = await createClientForServer();

  await supabase.from("profiles").update(subscriptionData).eq("id", userId);
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
  const baseUrl = getBaseUrl();
  const successUrl = `${baseUrl}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/pricing`;

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
    const { data: userData } = await supabase
      .from("profiles")
      .select("stripe_product_id")
      .eq("id", user.id)
      .single();

    const productId = userData?.stripe_product_id;

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

  // Construct return URL with proper scheme
  const baseUrl = getBaseUrl();
  const returnUrl = `${baseUrl}/profile`;

  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    configuration: configuration.id,
  });
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const subscriptionId = subscription.id;
  const status = subscription.status;

  const user = await getUserByStripeCustomerId(customerId);

  if (!user) {
    console.error("User not found for Stripe customer:", customerId);
    return;
  }

  if (status === "active" || status === "trialing") {
    const plan = subscription.items.data[0]?.plan;
    await updateUserSubscription(user.id, {
      stripe_subscription_id: subscriptionId,
      stripe_product_id: plan?.product as string,
      plan_name: (plan?.product as Stripe.Product).name,
      subscription_status: status,
    });
  } else if (status === "canceled" || status === "unpaid") {
    await updateUserSubscription(user.id, {
      stripe_subscription_id: null,
      stripe_product_id: null,
      plan_name: null,
      subscription_status: status,
    });
  }
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
