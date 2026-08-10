"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/primitives";
import { NewProposalModal } from "@/components/proposals/new-proposal-modal";
import { ProposalDetailModal } from "@/components/proposals/proposal-detail-modal";
import { advanceProposal } from "@/lib/actions/proposals";
import { useToast } from "@/components/providers/toast-provider";
import type { ProposalStatus } from "@prisma/client";

const steps = ["Proposta", "Aprovação", "Documentação", "Assinatura"];

export type ProposalView = {
  id: string;
  title: string;
  client: string;
  value: string;
  valueNumber: number;
  status: ProposalStatus;
  step: number;
  propertyId: string;
  leadId: string;
};

export function PropostasClient({ initialProposals }: { initialProposals: ProposalView[] }) {
  const router = useRouter();
  const showToast = useToast();
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<ProposalView | null>(null);

  async function handleAdvance(id: string) {
    try {
      await advanceProposal(id);
      showToast("Etapa avançada");
      setSelected(null);
      router.refresh();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao avançar");
    }
  }

  return (
    <section className="animate-fade-in">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-2.5">
        <div>
          <span className="page-kicker">{initialProposals.length} em andamento</span>
          <h1 className="page-title">Propostas / Contratos</h1>
        </div>
        <Button onClick={() => setNewOpen(true)}>Nova proposta</Button>
      </div>

      {initialProposals.map((p) => (
        <button
          key={p.id}
          onClick={() => setSelected(p)}
            className="mb-2.5 flex w-full flex-col gap-2 rounded-[14px] border border-line bg-paper-2 p-3.5 text-left transition-[box-shadow,border-color] duration-150 hover:border-cyan/35 hover:shadow-[var(--shadow-sm-brand)]"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[13.5px] font-bold">{p.title}</div>
              <div className="mt-0.5 text-xs text-text-mut">{p.client}</div>
            </div>
            <div className="font-mono text-sm font-bold">{p.value}</div>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-paper">
            <div className="h-full bg-cyan transition-all" style={{ width: `${(p.step + 1) * 25}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[11px] text-text-mut">
            {steps.map((s, i) => (
              <span key={s} className={i === p.step ? "font-semibold text-cyan" : ""}>
                {s}
              </span>
            ))}
          </div>
        </button>
      ))}

      <NewProposalModal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        onCreated={() => router.refresh()}
      />
      <ProposalDetailModal
        proposal={selected}
        onClose={() => setSelected(null)}
        onAdvance={handleAdvance}
      />
    </section>
  );
}
