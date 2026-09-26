import "dotenv/config";
import dotenv from "dotenv";
import path from "path";
import { defineConfig } from "prisma/config";

// Load .env.local for local development (Next.js convention)
dotenv.config({ path: path.resolve(__dirname, ".env.local"), override: true });

// The Prisma CLI (migrate / studio) needs a DIRECT (non-pooled) connection: Neon's pooled
// PgBouncer endpoint breaks migrations (advisory locks / multi-statement DDL). Prefer an
// explicit DIRECT_URL when it's a valid Postgres URL; otherwise derive the direct
// connection from DATABASE_URL by dropping the "-pooler" host suffix. This keeps migrations
// working when only DATABASE_URL is configured, and is resilient to a malformed DIRECT_URL.
// The app runtime is unaffected — it connects via the Neon adapter in src/lib/prisma.ts
// using DATABASE_URL (pooled).
function migrationUrl(): string | undefined {
  const explicit = process.env["DIRECT_URL"];
  if (explicit && /^postgres(ql)?:\/\//i.test(explicit)) return explicit;

  const pooled = process.env["DATABASE_URL"];
  if (!pooled) return undefined;
  try {
    const u = new URL(pooled);
    u.host = u.host.replace("-pooler", "");
    u.searchParams.delete("pgbouncer");
    u.searchParams.delete("connection_limit");
    return u.toString();
  } catch {
    return pooled;
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: migrationUrl(),
  },
});
