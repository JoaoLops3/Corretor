"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  teamId?: string | null;
  teamName?: string | null;
  initials?: string;
};

async function readServerSession(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/session", {
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { user?: SessionUser } | null;
  return data?.user?.id ? data.user : null;
}

function goLogin() {
  if (window.location.pathname === "/login") return;
  window.location.replace("/login");
}

/**
 * Sessão só vale se o servidor confirmar (cookie HttpOnly).
 * Eventos: mount, navegação, foco, bfcache. Backup a cada 60s.
 */
export function useRequireClientSession() {
  const pathname = usePathname();
  const session = useSession();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      const next = await readServerSession();
      if (cancelled) return;
      if (!next) {
        setUser(null);
        setChecked(true);
        goLogin();
        return;
      }
      setUser(next);
      setChecked(true);
    }

    void verify();

    const onVisible = () => {
      if (document.visibilityState === "visible") void verify();
    };
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void verify();
    };
    const onFocus = () => void verify();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);
    const backup = window.setInterval(verify, 60_000);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      window.clearInterval(backup);
    };
  }, [pathname]);

  useEffect(() => {
    if (session.status === "unauthenticated") goLogin();
  }, [session.status]);

  return {
    data: user ? { user } : null,
    status: !checked ? "loading" : user ? "authenticated" : "unauthenticated",
    update: session.update,
  };
}
