-- CreateIndex
CREATE INDEX "Ordem_lojaId_dataRetirada_idx" ON "Ordem"("lojaId", "dataRetirada");

-- CreateIndex
CREATE INDEX "Ordem_lojaId_dataEntrada_idx" ON "Ordem"("lojaId", "dataEntrada");

-- CreateIndex
CREATE INDEX "Ordem_clienteId_idx" ON "Ordem"("clienteId");
