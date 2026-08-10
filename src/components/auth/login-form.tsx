"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <form onSubmit={handleSubmit} className="w-full">
      <label className="mb-1.5 block text-xs font-semibold text-text-mut" htmlFor="login-email">
        E-mail
      </label>
      <input
        id="login-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="field-input mb-3.5"
        placeholder="voce@imobiliaria.com"
      />
      <label className="mb-1.5 block text-xs font-semibold text-text-mut" htmlFor="login-password">
        Senha
      </label>
      <div className="relative mb-4">
        <input
          id="login-password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input pr-11"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          className="absolute top-1/2 right-2.5 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-[7px] text-text-mut hover:bg-paper hover:text-ink"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-[9px] border border-stamp/20 bg-stamp-soft px-3.5 py-2.5 text-[13px] font-medium text-stamp"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-[10px] bg-ink py-3 text-[14px] font-semibold text-white shadow-[var(--shadow-sm-brand)] transition-[background-color,transform] duration-150 hover:bg-ink-2 active:scale-[0.98] disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
