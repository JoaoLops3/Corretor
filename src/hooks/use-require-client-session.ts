"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

/** Redireciona se o cookie de sessão sumir (estado em memória do SessionProvider). */
export function useRequireClientSession() {
  const session = useSession();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      window.location.replace("/login");
    }
  }, [session.status]);

  return session;
}
