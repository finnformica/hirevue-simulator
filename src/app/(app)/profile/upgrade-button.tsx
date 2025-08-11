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
      className="w-full bg-muted hover:bg-muted/50"
    >
      Upgrade to Pro
    </Button>
  );
}
