-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Loja" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL DEFAULT '',
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Loja" ("ativa", "createdAt", "id", "nome", "updatedAt") SELECT "ativa", "createdAt", "id", "nome", "updatedAt" FROM "Loja";
DROP TABLE "Loja";
ALTER TABLE "new_Loja" RENAME TO "Loja";
CREATE UNIQUE INDEX "Loja_nome_key" ON "Loja"("nome");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- Valores iniciais de telefone de contato por loja (exibido na Via do Cliente)
UPDATE "Loja" SET "telefone" = '(41) 99685-0427' WHERE "id" = 'mueller';
UPDATE "Loja" SET "telefone" = '(41) 99245-4077' WHERE "id" = 'jockey';
UPDATE "Loja" SET "telefone" = '(41) 99757-0036' WHERE "id" = 'patio-batel';
