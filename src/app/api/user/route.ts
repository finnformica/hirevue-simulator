import { createClientForServer } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClientForServer();

  // RLS handles what data is visible to the user
  const { data } = await supabase.from("profiles").select();
  const user = data?.[0];

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json(user);
}
