import { Suspense } from "react";
import { listLeads } from "@/lib/actions/leads";
import { formatBRL } from "@/lib/types";
import { toNumberOrNull } from "@/lib/serialize";
import { CrmClient } from "@/components/crm/crm-client";

async function CrmData({ searchParams }: { searchParams: Promise<{ novo?: string }> }) {
  const sp = await searchParams;
  const leads = await listLeads();
  const mapped = leads.map((l) => {
    const min = toNumberOrNull(l.budgetMin);
    const max = toNumberOrNull(l.budgetMax);
    return {
      id: l.id,
      name: l.name,
      phone: l.phone,
      interest: l.interest ?? "",
      value:
        min != null || max != null
          ? `${min != null ? formatBRL(min) : "?"}–${max != null ? formatBRL(max) : "?"}`
          : "A definir",
      temperature: l.temperature,
      status: l.status,
      lastContactAt: l.lastContactAt?.toISOString() ?? null,
      propertyId: l.propertyId,
    };
  });
  return <CrmClient initialLeads={mapped} openNew={sp.novo === "1"} />;
}

export default function CrmPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-text-mut">Carregando CRM…</div>}>
      <CrmData searchParams={searchParams} />
    </Suspense>
  );
}
