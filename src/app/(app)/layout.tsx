import { AuthGuard } from "@/components/auth/auth-guard";
import { UserMenu } from "@/components/profile/user-menu";
import { paths } from "@/utils/paths";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href={paths.home} className="text-brand font-bold text-2xl">
                GradGuru
              </Link>
              <div className="flex items-center space-x-4">
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-16 py-12">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
