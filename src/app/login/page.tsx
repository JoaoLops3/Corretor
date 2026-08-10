import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative w-full max-w-[380px] animate-fade-in">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 -rotate-4 items-center justify-center rounded-[12px] bg-brass font-display text-xl font-extrabold text-ink shadow-[var(--shadow-sm-brand)]">
            P
          </div>
          <div className="font-display text-[1.75rem] font-extrabold text-ink">Prancheta</div>
          <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.1em] text-cyan">
            Imobiliária Horizonte
          </div>
          <p className="mt-2.5 max-w-[26ch] text-[13px] leading-snug text-text-mut">
            O dia a dia da corretagem, num só lugar.
          </p>
        </div>
        <div className="rounded-[14px] border border-line bg-paper-2 p-5 shadow-[var(--shadow-sm-brand)]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
