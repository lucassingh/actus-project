-- Etapa 3 (robustez del agente): idempotencia de creación de eventos.
-- Guarda el wamid del mensaje de WhatsApp que creó el evento; un reintento del step de
-- Inngest reutiliza el evento con ese id en vez de crear un duplicado.

-- AlterTable
ALTER TABLE "events" ADD COLUMN "sourceMessageId" TEXT;

-- CreateIndex (único; en Postgres múltiples NULL son distintos, así que no choca con los
-- eventos existentes ni con los creados fuera del flujo de WhatsApp).
CREATE UNIQUE INDEX "events_sourceMessageId_key" ON "events"("sourceMessageId");
