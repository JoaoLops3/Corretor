import { auth, signOut } from "@/lib/auth";
import { revokeUserSessions } from "@/lib/auth-session";

async function logoutAndRedirect(to: string) {
  try {
    const session = await auth();
    if (session?.user?.id) {
      await revokeUserSessions(session.user.id);
    }
  } catch (err) {
    console.error("[auth/logout] revoke failed", err);
  }
  await signOut({ redirectTo: to });
}

export async function POST() {
  await logoutAndRedirect("/login");
}

export async function GET() {
  await logoutAndRedirect("/login");
}
