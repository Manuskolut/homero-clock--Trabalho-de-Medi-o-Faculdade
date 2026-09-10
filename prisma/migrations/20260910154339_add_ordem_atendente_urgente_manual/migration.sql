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
    "sinal" REAL,
    "observacoes" TEXT,
    "nomeAtendente" TEXT NOT NULL DEFAULT '',
    "dataPrometidaManual" BOOLEAN NOT NULL DEFAULT false,
    "relogiosDetalhes" JSONB,
    "oficina" TEXT,
    "pecasJoia" JSONB,
    "status" TEXT NOT NULL DEFAULT 'EM_ANALISE',
    "dataMarcadoSemConserto" DATETIME,
    "dataRetirada" DATETIME,
    "observacaoRetirada" TEXT,
    "cpfRetirada" TEXT,
    "nomeRetirada" TEXT,
    "emailRetirada" TEXT,
    "custoOurives" REAL,
    "deletedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ordem_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Ordem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ordem" ("clienteId", "cpfRetirada", "createdAt", "custoOurives", "dataEntrada", "dataMarcadoSemConserto", "dataPrevista", "dataRetirada", "deletedAt", "descricaoItem", "emailRetirada", "id", "lojaId", "nomeRetirada", "numeroOS", "observacaoRetirada", "observacoes", "oficina", "pecasJoia", "relogiosDetalhes", "sinal", "status", "tipoItem", "updatedAt", "valorOrcado") SELECT "clienteId", "cpfRetirada", "createdAt", "custoOurives", "dataEntrada", "dataMarcadoSemConserto", "dataPrevista", "dataRetirada", "deletedAt", "descricaoItem", "emailRetirada", "id", "lojaId", "nomeRetirada", "numeroOS", "observacaoRetirada", "observacoes", "oficina", "pecasJoia", "relogiosDetalhes", "sinal", "status", "tipoItem", "updatedAt", "valorOrcado" FROM "Ordem";
DROP TABLE "Ordem";
ALTER TABLE "new_Ordem" RENAME TO "Ordem";
CREATE INDEX "Ordem_lojaId_status_idx" ON "Ordem"("lojaId", "status");
CREATE INDEX "Ordem_lojaId_dataPrevista_idx" ON "Ordem"("lojaId", "dataPrevista");
CREATE INDEX "Ordem_lojaId_dataRetirada_idx" ON "Ordem"("lojaId", "dataRetirada");
CREATE INDEX "Ordem_lojaId_dataEntrada_idx" ON "Ordem"("lojaId", "dataEntrada");
CREATE INDEX "Ordem_clienteId_idx" ON "Ordem"("clienteId");
CREATE INDEX "Ordem_numeroOS_idx" ON "Ordem"("numeroOS");
CREATE INDEX "Ordem_tipoItem_idx" ON "Ordem"("tipoItem");
CREATE INDEX "Ordem_deletedAt_idx" ON "Ordem"("deletedAt");
CREATE UNIQUE INDEX "Ordem_lojaId_numeroOS_key" ON "Ordem"("lojaId", "numeroOS");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
