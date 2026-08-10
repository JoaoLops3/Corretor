import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { listProperties } from "@/lib/actions/properties";
import { toPropertyView } from "@/lib/property-view";
import { ImoveisClient } from "@/components/property/imoveis-client";
import { prisma } from "@/lib/prisma";

async function ImoveisData({
  searchParams,
}: {
  searchParams: Promise<{ broker?: string; novo?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  const brokerParam = sp.broker || null;

  let ownerName: string | null = null;
  if (brokerParam) {
    const broker = await prisma.user.findUnique({ where: { id: brokerParam } });
    ownerName = broker?.name ?? null;
  }

  const rows = await listProperties({ brokerId: brokerParam || session?.user?.id });
  const properties = rows.map(toPropertyView);

  return (
    <ImoveisClient
      initialProperties={properties}
      openNew={sp.novo === "1"}
      viewingTeamMember={!!brokerParam && brokerParam !== session?.user?.id}
      ownerName={ownerName}
    />
  );
}

export default function ImoveisPage({
  searchParams,
}: {
  searchParams: Promise<{ broker?: string; novo?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-text-mut">Carregando imóveis…</div>}>
      <ImoveisData searchParams={searchParams} />
    </Suspense>
  );
}
