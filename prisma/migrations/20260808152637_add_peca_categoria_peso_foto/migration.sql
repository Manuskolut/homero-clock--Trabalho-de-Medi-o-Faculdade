/*
  Warnings:

  - Added the required column `categoria` to the `Peca` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Peca" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "preco" REAL NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "peso" TEXT,
    "fotoUrl" TEXT,
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
INSERT INTO "new_Peca" ("codigoBarras", "createdAt", "dataConfirmacao", "dataVenda", "descricao", "id", "lojaDestinoId", "lojaVendaId", "nome", "preco", "status", "updatedAt") SELECT "codigoBarras", "createdAt", "dataConfirmacao", "dataVenda", "descricao", "id", "lojaDestinoId", "lojaVendaId", "nome", "preco", "status", "updatedAt" FROM "Peca";
DROP TABLE "Peca";
ALTER TABLE "new_Peca" RENAME TO "Peca";
CREATE UNIQUE INDEX "Peca_codigoBarras_key" ON "Peca"("codigoBarras");
CREATE INDEX "Peca_lojaDestinoId_status_idx" ON "Peca"("lojaDestinoId", "status");
CREATE INDEX "Peca_status_idx" ON "Peca"("status");
CREATE INDEX "Peca_lojaVendaId_status_idx" ON "Peca"("lojaVendaId", "status");
CREATE INDEX "Peca_categoria_idx" ON "Peca"("categoria");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
