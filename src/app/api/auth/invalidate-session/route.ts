import { signOut } from "@/lib/auth";

/** Server Components não podem limpar cookies — por isso este Route Handler. */
export async function GET() {
  await signOut({ redirectTo: "/login?reason=expired" });
}
