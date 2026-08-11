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
    url: process.env["DATABASE_URL"],
  },
});
