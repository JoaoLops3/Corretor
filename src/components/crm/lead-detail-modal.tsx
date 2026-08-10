"use client";

import { useState } from "react";
import { LeadStatus } from "@prisma/client";
import { Modal, ModalSub, ModalActions } from "@/components/ui/modal";
import { Button, TempTag } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { registerLeadContact } from "@/lib/actions/leads";
import { NewVisitModal } from "@/components/calendar/new-visit-modal";
import type { LeadView } from "@/components/crm/crm-client";

export function LeadDetailModal({
  lead,
  onClose,
  onMoved,
  onChanged,
}: {
  lead: LeadView | null;
  onClose: () => void;
  onMoved?: (lead: LeadView, status: LeadStatus) => void;
  onChanged?: () => void;
}) {
  const showToast = useToast();
  const [visitOpen, setVisitOpen] = useState(false);

  async function handleContact() {
    if (!lead) return;
    try {
      await registerLeadContact(lead.id);
      showToast("Contato registrado");
      onChanged?.();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao registrar");
    }
  }

  const history = [
    lead?.lastContactAt
      ? {
          text: "Último contato registrado",
          date: new Date(lead.lastContactAt).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          }),
        }
      : { text: "Sem contatos registrados ainda", date: "—" },
  ];

  return (
    <>
      <Modal open={!!lead} onClose={onClose}>
        {lead && (
          <>
            <div className="mb-1 flex flex-wrap items-center gap-2 pr-10">
              <div className="text-[17px] font-bold">{lead.name}</div>
              <TempTag temperature={lead.temperature} />
            </div>
            <ModalSub>
              {lead.interest || "Sem interesse"} · <span className="font-mono">{lead.value}</span>
              <div className="mt-1 font-mono text-[12px]">{lead.phone}</div>
            </ModalSub>

            <div className="mb-1.5 mt-3.5 text-xs font-bold uppercase text-text-mut">Histórico de atendimento</div>
            {history.map((item) => (
              <div key={item.date + item.text} className="flex gap-2.5 border-b border-line py-2.5 last:border-b-0">
                <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-cyan" />
                <div>
                  <div className="text-[13px]">{item.text}</div>
                  <div className="mt-0.5 font-mono text-[11px] text-text-mut">{item.date}</div>
                </div>
              </div>
            ))}

            <div className="mt-3 flex flex-wrap gap-2">
              {lead.status === "NOVO" && (
                <Button variant="ghost" onClick={() => onMoved?.(lead, "EM_VISITA")}>Mover p/ visita</Button>
              )}
              {lead.status === "EM_VISITA" && (
                <Button variant="ghost" onClick={() => onMoved?.(lead, "PROPOSTA")}>Mover p/ proposta</Button>
              )}
            </div>

            <ModalActions>
              <Button variant="ghost" onClick={handleContact}>Registrar contato</Button>
              <Button onClick={() => setVisitOpen(true)}>Agendar visita</Button>
            </ModalActions>
          </>
        )}
      </Modal>
      {lead && (
        <NewVisitModal
          open={visitOpen}
          onClose={() => {
            setVisitOpen(false);
            onChanged?.();
          }}
          defaultLeadId={lead.id}
          defaultPropertyId={lead.propertyId ?? undefined}
        />
      )}
    </>
  );
}
