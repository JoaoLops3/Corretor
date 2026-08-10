"use client";

import { useState, useTransition } from "react";
import { Role } from "@prisma/client";
import { Modal, ModalTitle, ModalSub, ModalActions, Field, inputClass } from "@/components/ui/modal";
import { Button } from "@/components/ui/primitives";
import { useToast } from "@/components/providers/toast-provider";
import { inviteTeamMember } from "@/lib/actions/team";

export function InviteModal({
  open,
  onClose,
  onInvited,
}: {
  open: boolean;
  onClose: () => void;
  onInvited?: () => void;
}) {
  const showToast = useToast();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("CORRETOR");

  function handleInvite() {
    startTransition(async () => {
      try {
        await inviteTeamMember({ name, email, role });
        showToast("Membro convidado. Conta criada como inativa.");
        setName("");
        setEmail("");
        onInvited?.();
        onClose();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erro ao convidar");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalTitle>Convidar para a equipe</ModalTitle>
      <ModalSub>A pessoa entra com o e-mail e a senha temporária</ModalSub>
      <Field label="Nome">
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
      </Field>
      <Field label="E-mail">
        <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@imobiliaria.com" />
      </Field>
      <Field label="Papel">
        <select className={inputClass} value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="CORRETOR">Corretor</option>
          <option value="GERENTE">Gerente</option>
        </select>
      </Field>
      <ModalActions>
        <Button variant="ghost" onClick={onClose} disabled={pending}>Cancelar</Button>
        <Button onClick={handleInvite} disabled={pending || !email.includes("@")}>
          {pending ? "Enviando…" : "Convidar"}
        </Button>
      </ModalActions>
    </Modal>
  );
}
