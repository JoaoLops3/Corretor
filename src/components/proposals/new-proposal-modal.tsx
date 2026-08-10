"use client";

import { useEffect, useState, useTransition } from "react";
import { Modal, ModalTitle, ModalActions, Field, inputClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { createProposal } from "@/lib/actions/proposals";
import { listLeadsForSelect, listPropertiesForSelect } from "@/lib/actions/visits";

export function NewProposalModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const [leads, setLeads] = useState<{ id: string; name: string }[]>([]);
  const [properties, setProperties] = useState<{ id: string; title: string; code: string }[]>([]);
  const [leadId, setLeadId] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!open) return;
    Promise.all([listLeadsForSelect(), listPropertiesForSelect()]).then(([l, p]) => {
      setLeads(l);
      setProperties(p);
      if (l[0]) setLeadId(l[0].id);
      if (p[0]) setPropertyId(p[0].id);
    });
  }, [open]);

  function handleSubmit() {
    startTransition(async () => {
      try {
        await createProposal({
          leadId,
          propertyId,
          value: Number(String(value).replace(/\D/g, "")) || 0,
        });
        showToast("Proposta criada");
        setValue("");
        onCreated?.();
        onClose();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erro ao criar proposta");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} showHandle>
      <ModalTitle>Nova proposta</ModalTitle>
      <Field label="Imóvel">
        <select className={inputClass} value={propertyId} onChange={(e) => setPropertyId(e.target.value)}>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>{p.title} (#{p.code})</option>
          ))}
        </select>
      </Field>
      <Field label="Cliente">
        <select className={inputClass} value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          {leads.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Valor da proposta">
        <input className={inputClass} value={value} onChange={(e) => setValue(e.target.value)} placeholder="1780000" />
      </Field>
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={pending || !leadId || !propertyId}>
          {pending ? "Salvando…" : "Criar proposta"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
