-- AlterTable
ALTER TABLE "Ordem" ADD COLUMN "modelosRelogio" TEXT;
ALTER TABLE "Ordem" ADD COLUMN "pesoJoia" TEXT;
ALTER TABLE "Ordem" ADD COLUMN "tiposConsertoJoia" TEXT;

-- CreateIndex
CREATE INDEX "Ordem_tipoItem_idx" ON "Ordem"("tipoItem");
