/*
  Warnings:

  - You are about to drop the column `modelosRelogio` on the `Ordem` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ordem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOS" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "descricaoItem" TEXT NOT NULL,
    "dataEntrada" DATETIME NOT NULL,
    "dataPrevista" DATETIME NOT NULL,
    "valorOrcado" REAL NOT NULL,
    "observacoes" TEXT,
    "relogiosDetalhes" JSONB,
    "pesoJoia" TEXT,
    "tiposConsertoJoia" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEBIDO',
    "dataRetirada" DATETIME,
    "observacaoRetirada" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ordem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ordem" ("clienteId", "createdAt", "dataEntrada", "dataPrevista", "dataRetirada", "descricaoItem", "id", "numeroOS", "observacaoRetirada", "observacoes", "pesoJoia", "relogiosDetalhes", "status", "tipoItem", "tiposConsertoJoia", "updatedAt", "valorOrcado") SELECT "clienteId", "createdAt", "dataEntrada", "dataPrevista", "dataRetirada", "descricaoItem", "id", "numeroOS", "observacaoRetirada", "observacoes", "pesoJoia", "relogiosDetalhes", "status", "tipoItem", "tiposConsertoJoia", "updatedAt", "valorOrcado" FROM "Ordem";
DROP TABLE "Ordem";
ALTER TABLE "new_Ordem" RENAME TO "Ordem";
CREATE UNIQUE INDEX "Ordem_numeroOS_key" ON "Ordem"("numeroOS");
CREATE INDEX "Ordem_status_idx" ON "Ordem"("status");
CREATE INDEX "Ordem_dataPrevista_idx" ON "Ordem"("dataPrevista");
CREATE INDEX "Ordem_numeroOS_idx" ON "Ordem"("numeroOS");
CREATE INDEX "Ordem_tipoItem_idx" ON "Ordem"("tipoItem");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
