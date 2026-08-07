/*
  Warnings:

  - You are about to alter the column `numeroOS` on the `Ordem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Ordem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOS" INTEGER NOT NULL,
    "lojaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "descricaoItem" TEXT NOT NULL,
    "dataEntrada" DATETIME NOT NULL,
    "dataPrevista" DATETIME,
    "valorOrcado" REAL,
    "observacoes" TEXT,
    "relogiosDetalhes" JSONB,
    "oficina" TEXT,
    "pesoJoia" TEXT,
    "pecasJoia" JSONB,
    "status" TEXT NOT NULL DEFAULT 'RECEBIDO',
    "dataRetirada" DATETIME,
    "observacaoRetirada" TEXT,
    "custoOurives" REAL,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ordem_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ordem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ordem" ("clienteId", "createdAt", "custoOurives", "dataEntrada", "dataPrevista", "dataRetirada", "deletedAt", "descricaoItem", "id", "lojaId", "numeroOS", "observacaoRetirada", "observacoes", "oficina", "pecasJoia", "pesoJoia", "relogiosDetalhes", "status", "tipoItem", "updatedAt", "valorOrcado") SELECT "clienteId", "createdAt", "custoOurives", "dataEntrada", "dataPrevista", "dataRetirada", "deletedAt", "descricaoItem", "id", "lojaId", "numeroOS", "observacaoRetirada", "observacoes", "oficina", "pecasJoia", "pesoJoia", "relogiosDetalhes", "status", "tipoItem", "updatedAt", "valorOrcado" FROM "Ordem";
DROP TABLE "Ordem";
ALTER TABLE "new_Ordem" RENAME TO "Ordem";
CREATE INDEX "Ordem_lojaId_status_idx" ON "Ordem"("lojaId", "status");
CREATE INDEX "Ordem_lojaId_dataPrevista_idx" ON "Ordem"("lojaId", "dataPrevista");
CREATE INDEX "Ordem_numeroOS_idx" ON "Ordem"("numeroOS");
CREATE INDEX "Ordem_tipoItem_idx" ON "Ordem"("tipoItem");
CREATE INDEX "Ordem_deletedAt_idx" ON "Ordem"("deletedAt");
CREATE UNIQUE INDEX "Ordem_lojaId_numeroOS_key" ON "Ordem"("lojaId", "numeroOS");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
