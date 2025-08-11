import { Button } from "@/components/ui/button";
import { paths } from "@/utils/paths";
import { CheckCircle, Home, LogIn } from "lucide-react";
import Link from "next/link";

const ConfirmationSuccessPage = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md bg-gray-900 rounded-lg border border-gray-800 p-8 text-center">
        <div className="mb-8">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">
            Email Confirmed!
          </h2>
          <p className="text-gray-400 text-lg">
            Your email has been successfully verified. You're all set to start
            practicing your interview skills.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <Link href={paths.home} className="flex-1">
              <Button
                variant="outline"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>

            <Link href={paths.auth.signIn} className="flex-1">
              <Button className="w-full bg-green-500 hover:bg-green-600 text-black font-medium">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            Ready to ace your next interview? Sign in and begin your practice
            sessions.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            HireVue Simulator - Your path to interview success
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationSuccessPage;
