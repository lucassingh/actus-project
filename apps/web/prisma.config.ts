import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load .env.local for local development (Next.js convention)
dotenv.config({ path: path.resolve(__dirname, ".env.local"), override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // The CLI (migrate / studio) uses the DIRECT, non-pooled connection: Neon's pooled
    // PgBouncer endpoint breaks Prisma migrations (advisory locks / multi-statement DDL).
    // Falls back to DATABASE_URL when DIRECT_URL isn't set (e.g. CI with a plain Postgres).
    // The app runtime is unaffected — it connects via the Neon adapter in src/lib/prisma.ts
    // using DATABASE_URL (pooled).
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
