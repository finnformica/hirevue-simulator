import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function AuthGuard({ children }: { children: React.ReactNode }) {
  const supabase = await createClientForServer();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(paths.signIn);
  }

  return <>{children}</>;
}
