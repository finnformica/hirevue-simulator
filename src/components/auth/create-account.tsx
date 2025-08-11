import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/providers/auth-provider";
import { paths } from "@/utils/paths";

type CreateAccountForm = {
  first_name: string;
  last_name: string;
  email: string;
  terms: boolean;
};

export function CreateAccount() {
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<CreateAccountForm>();

  const onSubmit = async (formData: CreateAccountForm) => {
    setIsLoading(true);
    setErrorMsg(null);

    const emailRedirectTo = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}${paths.auth.confirmationSuccess}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: formData.email,
      options: {
        emailRedirectTo,
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
        },
      },
    });

    if (error) {
      // Handle common Supabase errors
      if (error.status === 400) {
        setErrorMsg("Please enter a valid email address.");
      } else if (error.status === 409) {
        setErrorMsg(
          "An account with this email already exists. Please sign in instead."
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
          <Link href={paths.home} className="text-brand font-bold text-3xl">
            GradGuru
          </Link>
          <p className="text-gray-400 mt-2">
            Create your account to get started
          </p>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    First Name
                  </label>
                  <input
                    {...register("first_name", { required: true })}
                    aria-invalid={errors.first_name ? "true" : "false"}
                    type="text"
                    id="first_name"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Last Name
                  </label>
                  <input
                    {...register("last_name", { required: true })}
                    aria-invalid={errors.last_name ? "true" : "false"}
                    type="text"
                    id="last_name"
                    required
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                    placeholder="Last name"
                  />
                </div>
              </div>
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
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex items-start">
                <input
                  {...register("terms", { required: true })}
                  aria-invalid={errors.terms ? "true" : "false"}
                  type="checkbox"
                  id="terms"
                  required
                  className="h-4 w-4 mt-1 rounded border-gray-700 bg-gray-800 text-brand focus:ring-brand focus:ring-offset-gray-900"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  I agree to the{" "}
                  <a href="#terms" className="text-brand hover:text-brand/80">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#privacy" className="text-brand hover:text-brand/80">
                    Privacy Policy
                  </a>
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand hover:bg-brand/90 disabled:bg-brand/70 text-brand-foreground font-medium py-2 rounded-md transition-colors mt-6"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </button>
              <p className="text-sm text-gray-400 text-center mt-2">
                We'll send you a magic link to verify your email
              </p>
            </form>
          ) : (
            <div className="text-center py-4">
              <div className="bg-brand/10 border border-brand/30 rounded-lg p-4 mb-6">
                <p className="text-brand font-medium">Check your email</p>
                <p className="text-gray-400 text-sm mt-1">
                  We've sent you a magic link to verify your email and complete
                  your registration
                </p>
              </div>
              <button
                onClick={() => setIsEmailSent(false)}
                className="text-brand hover:text-brand/80 text-sm"
              >
                Use a different email address
              </button>
            </div>
          )}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link
                href={paths.auth.signIn}
                className="text-brand hover:text-brand/80"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
