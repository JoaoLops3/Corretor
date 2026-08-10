import "dotenv/config";
import { defineConfig } from "prisma/config";

// Não usar env("DATABASE_URL"): ele quebra `prisma generate` no CI/Vercel
// quando a variável ainda não existe. generate não precisa de URL real.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
