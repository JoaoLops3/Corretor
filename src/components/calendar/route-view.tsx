"use client";

import { useEffect, useState } from "react";
import { GripVertical, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { buildGoogleMapsNavigationUrl, RouteStopInput } from "@/lib/google-maps";

interface Stop extends RouteStopInput {
  time: string;
  duration: string;
}

export function RouteView({
  initialStops = [],
}: {
  initialStops?: Stop[];
}) {
  const [stops, setStops] = useState<Stop[]>(initialStops);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"google" | "simulado" | null>(null);
  const [legs, setLegs] = useState<{ distanceText: string; durationText: string }[]>([]);
  const showToast = useToast();

  useEffect(() => {
    setStops(initialStops);
  }, [initialStops]);

  async function reorderRoute() {
    setLoading(true);
    try {
      const res = await fetch("/api/routes/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stops: stops.map(({ id, label, address, lat, lng }) => ({ id, label, address, lat, lng })) }),
      });
      if (!res.ok) throw new Error("Falha na otimização");
      const data = await res.json();

      const reordered = data.orderedStopIds
        .map((id: string) => stops.find((s) => s.id === id))
        .filter(Boolean) as Stop[];

      setStops(reordered);
      setLegs(data.legs);
      setSource(data.source);
      showToast(
        data.source === "google"
          ? "Roteiro reordenado pelo Google Maps"
          : "Roteiro reordenado (modo simulado — configure GOOGLE_MAPS_API_KEY pra usar o Google de verdade)"
      );
    } catch {
      showToast("Não consegui calcular a rota agora");
    } finally {
      setLoading(false);
    }
  }

  function openNavigation() {
    const url = buildGoogleMapsNavigationUrl(stops);
    window.open(url, "_blank");
  }

  return (
    <div>
      {source && (
        <div className="mb-3 rounded-[9px] border border-line bg-paper px-3 py-2 text-[11.5px] text-text-mut">
          {source === "google"
            ? "✓ Ordem calculada pela Directions API do Google Maps"
            : "⚠ Modo simulado — sem GOOGLE_MAPS_API_KEY configurada no .env"}
        </div>
      )}

      {stops.length === 0 ? (
        <div className="rounded-[14px] border border-dashed border-line py-8 text-center text-text-mut">
          Sem paradas com coordenadas neste dia
        </div>
      ) : (
      <div className={`transition-opacity ${loading ? "opacity-30" : "opacity-100"}`}>
        {stops.map((stop, idx) => (
          <div key={stop.id}>
            <div className="flex gap-3 pb-5.5">
              <div className="flex w-6.5 flex-shrink-0 flex-col items-center">
                <div
                  className={`flex h-6.5 w-6.5 flex-shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold ${
                    idx === 0 ? "bg-brass text-ink" : "bg-ink text-white"
                  }`}
                >
                  {idx + 1}
                </div>
                {idx < stops.length - 1 && <div className="my-1 min-h-5 w-0.5 flex-1 bg-line" />}
              </div>
              <div className="flex-1 rounded-xl border border-line bg-paper-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[13.5px] font-bold">{stop.label}</div>
                    <div className="mt-0.5 text-xs text-text-mut">{stop.address}</div>
                  </div>
                  <div className="whitespace-nowrap font-mono text-xs font-semibold text-ink">{stop.time}</div>
                  <GripVertical size={16} className="ml-auto flex-shrink-0 cursor-grab self-center text-text-mut" />
                </div>
                <div className="mt-2 flex gap-1.5">
                  <span className="rounded-full border border-line bg-paper px-2 py-0.5 text-[11px] text-text-mut">{stop.duration}</span>
                </div>
              </div>
            </div>
            {idx < stops.length - 1 && (
              <div className="mb-1.5 ml-9.5 flex items-center gap-1.5 font-mono text-[11px] text-text-mut">
                {legs[idx] ? `↓ ${legs[idx].distanceText} · ~${legs[idx].durationText}` : "↓ Reordenar para calcular"}
              </div>
            )}
          </div>
        ))}
      </div>
      )}

      {stops.length > 0 && (
      <div className="mt-4 flex gap-2">
        <Button variant="ghost" className="flex-1 justify-center" onClick={openNavigation}>
          🗺️ Abrir no Google Maps
        </Button>
        <Button className="flex-1 justify-center" onClick={reorderRoute} disabled={loading}>
          {loading ? <Loader2 size={15} className="animate-spin" /> : "Reordenar automaticamente"}
        </Button>
      </div>
      )}
    </div>
  );
}
