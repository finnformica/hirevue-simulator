import { paths } from "@/utils/paths";
import { createClientForServer } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

type ActionWithUserFunction<T> = (formData: FormData, user: User) => Promise<T>;

export function withUser<T>(action: ActionWithUserFunction<T>) {
  return async (formData: FormData): Promise<T> => {
    const supabase = await createClientForServer();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      redirect(paths.createAccount);
    }

    return action(formData, user);
  };
}
