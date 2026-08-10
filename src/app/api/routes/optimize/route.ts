import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { optimizeRoute, RouteStopInput } from "@/lib/google-maps";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const stops: RouteStopInput[] = body.stops;

  if (!Array.isArray(stops) || stops.length === 0) {
    return NextResponse.json({ error: "Envie ao menos uma parada em 'stops'" }, { status: 400 });
  }

  try {
    const result = await optimizeRoute(stops);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Erro ao otimizar rota:", err);
    return NextResponse.json({ error: "Falha ao calcular a rota" }, { status: 500 });
  }
}
