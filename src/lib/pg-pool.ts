import { Pool } from "pg";

/**
 * `pg` trata sslmode=require como alias de verify-full e emite warning.
 * Com uselibpqcompat=true, require = criptografia sem verificar CA
 * (o que Prisma Postgres / Neon tipicamente precisam).
 */
export function normalizeDatabaseUrl(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const mode = url.searchParams.get("sslmode");
    if (
      mode &&
      ["prefer", "require", "verify-ca"].includes(mode) &&
      url.searchParams.get("uselibpqcompat") !== "true"
    ) {
      url.searchParams.set("uselibpqcompat", "true");
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}

export function createPgPool(connectionString: string): Pool {
  const normalized = normalizeDatabaseUrl(connectionString);
  const wantsSsl =
    /[?&]sslmode=(prefer|require|verify-ca|verify-full|no-verify)/i.test(
      connectionString,
    ) || /[?&]uselibpqcompat=true/i.test(normalized);

  return new Pool({
    connectionString: normalized,
    // Mantém o comportamento atual do projeto com hosts gerenciados
    ssl: wantsSsl ? { rejectUnauthorized: false } : undefined,
  });
}
