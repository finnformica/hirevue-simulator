"use client";

import { store } from "@/lib/store";
import { AuthProvider } from "@/providers/auth-provider";
import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>{children}</AuthProvider>
      </NextThemeProvider>
    </ReduxProvider>
  );
}
