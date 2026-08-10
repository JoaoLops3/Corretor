import { prisma } from "@/lib/prisma";

/** Invalida todos os JWTs do usuário (Credentials não tem session DB). */
export async function revokeUserSessions(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { sessionVersion: { increment: 1 } },
  });
}

export function sessionCookieNames(secure: boolean): string[] {
  const base = secure ? "__Secure-authjs.session-token" : "authjs.session-token";
  return [base, `${base}.0`, `${base}.1`, `${base}.2`];
}

export function requestHasSessionCookie(cookieStore: {
  has: (name: string) => boolean;
}): boolean {
  return (
    sessionCookieNames(false).some((n) => cookieStore.has(n)) ||
    sessionCookieNames(true).some((n) => cookieStore.has(n))
  );
}
