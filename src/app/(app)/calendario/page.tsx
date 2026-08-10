import { Suspense } from "react";
import { listVisits, listPropertiesForSelect } from "@/lib/actions/visits";
import { visitStatusLabels } from "@/lib/types";
import { CalendarioClient } from "@/components/calendar/calendario-client";

async function CalendarioData({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string; day?: string }>;
}) {
  const sp = await searchParams;
  const day = sp.day ? new Date(sp.day + "T12:00:00") : new Date();
  const visits = await listVisits({ day });
  const properties = await listPropertiesForSelect();

  const mapped = visits.map((v) => ({
    id: v.id,
    time: v.scheduledAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    duration: `${v.durationMinutes}min`,
    title: v.property.title,
    subtitle: `Cliente: ${v.lead.name} · com ${v.broker.name.split(" ")[0]}`,
    status: v.status,
    statusLabel: visitStatusLabels[v.status],
    notes: v.notes,
    propertyId: v.propertyId,
    leadId: v.leadId,
    scheduledAt: v.scheduledAt.toISOString(),
    lat: v.property.lat,
    lng: v.property.lng,
    address: `${v.property.addressStreet}${v.property.addressNumber ? `, ${v.property.addressNumber}` : ""} — ${v.property.addressDistrict}`,
  }));

  const stops = mapped
    .filter((v) => v.lat != null && v.lng != null)
    .map((v) => ({
      id: v.id,
      label: v.title,
      address: v.address,
      lat: v.lat as number,
      lng: v.lng as number,
      time: v.time,
      duration: v.duration,
    }));

  // fallback stops from properties with coords if no visits have coords
  const routeStops =
    stops.length > 0
      ? stops
      : properties
          .filter((p) => p.lat != null && p.lng != null)
          .slice(0, 5)
          .map((p) => ({
            id: p.id,
            label: p.title,
            address: `${p.addressStreet} — ${p.addressDistrict}`,
            lat: p.lat as number,
            lng: p.lng as number,
            time: "--:--",
            duration: "30min",
          }));

  return (
    <CalendarioClient
      initialVisits={mapped}
      routeStops={routeStops}
      openNew={sp.novo === "1"}
      initialDay={day.toISOString().slice(0, 10)}
    />
  );
}

export default function CalendarioPage({
  searchParams,
}: {
  searchParams: Promise<{ novo?: string; day?: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-text-mut">Carregando calendário…</div>}>
      <CalendarioData searchParams={searchParams} />
    </Suspense>
  );
}
