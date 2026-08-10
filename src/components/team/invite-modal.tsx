"use client";

import { useState, useTransition } from "react";
import { Role } from "@prisma/client";
import { Copy, Check } from "lucide-react";
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
  const [created, setCreated] = useState<{ email: string; temporaryPassword: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);

  function resetForm() {
    setName("");
    setEmail("");
    setRole("CORRETOR");
    setCreated(null);
    setCopied(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleInvite() {
    startTransition(async () => {
      try {
        const result = await inviteTeamMember({ name, email, role });
        setCreated({
          email: result.email,
          temporaryPassword: result.temporaryPassword,
        });
        showToast("Membro criado. Copie a senha temporária agora.");
        onInvited?.();
      } catch (e) {
        showToast(e instanceof Error ? e.message : "Erro ao convidar");
      }
    });
  }

  async function copyPassword() {
    if (!created) return;
    await navigator.clipboard.writeText(created.temporaryPassword);
    setCopied(true);
    showToast("Senha copiada");
  }

  return (
    <Modal open={open} onClose={handleClose}>
      {!created ? (
        <>
          <ModalTitle>Convidar para a equipe</ModalTitle>
          <ModalSub>Gera uma senha temporária — mostre só uma vez ao convidado</ModalSub>
          <Field label="Nome">
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome completo"
            />
          </Field>
          <Field label="E-mail">
            <input
              className={inputClass}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@imobiliaria.com"
            />
          </Field>
          <Field label="Papel">
            <select
              className={inputClass}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="CORRETOR">Corretor</option>
              <option value="GERENTE">Gerente</option>
            </select>
          </Field>
          <ModalActions>
            <Button variant="ghost" onClick={handleClose} disabled={pending}>
              Cancelar
            </Button>
            <Button onClick={handleInvite} disabled={pending || !email.includes("@")}>
              {pending ? "Criando…" : "Convidar"}
            </Button>
          </ModalActions>
        </>
      ) : (
        <>
          <ModalTitle>Conta criada</ModalTitle>
          <ModalSub>Guarde a senha — ela não será mostrada de novo</ModalSub>
          <Field label="E-mail">
            <input className={inputClass} value={created.email} readOnly />
          </Field>
          <Field label="Senha temporária">
            <div className="flex gap-2">
              <input
                className={`${inputClass} font-mono`}
                value={created.temporaryPassword}
                readOnly
              />
              <Button variant="ghost" type="button" onClick={copyPassword} aria-label="Copiar senha">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
          </Field>
          <ModalActions>
            <Button onClick={handleClose}>Concluir</Button>
          </ModalActions>
        </>
      )}
    </Modal>
  );
}
