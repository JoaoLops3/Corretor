"use server";

import { revalidatePath } from "next/cache";
import { LeadStatus, LeadTemperature } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessBrokerData, requireSession } from "@/lib/permissions";
import {
  assertCanAccessProperty,
  brokerOwnedWhere,
} from "@/lib/scope";

export async function listLeads() {
  const session = await requireSession();

  return prisma.lead.findMany({
    where: brokerOwnedWhere(session),
    include: {
      broker: { select: { id: true, name: true } },
      property: { select: { id: true, title: true, code: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createLead(input: {
  name: string;
  phone: string;
  interest?: string;
  budgetMin?: number;
  budgetMax?: number;
  temperature?: LeadTemperature;
  propertyId?: string;
}) {
  const session = await requireSession();
  if (!input.phone?.trim()) throw new Error("Telefone é obrigatório");

  if (input.propertyId) {
    await assertCanAccessProperty(session, input.propertyId);
  }

  const lead = await prisma.lead.create({
    data: {
      name: input.name || "Lead sem nome",
      phone: input.phone.trim(),
      interest: input.interest,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      temperature: input.temperature ?? LeadTemperature.MORNO,
      status: LeadStatus.NOVO,
      brokerId: session.user.id!,
      propertyId: input.propertyId,
    },
  });
  revalidatePath("/crm");
  revalidatePath("/");
  return { id: lead.id };
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead não encontrado");
  if (!(await canAccessBrokerData(session, lead.brokerId))) {
    throw new Error("Sem permissão");
  }

  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/crm");
  revalidatePath("/");
  return { id };
}

export async function registerLeadContact(id: string) {
  const session = await requireSession();
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead não encontrado");
  if (!(await canAccessBrokerData(session, lead.brokerId))) {
    throw new Error("Sem permissão");
  }

  await prisma.lead.update({
    where: { id },
    data: { lastContactAt: new Date() },
  });
  revalidatePath("/crm");
  return { id };
}
