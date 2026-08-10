import { auth } from "@/lib/auth";
import { optimizeRoute, type RouteStopInput } from "@/lib/google-maps";
import { jsonError, readJsonBody } from "@/lib/http";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return jsonError("Não autenticado", 401);
  }

  const body = await readJsonBody<{ stops?: RouteStopInput[] }>(req);
  if (!body.ok) return body.response;

  const stops = body.data.stops;
  if (!Array.isArray(stops) || stops.length === 0) {
    return jsonError("Envie ao menos uma parada em 'stops'", 400);
  }

  try {
    const result = await optimizeRoute(stops);
    return Response.json(result);
  } catch (err) {
    console.error("[routes/optimize]", err);
    return jsonError("Falha ao calcular a rota", 500);
  }
}
