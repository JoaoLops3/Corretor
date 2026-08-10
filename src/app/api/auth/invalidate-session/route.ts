import { signOut } from "@/lib/auth";

/** Route Handler: pode limpar cookies (Server Components não podem). */
export async function GET() {
  await signOut({ redirectTo: "/login?reason=expired" });
}
