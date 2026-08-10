"use server";

import { revalidatePath } from "next/cache";
import { LeadStatus, VisitStatus, ProposalStatus, PropertyStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isManager, requireSession } from "@/lib/permissions";
import { brokerOwnedWhere } from "@/lib/scope";
import { formatBRL } from "@/lib/types";
import { toNumber } from "@/lib/serialize";

export async function getDashboardData() {
  const session = await requireSession();
  const userId = session.user.id!;
  const teamFilter = brokerOwnedWhere(session);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const myPortfolioWhere = {
    brokerId: userId,
    status: {
      in: [
        PropertyStatus.DISPONIVEL,
        PropertyStatus.RESERVADO,
        PropertyStatus.ALUGADO,
      ],
    },
  };

  const openLeadStatus = {
    in: [LeadStatus.NOVO, LeadStatus.EM_VISITA, LeadStatus.PROPOSTA],
  };

  const [myProperties, visitsToday, openLeads, hotLeads, proposalAgg, upcomingVisits] =
    await Promise.all([
      prisma.property.count({ where: myPortfolioWhere }),
      prisma.visit.count({
        where: {
          ...teamFilter,
          scheduledAt: { gte: todayStart, lte: todayEnd },
          status: { in: [VisitStatus.AGENDADA, VisitStatus.CONFIRMADA] },
        },
      }),
      prisma.lead.count({
        where: { ...teamFilter, status: openLeadStatus },
      }),
      prisma.lead.count({
        where: {
          ...teamFilter,
          temperature: "QUENTE",
          status: openLeadStatus,
        },
      }),
      prisma.proposal.aggregate({
        where: {
          ...teamFilter,
          status: {
            in: [
              ProposalStatus.PROPOSTA,
              ProposalStatus.APROVACAO,
              ProposalStatus.DOCUMENTACAO,
              ProposalStatus.ASSINATURA,
            ],
          },
        },
        _sum: { value: true },
        _count: true,
      }),
      prisma.visit.findMany({
        where: {
          ...teamFilter,
          scheduledAt: { gte: new Date() },
          status: { in: [VisitStatus.AGENDADA, VisitStatus.CONFIRMADA] },
        },
        include: {
          property: { select: { title: true } },
          lead: { select: { name: true } },
          broker: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 2,
      }),
    ]);

  const negotiationSum = toNumber(proposalAgg._sum.value);
  const proposalCount = proposalAgg._count;
  const nextVisit = upcomingVisits[0];
  const manager = isManager(session);

  return {
    userName: session.user.name?.split(" ")[0] ?? "você",
    stats: [
      {
        label: "Meus imóveis",
        value: String(myProperties),
        sub: "carteira ativa",
        href: "/imoveis",
      },
      {
        label: manager ? "Visitas do time hoje" : "Visitas hoje",
        value: String(visitsToday),
        sub: nextVisit
          ? `próxima às ${nextVisit.scheduledAt.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}`
          : "nenhuma próxima",
        href: "/calendario",
      },
      {
        label: manager ? "Leads do time" : "Leads em aberto",
        value: String(openLeads),
        sub: `${hotLeads} quentes`,
        href: "/crm",
      },
      {
        label: "Em negociação",
        value: formatBRL(negotiationSum),
        sub: `${proposalCount} propostas`,
        href: "/propostas",
      },
    ],
    upcomingVisits: upcomingVisits.map((v) => ({
      id: v.id,
      time: v.scheduledAt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      duration: `${v.durationMinutes}min`,
      title: v.property.title,
      subtitle: `Cliente: ${v.lead.name} · com ${v.broker.name.split(" ")[0]}`,
    })),
  };
}

export async function searchGlobal(q: string) {
  const session = await requireSession();
  const query = q.trim();
  if (!query) return { properties: [], leads: [] };

  if (isManager(session) && !session.user.teamId) {
    return { properties: [], leads: [] };
  }

  const propertyScope = isManager(session)
    ? { teamId: session.user.teamId! }
    : { brokerId: session.user.id! };
  const leadScope = brokerOwnedWhere(session);

  const [properties, leads] = await Promise.all([
    prisma.property.findMany({
      where: {
        ...propertyScope,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 8,
      select: { id: true, title: true, code: true },
    }),
    prisma.lead.findMany({
      where: {
        ...leadScope,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
      },
      take: 8,
      select: { id: true, name: true, phone: true },
    }),
  ]);

  return { properties, leads };
}

export async function listUpcomingVisitNotifications() {
  const session = await requireSession();
  const now = new Date();
  const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  return prisma.visit.findMany({
    where: {
      ...brokerOwnedWhere(session),
      scheduledAt: { gte: now, lte: inTwoHours },
      status: { in: [VisitStatus.AGENDADA, VisitStatus.CONFIRMADA] },
    },
    include: {
      property: { select: { title: true } },
      lead: { select: { name: true } },
    },
    orderBy: { scheduledAt: "asc" },
    take: 10,
  });
}
