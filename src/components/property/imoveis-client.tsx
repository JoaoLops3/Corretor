"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyStatus } from "@prisma/client";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyFormModal } from "@/components/property/property-form-modal";
import { PropertyDetailModal } from "@/components/property/property-detail-modal";
import { Chip, Button, EmptyState } from "@/components/ui/primitives";
import type { PropertyView } from "@/lib/property-view";

export function ImoveisClient({
  initialProperties,
  openNew,
  viewingTeamMember,
  ownerName,
  initialSearch = "",
}: {
  initialProperties: PropertyView[];
  openNew?: boolean;
  viewingTeamMember?: boolean;
  ownerName?: string | null;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"todos" | PropertyStatus>("todos");
  const [search, setSearch] = useState(initialSearch);
  const [formOpen, setFormOpen] = useState(!!openNew);
  const [editing, setEditing] = useState<PropertyView | null>(null);
  const [selected, setSelected] = useState<PropertyView | null>(() => {
    if (!initialSearch) return null;
    const q = initialSearch.toLowerCase();
    return (
      initialProperties.find(
        (p) => p.code.toLowerCase() === q || p.title.toLowerCase().includes(q),
      ) ?? null
    );
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return initialProperties.filter((p) => {
      const statusOk = statusFilter === "todos" || p.status === statusFilter;
      const searchOk =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q);
      return statusOk && searchOk;
    });
  }, [initialProperties, statusFilter, search]);

  const subtitle = search
    ? `${filtered.length} resultado(s) para "${search}"`
    : viewingTeamMember
      ? `${filtered.length} imóveis de ${ownerName?.split(" ")[0] ?? "equipe"}`
      : `${filtered.length} imóveis seus`;

  return (
    <section className="animate-fade-in">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <span className="page-kicker">{subtitle}</span>
          <h1 className="page-title">Imóveis</h1>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          Novo imóvel
        </Button>
      </div>

      {viewingTeamMember && (
        <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-[13px]">
          <span className="text-text-mut">
            Vendo carteira de <span className="font-semibold text-text">{ownerName}</span>
          </span>
          <Link href="/equipe" className="font-mono text-[11px] uppercase tracking-wider text-cyan hover:underline">
            Voltar à equipe
          </Link>
        </div>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por título..."
        className="field-input mb-3.5 md:hidden"
      />

      <div className="mb-3.5 flex flex-wrap gap-2">
        {(["todos", "DISPONIVEL", "RESERVADO", "VENDIDO"] as const).map((s) => (
          <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s === "todos" ? "Todos" : s === "DISPONIVEL" ? "Disponível" : s === "RESERVADO" ? "Reservado" : "Vendido"}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nenhum imóvel encontrado"
          description="Tente outro filtro ou cadastre um novo imóvel."
          action={<Button onClick={() => setFormOpen(true)}>Novo imóvel</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      <PropertyFormModal
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={() => router.refresh()}
      />
      <PropertyDetailModal
        property={selected}
        onClose={() => setSelected(null)}
        onStatusChange={() => router.refresh()}
        onEdit={(p) => {
          setSelected(null);
          setEditing(p);
          setFormOpen(true);
        }}
      />
    </section>
  );
}
