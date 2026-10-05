-- Etapa 5 (F6 — bot responde con imágenes): imagen de referencia opcional por caso de KB.
-- Se guarda como bytes y se sirve desde /api/media/kb/[id] para que WhatsApp la levante.

ALTER TABLE "knowledge_base" ADD COLUMN "imageData" BYTEA;
ALTER TABLE "knowledge_base" ADD COLUMN "imageMimeType" TEXT;
