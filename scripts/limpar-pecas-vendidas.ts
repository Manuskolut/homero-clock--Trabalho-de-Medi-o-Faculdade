// Limpeza automática de peças vendidas há mais de 6 meses (180 dias).
//
// Não roda sozinho — precisa ser agendado via cron no servidor de produção,
// mesmo esquema do backup diário (ver scripts/backup-db.sh). Passo a passo
// completo em docs/limpeza-pecas.md.
//
// Silencioso por design: nenhum log, arquivo ou registro é gerado sobre o
// que foi excluído. Se o script falhar (ex: banco inacessível), a exceção
// sobe normalmente — isso é diagnóstico de falha de execução, não um
// rastro das exclusões em si.

import { prisma } from "../src/lib/prisma";

const DIAS_RETENCAO = 180;

async function main() {
  const limite = new Date();
  limite.setDate(limite.getDate() - DIAS_RETENCAO);

  const pecas = await prisma.peca.findMany({
    where: { status: "VENDIDA", dataVenda: { lt: limite } },
    select: { id: true },
  });

  if (pecas.length === 0) return;

  const ids = pecas.map((p) => p.id);

  // PecaEvento->Peca é ON DELETE RESTRICT, então os eventos precisam ser
  // apagados antes da peça — tudo dentro de uma transação, pra nunca deixar
  // eventos órfãos nem uma peça "meio excluída".
  await prisma.$transaction([
    prisma.pecaEvento.deleteMany({ where: { pecaId: { in: ids } } }),
    prisma.peca.deleteMany({ where: { id: { in: ids } } }),
  ]);
}

main()
  .catch(() => process.exit(1))
  .finally(() => prisma.$disconnect());
