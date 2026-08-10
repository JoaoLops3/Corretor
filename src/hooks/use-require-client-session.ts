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

/** Revalida no servidor com cache: no-store. Sem cookie → login. */
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
    const id = window.setInterval(verify, 3000);
    const onVisible = () => {
      if (document.visibilityState === "visible") void verify();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
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
