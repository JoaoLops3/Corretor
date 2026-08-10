import type { Session } from "next-auth";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function isManager(session: Session): boolean {
  const role = session.user?.role as Role | undefined;
  return role === "ADMIN" || role === "GERENTE";
}

export function requireUserId(session: Session): string {
  const id = session.user?.id;
  if (!id) throw new Error("Não autenticado");
  return id;
}

export function requireManagerTeamId(session: Session): string {
  if (!isManager(session)) throw new Error("Sem permissão");
  const teamId = session.user?.teamId;
  if (!teamId) throw new Error("Gerente sem time");
  return teamId;
}

/** Lead / Visit / Proposal: corretor = próprio; gerente = time. */
export function brokerOwnedWhere(
  session: Session,
): { brokerId: string } | { broker: { teamId: string } } {
  const userId = requireUserId(session);
  if (isManager(session)) {
    return { broker: { teamId: requireManagerTeamId(session) } };
  }
  return { brokerId: userId };
}

/** Property: corretor = próprio; gerente = teamId. */
export function propertyScopeWhere(
  session: Session,
): { brokerId: string } | { teamId: string } {
  const userId = requireUserId(session);
  if (isManager(session)) {
    return { teamId: requireManagerTeamId(session) };
  }
  return { brokerId: userId };
}

export async function canAccessBrokerData(
  session: Session,
  brokerId: string,
): Promise<boolean> {
  const userId = session.user?.id;
  if (!userId || !brokerId) return false;
  if (userId === brokerId) return true;
  if (!isManager(session)) return false;

  const teamId = session.user?.teamId;
  if (!teamId) return false;

  const target = await prisma.user.findUnique({
    where: { id: brokerId },
    select: { teamId: true, active: true },
  });
  return !!target?.active && target.teamId === teamId;
}

export async function assertCanAccessBroker(
  session: Session,
  brokerId: string,
): Promise<void> {
  if (!(await canAccessBrokerData(session, brokerId))) {
    throw new Error("Sem permissão");
  }
}

export async function assertCanAccessProperty(
  session: Session,
  propertyId: string,
) {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { id: true, brokerId: true, teamId: true },
  });
  if (!property) throw new Error("Imóvel não encontrado");
  await assertCanAccessBroker(session, property.brokerId);
  return property;
}

export async function assertCanAccessLead(session: Session, leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, brokerId: true },
  });
  if (!lead) throw new Error("Lead não encontrado");
  await assertCanAccessBroker(session, lead.brokerId);
  return lead;
}
