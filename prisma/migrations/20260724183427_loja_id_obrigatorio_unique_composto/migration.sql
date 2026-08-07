/*
  Warnings:

  - Made the column `lojaId` on table `Cliente` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lojaId` on table `Ordem` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "lojaId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cliente_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("createdAt", "email", "id", "lojaId", "nome", "telefone", "updatedAt") SELECT "createdAt", "email", "id", "lojaId", "nome", "telefone", "updatedAt" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE INDEX "Cliente_lojaId_nome_idx" ON "Cliente"("lojaId", "nome");
CREATE INDEX "Cliente_lojaId_telefone_idx" ON "Cliente"("lojaId", "telefone");
CREATE TABLE "new_Ordem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOS" TEXT NOT NULL,
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
