import type { Prisma, Role } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export function isManager(session: Session): boolean {
  const role = session.user?.role as Role | undefined;
  return role === "ADMIN" || role === "GERENTE";
}

/** Fail-closed: gerente sem time não vê nada de ninguém. */
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

/**
 * Filtro para Lead / Visit / Proposal (relação broker → team).
 * Corretor: só o dele. Gerente: só o time.
 */
export function brokerOwnedWhere(
  session: Session,
): { brokerId: string } | { broker: { teamId: string } } {
  const userId = requireUserId(session);
  if (isManager(session)) {
    return { broker: { teamId: requireManagerTeamId(session) } };
  }
  return { brokerId: userId };
}

/**
 * Filtro para Property (tem teamId direto).
 * Para listagens de time inteiro (selects, busca).
 */
export function propertyScopeWhere(
  session: Session,
): { brokerId: string } | { teamId: string } {
  const userId = requireUserId(session);
  if (isManager(session)) {
    return { teamId: requireManagerTeamId(session) };
  }
  return { brokerId: userId };
}

/** Corretor só acessa o próprio; gerente só se o alvo for do mesmo time. */
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

/** Garante que property/lead existem e estão no escopo do usuário. */
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

export type BrokerOwnedWhere = ReturnType<typeof brokerOwnedWhere>;
export type PropertyScopeWhere = ReturnType<typeof propertyScopeWhere>;

// tipagem auxiliar para spreads Prisma
export type LeadWhere = Prisma.LeadWhereInput;
export type VisitWhere = Prisma.VisitWhereInput;
export type ProposalWhere = Prisma.ProposalWhereInput;
export type PropertyWhere = Prisma.PropertyWhereInput;
