// IMPORTANT = remove this file in favour of the server side supabase client
import { createClient } from "@supabase/supabase-js";

export const supabaseApi = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
