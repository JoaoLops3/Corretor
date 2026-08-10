"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Plus, Search, LogOut, X } from "lucide-react";
import { navForRole } from "./nav-items";
import { Avatar } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { FabMenu } from "./fab-menu";
import { listUpcomingVisitNotifications, searchGlobal } from "@/lib/actions/dashboard";
import { roleLabels } from "@/lib/types";
import { useRequireClientSession } from "@/hooks/use-require-client-session";
import type { Role } from "@prisma/client";

function logout() {
  window.location.assign("/api/auth/logout");
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useToast();
  const { data: session, status } = useRequireClientSession();
  const user = session?.user;
  const sessionReady = status === "authenticated" && !!user;
  const roleLabel = user?.role ? roleLabels[user.role as Role] : "";
  const teamName = user?.teamName || "Imobiliária";
  const items = navForRole(user?.role as Role | undefined);
  const mobileTabs = items.filter((i) => i.href !== "/equipe").slice(0, 5);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    properties: { id: string; title: string; code: string }[];
    leads: { id: string; name: string; phone: string }[];
  } | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<
    { id: string; title: string; when: string; client: string }[]
  >([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const t = setTimeout(() => {
      searchGlobal(query).then(setResults).catch(() => setResults(null));
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function openNotifications() {
    setNotifOpen(true);
    try {
      const rows = await listUpcomingVisitNotifications();
      setNotifs(
        rows.map((v) => ({
          id: v.id,
          title: v.property.title,
          client: v.lead.name,
          when: v.scheduledAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      );
    } catch {
      showToast("Não foi possível carregar notificações");
    }
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-sm text-text-mut">
        Verificando sessão…
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1400px]">
      <aside className="sticky top-0 hidden h-screen w-60 flex-shrink-0 flex-col gap-1 bg-ink p-5.5 text-white md:flex">
        <div className="flex items-center gap-2.5 px-2.5 pb-6.5">
          <div className="flex h-8.5 w-8.5 flex-shrink-0 -rotate-4 items-center justify-center rounded-[9px] bg-brass font-display font-extrabold text-ink">
            P
          </div>
          <div>
            <div className="font-display text-base font-bold">Prancheta</div>
            <div className="font-mono text-[11px] text-[#9FB4C9]">{teamName}</div>
          </div>
        </div>
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-[9px] px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-cyan text-white shadow-[var(--shadow-sm-brand)]" : "text-[#C7D5E2] hover:bg-white/7 hover:text-white"
              }`}
            >
              <Icon size={18} className="flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
        <button
          onClick={() => showToast(`Perfil de ${user?.name || "você"}`)}
          className="mt-auto flex items-center gap-2.5 rounded-[9px] border-t border-white/12 pt-3.5 pl-1.5 text-left"
        >
          <Avatar initials={sessionReady ? user.initials || "?" : "··"} />
          <div>
            <div className="text-[13px] font-semibold text-white">
              {sessionReady ? user.name || "Você" : "Carregando…"}
            </div>
            <div className="text-[11px] text-[#9FB4C9]">{sessionReady ? roleLabel : ""}</div>
          </div>
        </button>
        <button
          onClick={logout}
          className="mt-1 flex items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-[12.5px] font-medium text-[#9FB4C9] hover:bg-white/7 hover:text-white"
        >
          <LogOut size={15} /> Sair
        </button>
      </aside>

      <div className="min-w-0 flex-1 pb-21 md:pb-5">
        <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-paper/92 px-4 py-3.5 backdrop-blur-md">
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex h-7 w-7 -rotate-4 items-center justify-center rounded-[9px] bg-brass font-display text-[13px] font-extrabold text-ink">
              P
            </div>
            <div className="font-display text-[15px] font-bold">Prancheta</div>
          </div>
          <div className="relative hidden max-w-[380px] flex-1 md:block">
            <div className="flex items-center gap-2.5 rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-text-mut">
              <Search size={15} className="flex-shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar imóvel, cliente ou corretor..."
                className="flex-1 border-none bg-transparent text-[13px] text-text outline-none"
              />
            </div>
            {results && (
              <div className="absolute top-full right-0 left-0 z-40 mt-1 max-h-80 overflow-auto rounded-[10px] border border-line bg-paper-2 shadow-[var(--shadow-md-brand)]">
                {results.properties.length === 0 && results.leads.length === 0 ? (
                  <div className="p-3 text-[12.5px] text-text-mut">Nenhum resultado</div>
                ) : (
                  <>
                    {results.properties.map((p) => (
                      <button
                        key={p.id}
                        className="block w-full border-b border-line px-3.5 py-2.5 text-left text-[13px] hover:bg-cyan-soft"
                        onClick={() => {
                          setQuery("");
                          setResults(null);
                          router.push("/imoveis");
                        }}
                      >
                        <span className="font-mono text-[11px] text-text-mut">#{p.code}</span> {p.title}
                      </button>
                    ))}
                    {results.leads.map((l) => (
                      <button
                        key={l.id}
                        className="block w-full border-b border-line px-3.5 py-2.5 text-left text-[13px] hover:bg-cyan-soft"
                        onClick={() => {
                          setQuery("");
                          setResults(null);
                          router.push("/crm");
                        }}
                      >
                        {l.name} <span className="font-mono text-[11px] text-text-mut">{l.phone}</span>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="relative flex items-center gap-2">
            <button
              aria-label="Notificações"
              onClick={openNotifications}
              className="relative flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-paper-2 hover:bg-cyan-soft"
            >
              <Bell size={17} />
              {notifs.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-paper-2 bg-stamp" />
              )}
            </button>
            <Link
              href="/imoveis?novo=1"
              aria-label="Novo imóvel"
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line bg-paper-2 hover:bg-cyan-soft"
            >
              <Plus size={17} />
            </Link>
            {notifOpen && (
              <div className="absolute top-full right-0 z-40 mt-2 w-72 rounded-[12px] border border-line bg-paper-2 p-2 shadow-[var(--shadow-md-brand)]">
                <div className="mb-1 flex items-center justify-between px-2 py-1">
                  <div className="text-[12px] font-bold">Próximas 2h</div>
                  <button onClick={() => setNotifOpen(false)} aria-label="Fechar">
                    <X size={14} />
                  </button>
                </div>
                {notifs.length === 0 ? (
                  <div className="px-2 py-3 text-[12.5px] text-text-mut">Nenhuma visita em breve</div>
                ) : (
                  notifs.map((n) => (
                    <button
                      key={n.id}
                      className="block w-full rounded-[8px] px-2 py-2 text-left hover:bg-cyan-soft"
                      onClick={() => {
                        setNotifOpen(false);
                        router.push("/calendario");
                      }}
                    >
                      <div className="text-[13px] font-semibold">{n.title}</div>
                      <div className="font-mono text-[11px] text-text-mut">
                        {n.when} · {n.client}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-4 md:p-6.5">{children}</div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-paper-2 px-1 pt-1.5 pb-2 md:hidden">
        {mobileTabs.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-1 text-[11px] font-semibold ${
                active ? "text-ink" : "text-text-mut"
              }`}
            >
              <Icon size={19} className={active ? "text-cyan" : ""} />
              {item.tabLabel}
            </Link>
          );
        })}
      </nav>
      <FabMenu />
    </div>
  );
}
