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

  const users = await prisma.user.findMany({
    where: { teamId: session.user.teamId },
    include: {
      _count: { select: { properties: true, leads: true, visits: true } },
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return users;
}

export async function inviteTeamMember(input: {
  name: string;
  email: string;
  role?: Role;
}) {
  const session = await requireSession();
  if (!isManager(session)) throw new Error("Só gerente pode convidar");
  if (!session.user.teamId) throw new Error("Sem time");
  if (!input.email?.includes("@")) throw new Error("E-mail inválido");

  const existing = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (existing) throw new Error("E-mail já cadastrado");

  const tempPassword = randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  const user = await prisma.user.create({
    data: {
      name: input.name || input.email.split("@")[0],
      email: input.email.toLowerCase(),
      passwordHash,
      role: input.role ?? Role.CORRETOR,
      teamId: session.user.teamId,
      active: false,
    },
  });

  revalidatePath("/equipe");
  return { id: user.id, email: user.email, active: user.active };
}
