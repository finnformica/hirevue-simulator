import { createClientForServer } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const supabase = await createClientForServer();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/profile");
  }

  redirect("/home");
}
