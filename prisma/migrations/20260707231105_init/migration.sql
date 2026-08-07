-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ordem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "numeroOS" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "tipoItem" TEXT NOT NULL,
    "descricaoItem" TEXT NOT NULL,
    "dataEntrada" DATETIME NOT NULL,
    "dataPrevista" DATETIME NOT NULL,
    "valorOrcado" REAL NOT NULL,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEBIDO',
    "dataRetirada" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Ordem_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Cliente_nome_idx" ON "Cliente"("nome");

-- CreateIndex
CREATE INDEX "Cliente_telefone_idx" ON "Cliente"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "Ordem_numeroOS_key" ON "Ordem"("numeroOS");

-- CreateIndex
CREATE INDEX "Ordem_status_idx" ON "Ordem"("status");

-- CreateIndex
CREATE INDEX "Ordem_dataPrevista_idx" ON "Ordem"("dataPrevista");

-- CreateIndex
CREATE INDEX "Ordem_numeroOS_idx" ON "Ordem"("numeroOS");
