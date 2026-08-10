import { Suspense } from "react";
import { listProperties } from "@/lib/actions/properties";
import { toPropertyView } from "@/lib/property-view";
import { ImoveisClient } from "@/components/property/imoveis-client";
import { prisma } from "@/lib/prisma";

async function ImoveisData({
  searchParams,
}: {
  searchParams: Promise<{ broker?: string; novo?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const brokerParam = sp.broker || null;

  let ownerName: string | null = null;
  if (brokerParam) {
    const broker = await prisma.user.findUnique({
      where: { id: brokerParam },
      select: { id: true, name: true },
    });
    ownerName = broker?.name ?? null;
  }

  const rows = await listProperties({ brokerId: brokerParam });
  const properties = rows.map(toPropertyView);

  return (
    <ImoveisClient
      initialProperties={properties}
      openNew={sp.novo === "1"}
      viewingTeamMember={!!brokerParam}
      ownerName={ownerName}
      initialSearch={sp.q ?? ""}
    />
  );
}

export default function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<{ broker?: string; novo?: string; q?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-text-mut">Carregando imóveis…</div>}>
      <ImoveisData searchParams={searchParams} />
    </Suspense>
  );
}
