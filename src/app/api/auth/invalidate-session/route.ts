import { auth, signOut } from "@/lib/auth";
import { revokeUserSessions } from "@/lib/auth-session";

/** Limpa cookie órfão / JWT revogado. Server Components não podem setar cookies. */
export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.id) {
      await revokeUserSessions(session.user.id);
    }
  } catch (err) {
    console.error("[auth/invalidate-session] revoke failed", err);
  }
  await signOut({ redirectTo: "/login?reason=expired" });
}
