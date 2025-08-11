import { createClientForServer } from "@/utils/supabase/server";

export interface StripeCustomer {
  id: string;
  email: string | null;
  name: string | null;
  metadata: { supabase_user_id: string } | null;
  created: number | null;
  updated_at: string;
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: string;
  current_period_start: number | null;
  current_period_end: number | null;
  items: any;
  metadata: any;
  created: number | null;
  updated_at: string;
}

/**
 * Get Stripe customer by Supabase user ID
 */
export async function getStripeCustomerByUserId(userId: string): Promise<StripeCustomer | null> {
  const supabase = await createClientForServer();
  
  const { data, error } = await supabase
    .schema('stripe')
    .from('customers')
    .select('*')
    .eq('metadata->>supabase_user_id', userId)
    .eq('deleted', false)
    .single();

  if (error) {
    console.error('Error fetching Stripe customer:', error);
    return null;
  }

  return data;
}

/**
 * Get Stripe customer by Stripe customer ID
 */
export async function getStripeCustomerById(customerId: string): Promise<StripeCustomer | null> {
  const supabase = await createClientForServer();
  
  const { data, error } = await supabase
    .schema('stripe')
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .eq('deleted', false)
    .single();

  if (error) {
    console.error('Error fetching Stripe customer:', error);
    return null;
  }

  return data;
}

/**
 * Get active subscription for a customer
 */
export async function getActiveSubscription(customerId: string): Promise<StripeSubscription | null> {
  const supabase = await createClientForServer();
  
  const { data, error } = await supabase
    .schema('stripe')
    .from('subscriptions')
    .select('*')
    .eq('customer', customerId)
    .in('status', ['active', 'trialing'])
    .order('created', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error fetching active subscription:', error);
    return null;
  }

  // Return the first (most recent) subscription or null if none found
  return data && data.length > 0 ? data[0] : null;
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(subscriptionId: string): Promise<StripeSubscription | null> {
  const supabase = await createClientForServer();
  
  const { data, error } = await supabase
    .schema('stripe')
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }

  return data;
}

/**
 * Get user's subscription status and plan information
 */
export async function getUserSubscriptionInfo(userId: string): Promise<{
  isProUser: boolean;
  subscriptionStatus: string | null;
  planName: string | null;
  billingPeriod: string | null;
  customerId: string | null;
  subscriptionId: string | null;
} | null> {
  const customer = await getStripeCustomerByUserId(userId);
  
  if (!customer) {
    return {
      isProUser: false,
      subscriptionStatus: null,
      planName: null,
      billingPeriod: null,
      customerId: null,
      subscriptionId: null,
    };
  }

  const subscription = await getActiveSubscription(customer.id);
  
  if (!subscription) {
    return {
      isProUser: false,
      subscriptionStatus: null,
      planName: null,
      billingPeriod: null,
      customerId: customer.id,
      subscriptionId: null,
    };
  }

  // Extract plan information from subscription items
  const items = subscription.items as any;
  const firstItem = items?.data?.[0];
  const price = firstItem?.price;
  const product = price?.product;
  
  // Determine billing period from price interval
  const interval = price?.recurring?.interval;
  const intervalCount = price?.recurring?.interval_count;
  const billingPeriod = interval === 'month' && intervalCount === 3 ? 'quarterly' : 'monthly';

  const isProUser = subscription.status === 'active' || subscription.status === 'trialing';

  return {
    isProUser,
    subscriptionStatus: subscription.status,
    planName: product?.name || 'Pro',
    billingPeriod,
    customerId: customer.id,
    subscriptionId: subscription.id,
  };
}
