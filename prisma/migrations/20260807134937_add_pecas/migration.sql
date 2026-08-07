-- CreateTable
CREATE TABLE "Peca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "lojaDestinoId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dataConfirmacao" DATETIME,
    "dataVenda" DATETIME,
    "lojaVendaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Peca_lojaDestinoId_fkey" FOREIGN KEY ("lojaDestinoId") REFERENCES "Loja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Peca_lojaVendaId_fkey" FOREIGN KEY ("lojaVendaId") REFERENCES "Loja" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PecaEvento" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pecaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "lojaId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PecaEvento_pecaId_fkey" FOREIGN KEY ("pecaId") REFERENCES "Peca" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PecaEvento_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Peca_codigoBarras_key" ON "Peca"("codigoBarras");

-- CreateIndex
CREATE INDEX "Peca_lojaDestinoId_status_idx" ON "Peca"("lojaDestinoId", "status");

-- CreateIndex
CREATE INDEX "Peca_status_idx" ON "Peca"("status");

-- CreateIndex
CREATE INDEX "Peca_lojaVendaId_status_idx" ON "Peca"("lojaVendaId", "status");

-- CreateIndex
CREATE INDEX "PecaEvento_pecaId_idx" ON "PecaEvento"("pecaId");
