"use client";

import { Button } from "@/components/ui/button";
import { paths } from "@/utils/paths";
import { useRouter } from "next/navigation";

export function UpgradeButton() {
  const router = useRouter();
  return (
    <Button
      onClick={() => router.push(paths.pricing)}
      variant="outline"
      className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700 w-full"
    >
      Upgrade to Pro
    </Button>
  );
}
