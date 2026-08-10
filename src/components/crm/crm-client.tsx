"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { LeadStatus, LeadTemperature } from "@prisma/client";
import { Button, TempTag } from "@/components/ui/primitives";
import { NewLeadModal } from "@/components/crm/new-lead-modal";
import { LeadDetailModal } from "@/components/crm/lead-detail-modal";
import { leadColumnLabels, type LeadColumn } from "@/lib/types";
import { updateLeadStatus } from "@/lib/actions/leads";
import { useToast } from "@/components/providers/toast-provider";

export type LeadView = {
  id: string;
  name: string;
  phone: string;
  interest: string;
  value: string;
  temperature: LeadTemperature;
  status: LeadStatus;
  lastContactAt: string | null;
  propertyId: string | null;
};

const columnsOrder: LeadColumn[] = ["NOVO", "EM_VISITA", "PROPOSTA", "FECHADO", "PERDIDO"];

function toColumn(status: LeadStatus): LeadColumn {
  return status as LeadColumn;
}

function LeadCardContent({ lead }: { lead: LeadView }) {
  return (
    <>
      <div className="text-[13px] font-bold">{lead.name}</div>
      <div className="mb-2 mt-0.5 text-[11.5px] text-text-mut">Interesse: {lead.interest || "—"}</div>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 truncate font-mono text-xs font-semibold text-ok">{lead.value}</div>
        <TempTag temperature={lead.temperature} />
      </div>
    </>
  );
}

function LeadCard({
  lead,
  onOpen,
}: {
  lead: LeadView;
  onOpen: (lead: LeadView) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: lead.id,
    data: { type: "lead", lead, from: toColumn(lead.status) },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      role="button"
      tabIndex={0}
      onClick={() => onOpen(lead)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(lead);
        }
      }}
      className={`mb-2 w-full cursor-grab touch-none rounded-xl border border-line bg-paper-2 p-2.5 text-left transition-shadow hover:shadow-[var(--shadow-sm-brand)] active:cursor-grabbing ${
        isDragging ? "opacity-30" : ""
      }`}
    >
      <LeadCardContent lead={lead} />
    </div>
  );
}

function ColumnDroppable({
  column,
  leads,
  onOpen,
}: {
  column: LeadColumn;
  leads: LeadView[];
  onOpen: (lead: LeadView) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column,
    data: { type: "column", column },
  });

  return (
    <div className="w-62.5 flex-shrink-0">
      <div className="mb-2 flex items-center justify-between px-0.5 text-xs font-bold uppercase tracking-wide text-text-mut">
        {leadColumnLabels[column]}
        <span className="rounded-full border border-line bg-paper-2 px-1.5 py-0.5 font-mono text-[11px]">
          {leads.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`min-h-28 rounded-xl border border-dashed p-1 transition-colors ${
          isOver ? "border-cyan bg-cyan-soft" : "border-transparent"
        }`}
      >
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onOpen={onOpen} />
        ))}
        {leads.length === 0 && (
          <div className="px-2 py-6 text-center text-[11px] text-text-mut">Solte aqui</div>
        )}
      </div>
    </div>
  );
}

function resolveTargetColumn(
  overId: string,
  leads: LeadView[],
  fallback: LeadColumn
): LeadColumn {
  if (columnsOrder.includes(overId as LeadColumn)) return overId as LeadColumn;
  const overLead = leads.find((l) => l.id === overId);
  return overLead ? toColumn(overLead.status) : fallback;
}

export function CrmClient({
  initialLeads,
  openNew,
  initialLeadId,
}: {
  initialLeads: LeadView[];
  openNew?: boolean;
  initialLeadId?: string | null;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [newOpen, setNewOpen] = useState(!!openNew);
  const [selected, setSelected] = useState<LeadView | null>(
    () => initialLeads.find((l) => l.id === initialLeadId) ?? null,
  );
  const [leads, setLeads] = useState(initialLeads);
  const [activeLead, setActiveLead] = useState<LeadView | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const columns = useMemo(() => {
    const map: Record<LeadColumn, LeadView[]> = {
      NOVO: [],
      EM_VISITA: [],
      PROPOSTA: [],
      FECHADO: [],
      PERDIDO: [],
    };
    for (const lead of leads) {
      map[toColumn(lead.status)].push(lead);
    }
    return map;
  }, [leads]);

  const total = leads.filter((l) => l.status !== "FECHADO" && l.status !== "PERDIDO").length;

  async function moveLead(lead: LeadView, status: LeadStatus) {
    if (toColumn(lead.status) === toColumn(status)) return;

    const previous = leads;
    setLeads((curr) => curr.map((l) => (l.id === lead.id ? { ...l, status } : l)));
    setSelected((curr) => (curr?.id === lead.id ? { ...curr, status } : curr));

    try {
      await updateLeadStatus(lead.id, status);
      router.refresh();
    } catch (e) {
      setLeads(previous);
      showToast(e instanceof Error ? e.message : "Erro ao mover lead");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    suppressClick.current = true;
    const lead =
      (event.active.data.current?.lead as LeadView | undefined) ??
      leads.find((l) => l.id === event.active.id) ??
      null;
    setActiveLead(lead);
  }

  function handleDragEnd(event: DragEndEvent) {
    const lead = activeLead;
    setActiveLead(null);
    window.setTimeout(() => {
      suppressClick.current = false;
    }, 0);

    const { over } = event;
    if (!over || !lead) return;

    const target = resolveTargetColumn(String(over.id), leads, toColumn(lead.status));
    void moveLead(lead, target as LeadStatus);
  }

  function openLead(lead: LeadView) {
    if (suppressClick.current) return;
    setSelected(lead);
  }

  return (
    <section className="animate-fade-in">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <span className="mb-1 block font-mono text-[11px] uppercase tracking-wider text-cyan">{total} leads ativos</span>
          <h1 className="text-[21px] font-bold">CRM / Leads</h1>
        </div>
        <Button onClick={() => setNewOpen(true)}>Novo lead</Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveLead(null);
          suppressClick.current = false;
        }}
      >
        <div className="flex gap-3 overflow-x-auto pb-2.5">
          {columnsOrder.map((col) => (
            <ColumnDroppable key={col} column={col} leads={columns[col]} onOpen={openLead} />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead ? (
            <div className="w-62.5 cursor-grabbing rounded-xl border border-cyan bg-paper-2 p-2.5 shadow-[var(--shadow-md-brand)]">
              <LeadCardContent lead={activeLead} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <NewLeadModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => router.refresh()}
      />
      <LeadDetailModal
        lead={selected}
        onClose={() => setSelected(null)}
        onMoved={moveLead}
        onChanged={() => router.refresh()}
      />
    </section>
  );
}
