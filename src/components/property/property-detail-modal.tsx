"use client";

import Image from "next/image";
import { useState } from "react";
import { PropertyStatus } from "@prisma/client";
import { Modal, ModalSub, ModalActions } from "@/components/ui/modal";
import { Button, StatusStamp, TempTag } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { changePropertyStatus } from "@/lib/actions/properties";
import { propertyStatusLabels } from "@/lib/types";
import type { PropertyView } from "@/lib/property-view";
import { NewVisitModal } from "@/components/calendar/new-visit-modal";

const statusCycle: PropertyStatus[] = ["DISPONIVEL", "RESERVADO", "VENDIDO"];

export function PropertyDetailModal({
  property,
  onClose,
  onStatusChange,
  onEdit,
}: {
  property: PropertyView | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: PropertyStatus) => void;
  onEdit?: (p: PropertyView) => void;
}) {
  const showToast = useToast();
  const [visitOpen, setVisitOpen] = useState(false);

  async function cycleStatus() {
    if (!property) return;
    const next = statusCycle[(statusCycle.indexOf(property.status) + 1) % statusCycle.length];
    try {
      await changePropertyStatus(property.id, next);
      onStatusChange?.(property.id, next);
      showToast(`Status alterado para ${propertyStatusLabels[next]}`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Erro ao alterar status");
    }
  }

  return (
    <>
      <Modal open={!!property} onClose={onClose}>
        {property && (
          <>
            <div className="relative mb-3.5 h-45 overflow-hidden rounded-[14px]">
              <Image
                src={property.photoUrl}
                alt={property.title}
                fill
                className="object-cover"
                unoptimized={property.photoUrl.includes("picsum")}
              />
            </div>
            <div className="mb-1.5 flex flex-wrap items-start gap-2 pr-10">
              <div className="min-w-0 flex-1 text-[17px] font-bold">{property.title}</div>
              <StatusStamp status={property.status} onClick={cycleStatus} />
            </div>
            <ModalSub>
              {property.address} · <span className="font-mono">{property.code}</span>
            </ModalSub>
            <TempTag temperature={property.temperature} />
            <div className="mt-3 font-mono text-xl font-semibold text-ink">{property.price}</div>
            <ModalActions>
              <Button variant="ghost" onClick={() => setVisitOpen(true)}>Agendar visita</Button>
              <Button onClick={() => property && onEdit?.(property)}>Editar imóvel</Button>
            </ModalActions>
          </>
        )}
      </Modal>
      {property && (
        <NewVisitModal
          open={visitOpen}
          onClose={() => setVisitOpen(false)}
          defaultPropertyId={property.id}
        />
      )}
    </>
  );
}
