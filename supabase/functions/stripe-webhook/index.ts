// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { StripeSync } from 'npm:@supabase/stripe-sync-engine@0.40.1'

// Load secrets from environment variables
const databaseUrl = Deno.env.get('DATABASE_URL')!
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!

// Initialize StripeSync
const stripeSync = new StripeSync({
  databaseUrl,
  stripeWebhookSecret,
  stripeSecretKey,
  backfillRelatedEntities: false,
  autoExpandLists: true,
  maxPostgresConnections: 5,
})

Deno.serve(async (req) => {
  // Extract raw body as Uint8Array (buffer)
  const rawBody = new Uint8Array(await req.arrayBuffer())

  const stripeSignature = req.headers.get('stripe-signature')

  await stripeSync.processWebhook(rawBody, stripeSignature)

  return new Response(null, {
    status: 202,
    headers: { 'Content-Type': 'application/json' },
  })
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/stripe-webhook' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
