"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={3} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  );
}
