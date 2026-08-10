"use client";

import { VisitStatus } from "@prisma/client";
import { Modal, ModalTitle, ModalSub, ModalActions } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { updateVisitStatus } from "@/lib/actions/visits";
import type { VisitView } from "@/components/calendar/calendario-client";

export function CompromissoModal({
  visit,
  onClose,
  onChanged,
}: {
  visit: VisitView | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const showToast = useToast();

  async function setStatus(status: VisitStatus, label: string) {
    if (!visit) return;
    try {
      await updateVisitStatus(visit.id, status);
      showToast(label);
      onChanged?.();
      onClose();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao atualizar");
    }
  }

  return (
    <Modal open={!!visit} onClose={onClose}>
      {visit && (
        <>
          <ModalTitle>{visit.title}</ModalTitle>
          <ModalSub>
            {visit.subtitle} · {visit.time} ({visit.duration})
          </ModalSub>
          <div className="mt-3 rounded-[9px] border border-line bg-paper p-3 text-[13px]">
            <div className="font-semibold">Status: {visit.statusLabel}</div>
            {visit.notes && <div className="mt-1 text-text-mut">{visit.notes}</div>}
            <div className="mt-1 text-text-mut">{visit.address}</div>
          </div>
          <ModalActions>
            <Button variant="ghost" onClick={() => setStatus("CANCELADA", "Visita cancelada")}>
              Cancelar
            </Button>
            <Button onClick={() => setStatus("CONFIRMADA", "Visita confirmada")}>Confirmar</Button>
          </ModalActions>
        </>
      )}
    </Modal>
  );
}
