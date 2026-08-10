import { timingSafeEqual } from "crypto";
import { AutomationType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { jsonError, readJsonBody } from "@/lib/http";

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
    return jsonError("N8N_API_KEY não configurada", 503);
  }

  const key = req.headers.get("x-api-key");
  if (!apiKeyOk(key)) {
    return jsonError("Unauthorized", 401);
  }

  const parsed = await readJsonBody<{
    type?: string;
    leadId?: string;
    visitId?: string;
    success?: boolean;
    channel?: string;
    payload?: unknown;
  }>(req);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  if (
    !body.type ||
    !Object.values(AutomationType).includes(body.type as AutomationType)
  ) {
    return jsonError("type inválido", 400);
  }

  const type = body.type as AutomationType;

  try {
    if (body.leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: body.leadId },
        select: { id: true },
      });
      if (!lead) return jsonError("leadId inválido", 400);
    }

    if (body.visitId) {
      const visit = await prisma.visit.findUnique({
        where: { id: body.visitId },
        select: { id: true },
      });
      if (!visit) return jsonError("visitId inválido", 400);
    }

    const log = await prisma.$transaction(async (tx) => {
      const created = await tx.automationLog.create({
        data: {
          type,
          channel: body.channel ?? "whatsapp",
          success: body.success ?? true,
          payload: body.payload as object | undefined,
          leadId: body.leadId,
        },
      });

      if (body.visitId && type === "LEMBRETE_VISITA") {
        await tx.visit.update({
          where: { id: body.visitId },
          data: { reminderSentAt: new Date() },
        });
      }

      if (body.leadId && type === "LEMBRETE_NEGOCIACAO") {
        await tx.lead.update({
          where: { id: body.leadId },
          data: { lastContactAt: new Date() },
        });
      }

      return created;
    });

    return Response.json({ ok: true, id: log.id });
  } catch (err) {
    console.error("[n8n/webhook]", err);
    return jsonError("Falha interna ao registrar automação", 500);
  }
}
