-- Etapa 3 (robustez del agente): escalamiento a supervisor + feedback loop de la KB.

-- AlterTable: escalamiento (flag en dashboard) + atribución de KB usada por evento.
ALTER TABLE "events" ADD COLUMN "escalatedAt" TIMESTAMP(3);
ALTER TABLE "events" ADD COLUMN "escalationReason" TEXT;
ALTER TABLE "events" ADD COLUMN "referencedKbIds" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];
