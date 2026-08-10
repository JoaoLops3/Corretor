"use client";

import { useState, useTransition } from "react";
import { LeadTemperature } from "@prisma/client";
import { Modal, ModalTitle, ModalActions, Field, inputClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { createLead } from "@/lib/actions/leads";

export function NewLeadModal({
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
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [interest, setInterest] = useState("");
  const [budget, setBudget] = useState("");
  const [temperature, setTemperature] = useState<LeadTemperature>("MORNO");

  function handleSubmit() {
    startTransition(async () => {
      try {
        const n = Number(String(budget).replace(/\D/g, "")) || undefined;
        await createLead({
          name: name || "Novo lead",
          phone,
          interest: interest || undefined,
          budgetMin: n,
          budgetMax: n,
          temperature,
        });
        showToast("Lead adicionado ao funil");
        setName("");
        setPhone("");
        setInterest("");
        setBudget("");
        onCreated?.();
        onClose();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erro ao criar lead");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose} showHandle>
      <ModalTitle>Novo lead</ModalTitle>
      <Field label="Nome">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do cliente" />
      </Field>
      <Field label="Telefone (WhatsApp)">
        <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 90000-0000" required />
      </Field>
      <Field label="Interesse">
        <input className={inputClass} value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="Ex: apto 2 quartos, zona sul" />
      </Field>
      <div className="mb-3 flex gap-2.5">
        <div className="flex-1">
          <Field label="Orçamento">
            <input className={inputClass} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="650000" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Temperatura">
            <select className={inputClass} value={temperature} onChange={(e) => setTemperature(e.target.value as LeadTemperature)}>
              <option value="MORNO">Morno</option>
              <option value="QUENTE">Quente</option>
              <option value="FRIO">Frio</option>
            </select>
          </Field>
        </div>
      </div>
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button onClick={handleSubmit} disabled={pending || !phone.trim()}>
          {pending ? "Salvando…" : "Adicionar lead"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
