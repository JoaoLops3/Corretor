"use server";

import { revalidatePath } from "next/cache";
import { VisitStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessBrokerData, requireSession } from "@/lib/permissions";
import {
  assertCanAccessLead,
  assertCanAccessProperty,
  brokerOwnedWhere,
  propertyScopeWhere,
} from "@/lib/scope";

export async function listVisits(opts?: { day?: Date }) {
  const session = await requireSession();
  const day = opts?.day ?? new Date();
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);

  return prisma.visit.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
      ...brokerOwnedWhere(session),
    },
    include: {
      property: true,
      lead: true,
      broker: { select: { id: true, name: true } },
    },
    orderBy: { scheduledAt: "asc" },
  });
}

export async function createVisit(input: {
  propertyId: string;
  leadId: string;
  scheduledAt: string;
  durationMinutes?: number;
  notes?: string;
}) {
  const session = await requireSession();
  await assertCanAccessProperty(session, input.propertyId);
  await assertCanAccessLead(session, input.leadId);

  const visit = await prisma.$transaction(async (tx) => {
    const created = await tx.visit.create({
      data: {
        propertyId: input.propertyId,
        leadId: input.leadId,
        brokerId: session.user.id!,
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes ?? 30,
        notes: input.notes,
        status: VisitStatus.AGENDADA,
      },
    });

    await tx.lead.update({
      where: { id: input.leadId },
      data: { status: "EM_VISITA", propertyId: input.propertyId },
    });

    return created;
  });

  revalidatePath("/calendario");
  revalidatePath("/crm");
  revalidatePath("/");
  return { id: visit.id };
}

export async function updateVisitStatus(id: string, status: VisitStatus) {
  const session = await requireSession();
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) throw new Error("Visita não encontrada");
  if (!(await canAccessBrokerData(session, visit.brokerId))) {
    throw new Error("Sem permissão");
  }

  await prisma.visit.update({ where: { id }, data: { status } });
  revalidatePath("/calendario");
  revalidatePath("/");
  return { id };
}

export async function listLeadsForSelect() {
  const session = await requireSession();
  return prisma.lead.findMany({
    where: brokerOwnedWhere(session),
    select: { id: true, name: true, phone: true },
    orderBy: { name: "asc" },
  });
}

export async function listPropertiesForSelect() {
  const session = await requireSession();
  return prisma.property.findMany({
    where: propertyScopeWhere(session),
    select: {
      id: true,
      title: true,
      code: true,
      lat: true,
      lng: true,
      addressStreet: true,
      addressDistrict: true,
    },
    orderBy: { title: "asc" },
  });
}
