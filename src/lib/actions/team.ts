"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { isManager, requireSession } from "@/lib/permissions";

export async function listTeamMembers() {
  const session = await requireSession();
  if (!isManager(session)) throw new Error("Sem permissão");
  if (!session.user.teamId) return [];

  return prisma.user.findMany({
    where: { teamId: session.user.teamId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      creci: true,
      phone: true,
      avatarUrl: true,
      active: true,
      createdAt: true,
      teamId: true,
      _count: { select: { properties: true, leads: true, visits: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function inviteTeamMember(input: {
  name: string;
  email: string;
  role?: Role;
}) {
  const session = await requireSession();
  if (!isManager(session)) throw new Error("Só gerente pode convidar");
  if (!session.user.teamId) throw new Error("Sem time");

  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) throw new Error("E-mail inválido");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("E-mail já cadastrado");

  const temporaryPassword = randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name.trim() || email.split("@")[0],
      email,
      passwordHash,
      role: input.role ?? Role.CORRETOR,
      teamId: session.user.teamId,
      active: true,
    },
    select: { id: true, email: true, active: true },
  });

  revalidatePath("/equipe");
  return {
    id: user.id,
    email: user.email,
    active: user.active,
    temporaryPassword,
  };
}
