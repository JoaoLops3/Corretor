"use client";

import Link from "next/link";

type ErrorStateProps = {
  code?: string;
  title: string;
  description: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryHref?: string;
  secondaryLabel?: string;
  digest?: string;
  compact?: boolean;
};

export function ErrorState({
  code,
  title,
  description,
  primaryLabel = "Tentar novamente",
  onPrimary,
  secondaryHref = "/",
  secondaryLabel = "Voltar ao início",
  digest,
  compact = false,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center animate-fade-in ${
        compact ? "px-4 py-16" : "min-h-screen bg-paper p-6"
      }`}
    >
      <div className="mb-5 flex h-11 w-11 -rotate-4 items-center justify-center rounded-[12px] bg-brass font-display text-lg font-extrabold text-ink shadow-[var(--shadow-sm-brand)]">
        P
      </div>
      {code ? (
        <div className="mb-2 font-mono text-[12px] uppercase tracking-wider text-text-mut">
          Erro {code}
        </div>
      ) : null}
      <div className="mb-3 -rotate-3 rounded-[10px] border-2 border-stamp bg-stamp-soft px-4 py-1.5 font-display text-sm font-extrabold uppercase tracking-wider text-stamp">
        {title}
      </div>
      <p className="mb-6 max-w-[340px] text-sm leading-relaxed text-text-mut">{description}</p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {onPrimary ? (
          <button
            type="button"
            onClick={onPrimary}
            className="rounded-[10px] bg-ink px-5 py-2.5 text-[13px] font-semibold text-white shadow-[var(--shadow-sm-brand)] hover:bg-ink-2"
          >
            {primaryLabel}
          </button>
        ) : null}
        <Link
          href={secondaryHref}
          className="rounded-[10px] border border-line bg-paper-2 px-5 py-2.5 text-[13px] font-semibold text-text hover:border-cyan hover:bg-cyan-soft"
        >
          {secondaryLabel}
        </Link>
      </div>
      {digest && process.env.NODE_ENV === "development" ? (
        <p className="mt-6 max-w-[340px] break-all font-mono text-[11px] text-text-mut">
          digest: {digest}
        </p>
      ) : null}
    </div>
  );
}
