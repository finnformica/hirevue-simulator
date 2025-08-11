"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { paths } from "@/utils/paths";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the custom 404 error page
    router.replace(paths.error[404]);
  }, [router]);

  // Show a minimal loading state while redirecting
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
