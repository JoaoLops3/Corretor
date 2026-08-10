import { Suspense } from "react";
import { listProposals } from "@/lib/actions/proposals";
import { formatBRL, proposalSteps } from "@/lib/types";
import { toNumber } from "@/lib/serialize";
import { PropostasClient } from "@/components/proposals/propostas-client";

async function PropostasData() {
  const rows = await listProposals();
  const proposals = rows.map((p) => {
    const stepIdx = Math.max(0, proposalSteps.indexOf(p.status as (typeof proposalSteps)[number]));
    const valueNumber = toNumber(p.value);
    return {
      id: p.id,
      title: p.property.title,
      client: p.lead.name,
      value: formatBRL(valueNumber),
      valueNumber,
      status: p.status,
      step: Math.min(3, stepIdx),
      propertyId: p.propertyId,
      leadId: p.leadId,
    };
  });
  return <PropostasClient initialProposals={proposals} />;
}

export default function PropostasPage() {
  return (
    <Suspense fallback={<div className="p-6 text-text-mut">Carregando propostas…</div>}>
      <PropostasData />
    </Suspense>
  );
}
