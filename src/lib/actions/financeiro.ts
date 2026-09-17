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
  /** Mês exibido/calculado, no formato "YYYY-MM" (já normalizado a partir do parâmetro recebido). */
  mes: string;
  totalGeral: number;
  totalOrdens: number;
  totalPecas: number;
  ordens: OrdemFinanceira[];
  pecas: PecaFinanceira[];
  porLoja: ResumoPorLoja[];
};

// Dinheiro recebido no período: soma o valor das OS "Entregue" (dataRetirada
// dentro do mês) com o valor das peças "Vendida" (dataVenda dentro do mês).
// "Cancelada" nunca entra — não é cobrado valor do cliente nesse caso.
export async function resumoFinanceiroMes(
  mes?: string,
  lojaIdFiltro?: string
): Promise<ResumoFinanceiroMes> {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  const hoje = new Date();
  const [anoStr, mesStr] = (mes ?? "").split("-");
  const ano = anoStr && !Number.isNaN(Number(anoStr)) ? Number(anoStr) : hoje.getFullYear();
  const mesIndex =
    mesStr && !Number.isNaN(Number(mesStr)) ? Number(mesStr) - 1 : hoje.getMonth();

  const inicioMes = new Date(ano, mesIndex, 1);
  const fimMes = new Date(ano, mesIndex + 1, 1);
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
    totalGeral: totalOrdens + totalPecas,
    totalOrdens,
    totalPecas,
    ordens: ordens as OrdemFinanceira[],
    pecas: pecas as PecaFinanceira[],
    porLoja,
  };
}
