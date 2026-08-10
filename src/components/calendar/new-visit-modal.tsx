"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal, ModalTitle, ModalSub, ModalActions, Field, inputClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { createVisit, listLeadsForSelect, listPropertiesForSelect } from "@/lib/actions/visits";

export function NewVisitModal({
  open,
  onClose,
  defaultPropertyId,
  defaultLeadId,
}: {
  open: boolean;
  onClose: () => void;
  defaultPropertyId?: string;
  defaultLeadId?: string;
}) {
  const router = useRouter();
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const [leads, setLeads] = useState<{ id: string; name: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; title: string; code: string }[]>([]);
  const [leadId, setLeadId] = useState(defaultLeadId ?? "");
  const [propertyId, setPropertyId] = useState(defaultPropertyId ?? "");
  const [when, setWhen] = useState("");
  const [duration, setDuration] = useState("30");

  useEffect(() => {
    if (!open) return;
    setLeadId(defaultLeadId ?? "");
    setPropertyId(defaultPropertyId ?? "");
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    setWhen(d.toISOString().slice(0, 16));
    Promise.all([listLeadsForSelect(), listPropertiesForSelect()]).then(([l, p]) => {
      setLeads(l);
      setProperties(p);
      if (!defaultLeadId && l[0]) setLeadId(l[0].id);
      if (!defaultPropertyId && p[0]) setPropertyId(p[0].id);
    });
  }, [open, defaultLeadId, defaultPropertyId]);

  function handleSubmit() {
    startTransition(async () => {
      try {
        await createVisit({
          leadId,
          propertyId,
          scheduledAt: new Date(when).toISOString(),
          durationMinutes: Number(duration) || 30,
        });
        showToast("Visita agendada");
        router.refresh();
        onClose();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erro ao agendar");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalTitle>Agendar visita</ModalTitle>
      <ModalSub>Escolha cliente, imóvel e horário</ModalSub>
      <Field label="Cliente">
        <select className={inputClass} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Imóvel">
        <select className={inputClass} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title} (#{p.code})</option>
          ))}
        </select>
      </Field>
      <div className="mb-3 flex gap-2.5">
        <div className="flex-[2]">
          <Field label="Data e hora">
            <input type="datetime-local" className={inputClass} value={when} onChange={(e) => setWhen(e.target.value)} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Duração (min)">
            <input className={inputClass} value={duration} onChange={(e) => setDuration(e.target.value)} />
          </Field>
        </div>
      </div>
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={pending || !leadId || !propertyId}>
          {pending ? "Salvando…" : "Agendar"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
