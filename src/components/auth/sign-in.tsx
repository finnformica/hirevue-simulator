import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth-provider";
import { paths } from "@/utils/paths";

type SignInForm = {
  email: string;
};

export function SignIn() {
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<SignInForm>();

  console.log(process.env.NEXT_PUBLIC_BASE_URL);

  const onSubmit = async (formData: SignInForm) => {
    setIsLoading(true);
    setErrorMsg(null);

    const emailRedirectTo =
      process?.env?.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    console.log(emailRedirectTo);

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo,
      },
    });

    if (error) {
      if (error.status === 422) {
        setErrorMsg(
          "No account found for this email. You may need to create an account."
        );
      } else {
        setErrorMsg(error.message || "An error occurred. Please try again.");
      }
      setIsLoading(false);
      return;
    } else {
      setIsEmailSent(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={paths.home} className="text-green-400 font-bold text-3xl">
            GradGuru
          </Link>
          <p className="text-gray-400 mt-2">Sign in to your account</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          {errorMsg && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}
          {!isEmailSent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Email
                </label>
                <input
                  {...register("email", { required: true })}
                  aria-invalid={errors.email ? "true" : "false"}
                  type="email"
                  id="email"
                  required
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-500/70 text-black font-medium py-2 rounded-md transition-colors mt-6"
              >
                {isLoading ? "Sending link..." : "Send Magic Link"}
              </button>
              <p className="text-sm text-gray-400 text-center mt-2">
                We'll email you a magic link for password-free sign in
              </p>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                <p className="text-green-400 font-medium">Check your email</p>
                <p className="text-gray-400 text-sm mt-1">
                  We've sent you a magic link to sign in to your account
                </p>
              </div>
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-green-400 hover:text-green-300 text-sm"
              >
                Use a different email address
              </button>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link
                href={paths.createAccount}
                className="text-green-400 hover:text-green-300"
              >
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
