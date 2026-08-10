import { auth, signOut } from "@/lib/auth";
import { revokeUserSessions } from "@/lib/auth-session";

/** Logout completo: revoga JWTs no banco e limpa cookie. */
export async function POST() {
  const session = await auth();
  if (session?.user?.id) {
    await revokeUserSessions(session.user.id);
  }
  await signOut({ redirectTo: "/login" });
}

export async function GET() {
  return POST();
}
