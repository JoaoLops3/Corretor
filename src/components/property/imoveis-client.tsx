"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PropertyStatus } from "@prisma/client";
import { PropertyCard } from "@/components/property/property-card";
import { PropertyFormModal } from "@/components/property/property-form-modal";
import { PropertyDetailModal } from "@/components/property/property-detail-modal";
import { Chip, Button } from "@/components/ui/primitives";
import type { PropertyView } from "@/lib/property-view";

export function ImoveisClient({
  initialProperties,
  openNew,
  viewingTeamMember,
  ownerName,
}: {
  initialProperties: PropertyView[];
  openNew?: boolean;
  viewingTeamMember?: boolean;
  ownerName?: string | null;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<"todos" | PropertyStatus>("todos");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(!!openNew);
  const [editing, setEditing] = useState<PropertyView | null>(null);
  const [selected, setSelected] = useState<PropertyView | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return initialProperties.filter((p) => {
      const statusOk = statusFilter === "todos" || p.status === statusFilter;
      const searchOk = !q || p.title.toLowerCase().includes(q);
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
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-cyan">
            {subtitle}
          </span>
          <h1 className="text-[21px] font-bold">Imóveis</h1>
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
        className="mb-3.5 w-full rounded-[10px] border border-line bg-paper-2 px-3.5 py-2.5 text-[13px] outline-none focus:border-cyan md:hidden"
      />

      <div className="mb-3.5 flex flex-wrap gap-2">
        {(["todos", "DISPONIVEL", "RESERVADO", "VENDIDO"] as const).map((s) => (
          <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s === "todos" ? "Todos" : s === "DISPONIVEL" ? "Disponível" : s === "RESERVADO" ? "Reservado" : "Vendido"}
          </Chip>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-[14px] border border-dashed border-line py-10 text-center text-text-mut">
          <div className="mb-2 text-3xl">🔍</div>
          <div className="mb-1 font-semibold text-text">Nenhum imóvel encontrado</div>
          <div className="mb-3.5 text-[12.5px]">Tente outro filtro ou cadastre um novo imóvel.</div>
          <Button onClick={() => setFormOpen(true)}>Novo imóvel</Button>
        </div>
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
