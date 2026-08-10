"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      // Sem polling, o React mantém "authenticated" em memória depois que o cookie some
      refetchInterval={10}
      refetchOnWindowFocus
    >
      {children}
    </SessionProvider>
  );
}
