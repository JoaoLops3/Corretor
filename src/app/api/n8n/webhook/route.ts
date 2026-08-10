import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { AutomationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function apiKeyOk(provided: string | null): boolean {
  const expected = process.env.N8N_API_KEY;
  if (!expected || !provided) return false;
  try {
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** n8n → header `x-api-key` == N8N_API_KEY */
export async function POST(req: Request) {
  if (!process.env.N8N_API_KEY) {
    return NextResponse.json(
      { error: "N8N_API_KEY não configurada" },
      { status: 503 },
    );
  }

  const key = req.headers.get("x-api-key");
  if (!apiKeyOk(key)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: string;
    leadId?: string;
    visitId?: string;
    success?: boolean;
    channel?: string;
    payload?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (
    !body.type ||
    !Object.values(AutomationType).includes(body.type as AutomationType)
  ) {
    return NextResponse.json({ error: "type inválido" }, { status: 400 });
  }

  const type = body.type as AutomationType;

  if (body.leadId) {
    const lead = await prisma.lead.findUnique({
      where: { id: body.leadId },
      select: { id: true },
    });
    if (!lead) {
      return NextResponse.json({ error: "leadId inválido" }, { status: 400 });
    }
  }

  if (body.visitId) {
    const visit = await prisma.visit.findUnique({
      where: { id: body.visitId },
      select: { id: true },
    });
    if (!visit) {
      return NextResponse.json({ error: "visitId inválido" }, { status: 400 });
    }
  }

  const log = await prisma.automationLog.create({
    data: {
      type,
      channel: body.channel ?? "whatsapp",
      success: body.success ?? true,
      payload: body.payload as object | undefined,
      leadId: body.leadId,
    },
  });

  if (body.visitId && type === "LEMBRETE_VISITA") {
    await prisma.visit.update({
      where: { id: body.visitId },
      data: { reminderSentAt: new Date() },
    });
  }

  if (body.leadId && type === "LEMBRETE_NEGOCIACAO") {
    await prisma.lead.update({
      where: { id: body.leadId },
      data: { lastContactAt: new Date() },
    });
  }

  return NextResponse.json({ ok: true, id: log.id });
}
