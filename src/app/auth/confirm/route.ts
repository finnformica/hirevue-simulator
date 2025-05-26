import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { VerifyOtpParams } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    const supabase = await createClientForServer();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    } as VerifyOtpParams);

    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(next);
    }
  }

  // redirect the user to an error page with some instructions
  redirect(paths.authCodeError);
}
