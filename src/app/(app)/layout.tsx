import { AuthGuard } from "@/components/auth/auth-guard";
import { UserMenu } from "@/components/profile/user-menu";
import Link from "next/link";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <header className="border-b border-gray-800">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-green-400 font-bold text-2xl">
                GradGuru
              </Link>
              <div className="flex items-center space-x-4">
                <UserMenu />
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto py-6">{children}</main>
      </div>
    </AuthGuard>
  );
}
