"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { tipoBadgeClass, tipoBorderClass, SegToggle, Button } from "@/components/ui/primitives";
import { CompromissoModal } from "@/components/calendar/compromisso-modal";
import { NewVisitModal } from "@/components/calendar/new-visit-modal";
import { RouteView } from "@/components/calendar/route-view";
import type { VisitStatus } from "@prisma/client";

export type VisitView = {
  id: string;
  time: string;
  duration: string;
  title: string;
  subtitle: string;
  status: VisitStatus;
  statusLabel: string;
  notes: string | null;
  propertyId: string;
  leadId: string;
  scheduledAt: string;
  lat: number | null;
  lng: number | null;
  address: string;
};

function buildWeek(center: Date) {
  const start = new Date(center);
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  start.setHours(12, 0, 0, 0);
  const labels = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return {
      dow: labels[i],
      dom: String(d.getDate()).padStart(2, "0"),
      iso: d.toISOString().slice(0, 10),
    };
  });
}

export function CalendarioClient({
  initialVisits,
  routeStops,
  openNew,
  initialDay,
}: {
  initialVisits: VisitView[];
  routeStops: {
    id: string;
    label: string;
    address: string;
    lat: number;
    lng: number;
    time: string;
    duration: string;
  }[];
  openNew?: boolean;
  initialDay: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"agenda" | "roteiro">("agenda");
  const [activeDay, setActiveDay] = useState(initialDay);
  const [selected, setSelected] = useState<VisitView | null>(null);
  const [newOpen, setNewOpen] = useState(!!openNew);

  const week = useMemo(() => buildWeek(new Date(activeDay + "T12:00:00")), [activeDay]);
  const monthLabel = new Date(activeDay + "T12:00:00").toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  function selectDay(iso: string) {
    setActiveDay(iso);
    router.push(`/calendario?day=${iso}`);
  }

  return (
    <section className="animate-fade-in">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <span className="page-kicker capitalize">{monthLabel}</span>
          <h1 className="page-title">Calendário</h1>
        </div>
        <Button onClick={() => setNewOpen(true)}>Novo compromisso</Button>
      </div>

      <div className="mb-3.5 flex gap-1.5 overflow-x-auto pb-1.5">
        {week.map((d) => {
          const active = d.iso === activeDay;
          return (
            <button
              key={d.iso}
              onClick={() => selectDay(d.iso)}
              className={`w-13 flex-shrink-0 rounded-[10px] border py-2.5 text-center transition-colors duration-150 ${
                active ? "border-ink bg-ink text-white shadow-[var(--shadow-sm-brand)]" : "border-line bg-paper-2 hover:border-cyan"
              }`}
            >
              <div className="text-[10px] uppercase opacity-70">{d.dow}</div>
              <div className="mt-0.5 font-display text-base font-bold">{d.dom}</div>
            </button>
          );
        })}
      </div>

      <SegToggle
        value={tab}
        onChange={(v) => setTab(v as "agenda" | "roteiro")}
        options={[
          { value: "agenda", label: "Agenda" },
          { value: "roteiro", label: "Roteiro do dia" },
        ]}
      />

      {tab === "agenda" ? (
        <div>
          {initialVisits.length === 0 ? (
            <div className="empty-panel py-10">Nenhuma visita neste dia</div>
          ) : (
            initialVisits.map((c) => (
              <div
                key={c.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelected(c)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelected(c);
                }}
                className={`mb-2.5 flex cursor-pointer gap-3 rounded-[14px] border-y border-r border-line ${tipoBorderClass("visita")} bg-paper-2 p-3 transition-shadow hover:shadow-[var(--shadow-sm-brand)]`}
              >
                <div className="min-w-12 border-r-2 border-dashed border-line pr-3 text-right font-mono text-[13px] font-semibold text-ink">
                  {c.time}
                  <span className="mt-0.5 block text-[11px] font-normal text-text-mut">{c.duration}</span>
                </div>
                <div>
                  <span className={tipoBadgeClass("visita")}>Visita</span>
                  <div className="text-[13.5px] font-bold">{c.title}</div>
                  <div className="text-xs text-text-mut">{c.subtitle}</div>
                  <div className="mt-1 font-mono text-[11px] text-text-mut">{c.statusLabel}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <RouteView initialStops={routeStops} />
      )}

      <CompromissoModal
        visit={selected}
        onClose={() => setSelected(null)}
        onChanged={() => router.refresh()}
      />
      <NewVisitModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
      />
    </section>
  );
}
