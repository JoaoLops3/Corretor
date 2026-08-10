import "dotenv/config";
import { defineConfig } from "prisma/config";

// process.env (não env()): `prisma generate` no CI não exige DATABASE_URL.
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
