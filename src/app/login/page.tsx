import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 -rotate-4 items-center justify-center rounded-[12px] bg-brass font-display text-xl font-extrabold text-ink shadow-[var(--shadow-sm-brand)]">
            P
          </div>
          <div className="font-display text-2xl font-bold text-ink">Prancheta</div>
          <div className="mt-1 font-mono text-[12px] uppercase tracking-wider text-cyan">
            Imobiliária Horizonte
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
