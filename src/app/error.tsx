"use client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center">
      <div className="mb-4 -rotate-3 rounded-[10px] border-2 border-stamp bg-stamp-soft px-4 py-1.5 font-display text-sm font-extrabold uppercase tracking-wider text-stamp">
        Algo deu errado
      </div>
      <p className="mb-6 max-w-[320px] text-sm text-text-mut">
        Não foi possível carregar esta tela. Tenta de novo — se persistir, avisa o time técnico.
      </p>
      <button
        onClick={reset}
        className="rounded-[10px] bg-ink px-5 py-2.5 text-[13px] font-semibold text-white shadow-[var(--shadow-sm-brand)] hover:bg-ink-2"
      >
        Tentar novamente
      </button>
    </div>
  );
}
