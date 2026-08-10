import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canAccessBrokerData,
  isManager,
} from "@/lib/scope";

export { canAccessBrokerData, isManager };

export async function requireSession() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    // JWT inativo (active=false) ainda pode existir no cookie
    if (session) redirect("/api/auth/invalidate-session");
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, active: true },
  });
  if (!user || !user.active) {
    redirect("/api/auth/invalidate-session");
  }

  return session;
}
