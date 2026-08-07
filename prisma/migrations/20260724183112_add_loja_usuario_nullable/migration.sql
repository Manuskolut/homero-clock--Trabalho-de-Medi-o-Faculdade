-- CreateTable
CREATE TABLE "Loja" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "lojaId" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Usuario_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "lojaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cliente_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Cliente" ("createdAt", "email", "id", "nome", "telefone", "updatedAt") SELECT "createdAt", "email", "id", "nome", "telefone", "updatedAt" FROM "Cliente";
DROP TABLE "Cliente";
ALTER TABLE "new_Cliente" RENAME TO "Cliente";
CREATE INDEX "Cliente_lojaId_nome_idx" ON "Cliente"("lojaId", "nome");
CREATE INDEX "Cliente_lojaId_telefone_idx" ON "Cliente"("lojaId", "telefone");
CREATE TABLE "new_Ordem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOS" TEXT NOT NULL,
    "lojaId" TEXT,
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
    CONSTRAINT "Ordem_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Ordem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Ordem" ("clienteId", "createdAt", "custoOurives", "dataEntrada", "dataPrevista", "dataRetirada", "descricaoItem", "id", "numeroOS", "observacaoRetirada", "observacoes", "oficina", "pecasJoia", "pesoJoia", "relogiosDetalhes", "status", "tipoItem", "updatedAt", "valorOrcado") SELECT "clienteId", "createdAt", "custoOurives", "dataEntrada", "dataPrevista", "dataRetirada", "descricaoItem", "id", "numeroOS", "observacaoRetirada", "observacoes", "oficina", "pecasJoia", "pesoJoia", "relogiosDetalhes", "status", "tipoItem", "updatedAt", "valorOrcado" FROM "Ordem";
DROP TABLE "Ordem";
ALTER TABLE "new_Ordem" RENAME TO "Ordem";
CREATE UNIQUE INDEX "Ordem_numeroOS_key" ON "Ordem"("numeroOS");
CREATE INDEX "Ordem_status_idx" ON "Ordem"("status");
CREATE INDEX "Ordem_dataPrevista_idx" ON "Ordem"("dataPrevista");
CREATE INDEX "Ordem_numeroOS_idx" ON "Ordem"("numeroOS");
CREATE INDEX "Ordem_tipoItem_idx" ON "Ordem"("tipoItem");
CREATE INDEX "Ordem_deletedAt_idx" ON "Ordem"("deletedAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Loja_nome_key" ON "Loja"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_lojaId_idx" ON "Usuario"("lojaId");
