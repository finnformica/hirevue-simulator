import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AuthProvider } from "@/components/auth/auth-context";
import { Providers } from "./providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gradguru - Interview Preparation",
  description:
    "Gradguru is a platform designed to help students prepare for interviews with resources, practice questions, and community support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <AuthProvider>
        <Providers>
          <body className={`${inter.className} dark`}>{children}</body>
        </Providers>
      </AuthProvider>
    </html>
  );
}
