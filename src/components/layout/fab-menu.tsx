"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Home, Calendar, PenLine } from "lucide-react";
import { Modal } from "@/components/ui/modal";

const actions = [
  { href: "/imoveis?novo=1", label: "Cadastrar imóvel", icon: Home },
  { href: "/calendario?novo=1", label: "Novo compromisso", icon: Calendar },
  { href: "/crm?novo=1", label: "Novo lead", icon: PenLine },
];

export function FabMenu() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Ação rápida"
        className="fixed bottom-19.5 right-4.5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brass text-ink shadow-[var(--shadow-lg-brand)] transition-transform active:scale-90 active:rotate-90 md:hidden"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
      <Modal open={open} onClose={() => setOpen(false)} showHandle>
        <div className="mb-1 text-[17px] font-bold">Ação rápida</div>
        <div className="mb-4 text-[12.5px] text-text-mut">O que você quer fazer agora?</div>
        <div className="flex flex-col gap-2.5">
          {actions.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-[10px] border border-line bg-paper-2 p-3.5 text-left text-[13px] font-semibold hover:border-cyan hover:bg-cyan-soft"
              >
                <Icon size={18} className="text-cyan" />
                {a.label}
              </Link>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
