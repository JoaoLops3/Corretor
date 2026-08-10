import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center">
      <div className="mb-4 -rotate-3 rounded-[10px] border-2 border-stamp bg-stamp-soft px-4 py-1.5 font-display text-sm font-extrabold uppercase tracking-wider text-stamp">
        Página não encontrada
      </div>
      <div className="mb-2 font-display text-5xl font-extrabold text-ink">404</div>
      <p className="mb-6 max-w-[320px] text-sm text-text-mut">
        Esse endereço não existe ou o imóvel foi removido do mapa. Vamos te levar de volta.
      </p>
      <Link
        href="/"
        className="rounded-[10px] bg-ink px-5 py-2.5 text-[13px] font-semibold text-white shadow-[var(--shadow-sm-brand)] hover:bg-ink-2"
      >
        ← Voltar ao início
      </Link>
    </div>
  );
}
