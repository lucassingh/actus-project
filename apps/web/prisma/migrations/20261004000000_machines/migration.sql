-- Etapa 5 (F5 — QR por máquina): entidad Machine real + linkeo de eventos a la máquina.

-- CreateTable
CREATE TABLE "machines" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "sector" TEXT,
    "location" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "machines_tenantId_idx" ON "machines"("tenantId");

-- CreateIndex (código único por empresa)
CREATE UNIQUE INDEX "machines_tenantId_code_key" ON "machines"("tenantId", "code");

-- AlterTable: linkeo opcional del evento a la máquina (se mantiene machineName como texto libre)
ALTER TABLE "events" ADD COLUMN "machineId" INTEGER;

-- CreateIndex
CREATE INDEX "events_machineId_idx" ON "events"("machineId");

-- AddForeignKey
ALTER TABLE "machines" ADD CONSTRAINT "machines_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey (borrar una máquina desvincula sus eventos, no los borra)
ALTER TABLE "events" ADD CONSTRAINT "events_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "machines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
