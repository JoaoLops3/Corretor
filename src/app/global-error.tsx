"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-paper text-text antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="mb-5 flex h-11 w-11 -rotate-4 items-center justify-center rounded-[12px] bg-brass font-display text-lg font-extrabold text-ink">
            P
          </div>
          <div className="mb-2 font-mono text-[12px] uppercase tracking-wider text-text-mut">
            Erro 500
          </div>
          <div className="mb-3 -rotate-3 rounded-[10px] border-2 border-stamp bg-stamp-soft px-4 py-1.5 font-display text-sm font-extrabold uppercase tracking-wider text-stamp">
            Falha crítica
          </div>
          <p className="mb-6 max-w-[340px] text-sm text-text-mut">
            O aplicativo encontrou um erro inesperado. Tenta recarregar a página.
          </p>
          <button
            type="button"
            onClick={reset}
            className="rounded-[10px] bg-ink px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-ink-2"
          >
            Recarregar
          </button>
          {error.digest && process.env.NODE_ENV === "development" ? (
            <p className="mt-6 max-w-[340px] break-all font-mono text-[11px] text-text-mut">
              digest: {error.digest}
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
