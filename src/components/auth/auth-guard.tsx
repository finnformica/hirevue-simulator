import { supabaseClientForServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const {
    data: { session },
  } = await supabaseClientForServer.auth.getSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <>{children}</>;
}
