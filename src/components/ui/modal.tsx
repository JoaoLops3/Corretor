"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
  maxWidth?: string;
}

export function Modal({ open, onClose, children, showHandle, maxWidth = "max-w-[480px] sm:max-w-[520px]" }: ModalProps) {
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && boxRef.current) {
        const focusable = boxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    boxRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(16,30,48,0.55)] backdrop-blur-[2px] sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={boxRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidth} max-h-[88vh] overflow-y-auto rounded-t-[18px] bg-paper-2 p-5 shadow-[var(--shadow-lg-brand)] animate-slide-up sm:rounded-[18px]`}
      >
        {showHandle && <span className="mx-auto mb-3.5 block h-1 w-9 rounded-full bg-line" />}
        <button
          onClick={onClose}
          aria-label="Fechar"
          className="absolute top-4 right-4 flex h-[30px] w-[30px] items-center justify-center rounded-[8px] border border-line bg-paper text-text-mut transition-colors hover:bg-cyan-soft hover:text-ink"
        >
          <X size={14} />
        </button>
        {children}
      </div>
    </div>
  );
}

export function ModalTitle({ children }: { children: React.ReactNode }) {
  return <div className="mb-1 pr-10 font-display text-[17px] font-bold text-ink">{children}</div>;
}

export function ModalSub({ children }: { children: React.ReactNode }) {
  return <div className="mb-4 text-[12.5px] leading-snug text-text-mut">{children}</div>;
}

export function ModalActions({ children }: { children: React.ReactNode }) {
  return <div className="mt-4.5 flex gap-2.5 [&>*]:flex-1 [&>*]:justify-center">{children}</div>;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="mb-1.5 block text-xs font-semibold text-text-mut">{label}</label>
      {children}
    </div>
  );
}

export const inputClass = "field-input py-2.5 text-[13.5px]";
