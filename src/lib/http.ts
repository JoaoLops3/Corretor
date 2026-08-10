import { NextResponse } from "next/server";

export function jsonError(
  message: string,
  status: number,
  extra?: Record<string, unknown>,
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function readJsonBody<T = unknown>(
  req: Request,
): Promise<{ ok: true; data: T } | { ok: false; response: NextResponse }> {
  try {
    const data = (await req.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, response: jsonError("JSON inválido", 400) };
  }
}
