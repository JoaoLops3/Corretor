"use client";

import { Modal, ModalTitle, ModalSub, ModalActions } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import type { ProposalView } from "@/components/proposals/propostas-client";

const steps = ["Proposta", "Aprovação", "Documentação", "Assinatura"];

export function ProposalDetailModal({
  proposal,
  onClose,
  onAdvance,
}: {
  proposal: ProposalView | null;
  onClose: () => void;
  onAdvance: (id: string) => void;
}) {
  return (
    <Modal open={!!proposal} onClose={onClose}>
      {proposal && (
        <>
          <ModalTitle>{proposal.title}</ModalTitle>
          <ModalSub>
            {proposal.client} · <span className="font-mono">{proposal.value}</span>
          </ModalSub>
          <div className="mb-1.5 mt-4 flex justify-between font-mono text-[10px] text-text-mut">
            {steps.map((s, i) => (
              <span key={s} className={i === proposal.step ? "font-bold text-cyan" : ""}>
                {s}
              </span>
            ))}
          </div>
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-paper">
            <div className="h-full bg-cyan transition-all" style={{ width: `${(proposal.step + 1) * 25}%` }} />
          </div>
          <ModalActions>
            <Button onClick={() => onAdvance(proposal.id)}>Avançar etapa</Button>
          </ModalActions>
        </>
      )}
    </Modal>
  );
}
