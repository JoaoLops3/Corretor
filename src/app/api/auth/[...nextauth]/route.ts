import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";

const NO_STORE = "private, no-cache, no-store, max-age=0, must-revalidate";

async function withNoStore(res: Response) {
  const headers = new Headers(res.headers);
  headers.set("Cache-Control", NO_STORE);
  headers.set("Pragma", "no-cache");
  headers.set("Expires", "0");
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export async function GET(req: NextRequest) {
  return withNoStore(await handlers.GET(req));
}

export async function POST(req: NextRequest) {
  return withNoStore(await handlers.POST(req));
}
