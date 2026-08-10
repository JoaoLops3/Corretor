"use server";

import { revalidatePath } from "next/cache";
import { ProposalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canAccessBrokerData, requireSession } from "@/lib/permissions";
import {
  assertCanAccessLead,
  assertCanAccessProperty,
  brokerOwnedWhere,
} from "@/lib/scope";
import { proposalSteps } from "@/lib/types";

export async function listProposals() {
  const session = await requireSession();

  return prisma.proposal.findMany({
    where: brokerOwnedWhere(session),
    include: {
      property: { select: { id: true, title: true, code: true } },
      lead: { select: { id: true, name: true } },
      broker: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createProposal(input: {
  propertyId: string;
  leadId: string;
  value: number;
}) {
  const session = await requireSession();
  if (!input.propertyId || !input.leadId) {
    throw new Error("Selecione imóvel e cliente");
  }

  await assertCanAccessProperty(session, input.propertyId);
  await assertCanAccessLead(session, input.leadId);

  const proposal = await prisma.$transaction(async (tx) => {
    const created = await tx.proposal.create({
      data: {
        propertyId: input.propertyId,
        leadId: input.leadId,
        value: input.value,
        status: ProposalStatus.PROPOSTA,
        brokerId: session.user.id!,
        statusHistory: {
          create: [{ status: ProposalStatus.PROPOSTA, changedBy: session.user.id }],
        },
      },
    });

    await tx.lead.update({
      where: { id: input.leadId },
      data: { status: "PROPOSTA", propertyId: input.propertyId },
    });

    return created;
  });

  revalidatePath("/propostas");
  revalidatePath("/crm");
  revalidatePath("/");
  return { id: proposal.id };
}

export async function advanceProposal(id: string) {
  const session = await requireSession();
  const proposal = await prisma.proposal.findUnique({ where: { id } });
  if (!proposal) throw new Error("Proposta não encontrada");
  if (!(await canAccessBrokerData(session, proposal.brokerId))) {
    throw new Error("Sem permissão");
  }

  const idx = proposalSteps.indexOf(
    proposal.status as (typeof proposalSteps)[number],
  );
  if (idx < 0 || idx >= proposalSteps.length - 1) {
    if (proposal.status === "ASSINATURA") {
      const done = await prisma.proposal.update({
        where: { id },
        data: {
          status: ProposalStatus.CONCLUIDA,
          statusHistory: {
            create: {
              status: ProposalStatus.CONCLUIDA,
              changedBy: session.user.id,
            },
          },
        },
      });
      revalidatePath("/propostas");
      return { id: done.id };
    }
    throw new Error("Não é possível avançar esta proposta");
  }

  const next = proposalSteps[idx + 1];
  const updated = await prisma.proposal.update({
    where: { id },
    data: {
      status: next,
      statusHistory: { create: { status: next, changedBy: session.user.id } },
    },
  });
  revalidatePath("/propostas");
  revalidatePath("/");
  return { id: updated.id };
}
