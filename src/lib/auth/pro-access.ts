import { supabaseClientForBrowser } from "@/utils/supabase/client";
import { createClientForServer } from "@/utils/supabase/server";

/**
 * Check if a user has pro access (admin or paid subscription)
 * Uses the SQL function for efficient checking
 */
export async function checkUserProAccess(userId: string): Promise<boolean> {
  try {
    const supabase = await createClientForServer();
    
    const { data, error } = await supabase
      .rpc('check_user_pro_access', { user_id: userId });

    if (error) {
      console.error('Error checking pro access:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error checking pro access:', error);
    return false;
  }
}

/**
 * Client-side version for checking pro access
 */
export async function checkUserProAccessClient(userId: string): Promise<boolean> {
  try {
    // Try the SQL function first
    const { data, error } = await supabaseClientForBrowser
      .rpc('check_user_pro_access', { user_id: userId });

    if (!error && data !== null) {
      return data;
    }

    return false;
  } catch (error) {
    console.error('Error checking pro access:', error);
    return false;
  }
}
