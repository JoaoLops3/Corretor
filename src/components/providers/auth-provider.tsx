"use client";

import { SessionProvider } from "next-auth/react";

const REFETCH_SECONDS = 10;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={REFETCH_SECONDS} refetchOnWindowFocus>
      {children}
    </SessionProvider>
  );
}
