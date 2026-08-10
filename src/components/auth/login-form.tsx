"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(() =>
    searchParams.get("reason") === "expired"
      ? "Sua sessão expirou. Faça login novamente."
      : "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const next = searchParams.get("callbackUrl");
      const redirectTo =
        next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login")
          ? next
          : "/";

      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        redirectTo,
      });

      if (!res || res.error || res.ok === false) {
        setError(
          res?.error === "Configuration"
            ? "Falha na configuração do login."
            : "E-mail ou senha incorretos.",
        );
        return;
      }

      window.location.assign(redirectTo);
    } catch {
      setError("Não foi possível entrar. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[380px]">
      <div className="mb-1.5 block text-xs font-semibold text-text-mut">E-mail</div>
      <input
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3.5 w-full rounded-[9px] border border-line bg-paper px-3.5 py-3 text-[14px] outline-none transition-colors focus:border-cyan focus:bg-white"
        placeholder="voce@imobiliaria.com"
      />
      <div className="mb-1.5 block text-xs font-semibold text-text-mut">Senha</div>
      <input
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full rounded-[9px] border border-line bg-paper px-3.5 py-3 text-[14px] outline-none transition-colors focus:border-cyan focus:bg-white"
        placeholder="••••••••"
      />

      {error && (
        <div role="alert" className="mb-4 rounded-[9px] bg-stamp-soft px-3.5 py-2.5 text-[13px] font-medium text-stamp">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[10px] bg-ink py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-sm-brand)] transition-colors hover:bg-ink-2 disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
