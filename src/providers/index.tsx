"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { Provider as ReduxProvider } from "react-redux";
import { SWRConfig } from "swr";

import { store } from "@/lib/store";
import { AuthProvider } from "@/providers/auth-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <NextThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SWRConfig
          value={{
            revalidateOnFocus: false,
            revalidateOnReconnect: true,
            keepPreviousData: true,
          }}
        >
          <AuthProvider>{children}</AuthProvider>
        </SWRConfig>
      </NextThemeProvider>
    </ReduxProvider>
  );
}
