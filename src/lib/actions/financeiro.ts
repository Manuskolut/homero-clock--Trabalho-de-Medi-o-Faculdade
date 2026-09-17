"use server";

import { prisma } from "@/lib/prisma";
import { verifySession, filtroLoja } from "@/lib/dal";

export type OrdemFinanceira = {
  id: string;
  numeroOS: number;
  tipoItem: string;
  valorOrcado: number | null;
  dataRetirada: Date;
  cliente: { nome: string };
  loja: { id: string; nome: string };
};

export type PecaFinanceira = {
  id: string;
  nome: string;
  categoria: string;
  preco: number | null;
  dataVenda: Date;
  lojaVenda: { id: string; nome: string } | null;
};

export type ResumoPorLoja = {
  lojaId: string;
  lojaNome: string;
  totalOrdens: number;
  totalPecas: number;
  total: number;
};

export type ResumoFinanceiroMes = {
  /** Mês em que o ciclo COMEÇA, no formato "YYYY-MM" (é o nome usado pro ciclo, mesmo terminando no mês seguinte). */
  mes: string;
  /** Datas (ISO, yyyy-mm-dd) do início e fim do ciclo — pra exibir o período exato na página. */
  inicioCiclo: string;
  fimCiclo: string;
  totalGeral: number;
  totalOrdens: number;
  totalPecas: number;
  ordens: OrdemFinanceira[];
  pecas: PecaFinanceira[];
  porLoja: ResumoPorLoja[];
};

// Ciclo de fechamento de caixa da loja: do dia 6 de um mês até o dia 5 do
// mês seguinte (ex: 06/09 a 05/10) — não é o mês de calendário. O ciclo é
// nomeado pelo mês em que começa (o ciclo 06/09-05/10 é "Setembro").
function cicloContendo(data: Date): { ano: number; mesIndex: number } {
  if (data.getDate() >= 6) return { ano: data.getFullYear(), mesIndex: data.getMonth() };
  const mesAnterior = new Date(data.getFullYear(), data.getMonth() - 1, 1);
  return { ano: mesAnterior.getFullYear(), mesIndex: mesAnterior.getMonth() };
}

function paraISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}

// Dinheiro recebido no período: soma o valor das OS "Entregue" (dataRetirada
// dentro do ciclo) com o valor das peças "Vendida" (dataVenda dentro do
// ciclo). "Cancelada" nunca entra — não é cobrado valor do cliente nesse caso.
export async function resumoFinanceiroMes(
  mes?: string,
  lojaIdFiltro?: string
): Promise<ResumoFinanceiroMes> {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  const [anoStr, mesStr] = (mes ?? "").split("-");
  const informado =
    anoStr && mesStr && !Number.isNaN(Number(anoStr)) && !Number.isNaN(Number(mesStr));
  const { ano, mesIndex } = informado
    ? { ano: Number(anoStr), mesIndex: Number(mesStr) - 1 }
    : cicloContendo(new Date());

  const inicioMes = new Date(ano, mesIndex, 6);
  const fimMes = new Date(ano, mesIndex + 1, 6);
  const mesNormalizado = `${ano}-${String(mesIndex + 1).padStart(2, "0")}`;

  const [ordens, pecas] = await Promise.all([
    prisma.ordem.findMany({
      where: {
        deletedAt: null,
        status: "ENTREGUE",
        dataRetirada: { gte: inicioMes, lt: fimMes },
        ...(lojaId ? { lojaId } : {}),
      },
      select: {
        id: true,
        numeroOS: true,
        tipoItem: true,
        valorOrcado: true,
        dataRetirada: true,
        cliente: { select: { nome: true } },
        loja: { select: { id: true, nome: true } },
      },
      orderBy: { dataRetirada: "asc" },
    }),
    prisma.peca.findMany({
      where: {
        status: "VENDIDA",
        dataVenda: { gte: inicioMes, lt: fimMes },
        ...(lojaId ? { lojaVendaId: lojaId } : {}),
      },
      select: {
        id: true,
        nome: true,
        categoria: true,
        preco: true,
        dataVenda: true,
        lojaVenda: { select: { id: true, nome: true } },
      },
      orderBy: { dataVenda: "asc" },
    }),
  ]);

  const totalOrdens = ordens.reduce((soma, o) => soma + (o.valorOrcado ?? 0), 0);
  const totalPecas = pecas.reduce((soma, p) => soma + (p.preco ?? 0), 0);

  const porLojaMap = new Map<string, ResumoPorLoja>();
  for (const o of ordens) {
    const atual = porLojaMap.get(o.loja.id) ?? {
      lojaId: o.loja.id,
      lojaNome: o.loja.nome,
      totalOrdens: 0,
      totalPecas: 0,
      total: 0,
    };
    atual.totalOrdens += o.valorOrcado ?? 0;
    porLojaMap.set(o.loja.id, atual);
  }
  for (const p of pecas) {
    if (!p.lojaVenda) continue;
    const atual = porLojaMap.get(p.lojaVenda.id) ?? {
      lojaId: p.lojaVenda.id,
      lojaNome: p.lojaVenda.nome,
      totalOrdens: 0,
      totalPecas: 0,
      total: 0,
    };
    atual.totalPecas += p.preco ?? 0;
    porLojaMap.set(p.lojaVenda.id, atual);
  }
  const porLoja = Array.from(porLojaMap.values())
    .map((l) => ({ ...l, total: l.totalOrdens + l.totalPecas }))
    .sort((a, b) => b.total - a.total);

  return {
    mes: mesNormalizado,
    // Último dia do ciclo pra exibição é dia 5 (fimMes, usado na query, é o
    // limite exclusivo = dia 6 do mês seguinte).
    inicioCiclo: paraISO(inicioMes),
    fimCiclo: paraISO(new Date(ano, mesIndex + 1, 5)),
    totalGeral: totalOrdens + totalPecas,
    totalOrdens,
    totalPecas,
    ordens: ordens as OrdemFinanceira[],
    pecas: pecas as PecaFinanceira[],
    porLoja,
  };
}
