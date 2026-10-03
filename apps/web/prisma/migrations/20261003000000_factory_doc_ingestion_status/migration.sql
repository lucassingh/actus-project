-- Etapa 2 (RAG de manuales): seguimiento del ciclo de vida de ingesta.
-- La ingesta pasó a ser asíncrona (embeddings durables en Inngest), así que un doc
-- puede quedar en PROCESSING un rato y puede terminar en FAILED (ej: PDF escaneado).

-- AlterTable
ALTER TABLE "factory_docs" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'PENDING';
ALTER TABLE "factory_docs" ADD COLUMN "error" TEXT;

-- Backfill: los documentos ya indexados quedan como INDEXED en vez del default PENDING.
UPDATE "factory_docs" SET "status" = 'INDEXED' WHERE "isProcessed" = true;
