import { resumoFinanceiroMes } from "@/lib/actions/financeiro";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { Card, StatCard } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { LojaFiltro } from "@/components/loja-filtro";
import { MesFiltro } from "@/components/mes-filtro";
import { LojaBadge } from "@/components/loja-badge";
import {
  formatarData,
  formatarMoeda,
  formatarNumeroOS,
  labelTipoItem,
  labelCategoriaPeca,
} from "@/lib/format";
import { getOptionalSession } from "@/lib/dal";
import Link from "next/link";

export const dynamic = "force-dynamic";

function labelMes(mes: string): string {
  const [ano, mesNum] = mes.split("-").map(Number);
  const data = new Date(ano, mesNum - 1, 1);
  const texto = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; loja?: string }>;
}) {
  const { mes, loja } = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [resumo, lojas] = await Promise.all([
    resumoFinanceiroMes(mes, loja),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Dinheiro recebido no mês
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            {labelMes(resumo.mes)} — composição do total entre OS entregues e peças vendidas.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <MesFiltro />
          {lojas && <LojaFiltro lojas={lojas} />}
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total recebido" value={formatarMoeda(resumo.totalGeral)} />
        <StatCard label="OS entregues" value={formatarMoeda(resumo.totalOrdens)} />
        <StatCard label="Peças vendidas" value={formatarMoeda(resumo.totalPecas)} />
      </div>

      {isAdmin && resumo.porLoja.length > 0 && (
        <Card className="p-5">
          <h2 className="text-sm font-heading tracking-wide font-semibold text-ink mb-3">
            Por loja
          </h2>
          <div className="flex flex-col divide-y divide-gold-light/30">
            {resumo.porLoja.map((l) => (
              <div key={l.lojaId} className="flex items-center justify-between gap-3 py-2.5">
                <LojaBadge nome={l.lojaNome} />
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray text-xs">
                    OS {formatarMoeda(l.totalOrdens)} · Peças {formatarMoeda(l.totalPecas)}
                  </span>
                  <span className="font-medium text-ink">{formatarMoeda(l.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
            OS entregues ({resumo.ordens.length})
          </h2>
        </div>
        {resumo.ordens.length === 0 ? (
          <p className="text-sm text-gray-light py-8 text-center">
            Nenhuma OS entregue neste período.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gold-light/20">
            {resumo.ordens.map((ordem) => (
              <Link
                key={ordem.id}
                href={`/ordens/${ordem.id}`}
                className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gold-light/10 transition-colors"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate flex items-center gap-2">
                    OS #{formatarNumeroOS(ordem.numeroOS)} — {ordem.cliente.nome}
                    {isAdmin && <LojaBadge nome={ordem.loja.nome} />}
                  </div>
                  <div className="text-xs text-gray truncate">
                    {labelTipoItem(ordem.tipoItem)} · Entregue em {formatarData(ordem.dataRetirada)}
                  </div>
                </div>
                <span className="text-sm font-medium text-ink shrink-0">
                  {formatarMoeda(ordem.valorOrcado)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <div className="px-5 pt-4 pb-1">
          <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
            Peças vendidas ({resumo.pecas.length})
          </h2>
        </div>
        {resumo.pecas.length === 0 ? (
          <p className="text-sm text-gray-light py-8 text-center">
            Nenhuma peça vendida neste período.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gold-light/20">
            {resumo.pecas.map((peca) => (
              <div
                key={peca.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate flex items-center gap-2">
                    {peca.nome}
                    {isAdmin && peca.lojaVenda && <LojaBadge nome={peca.lojaVenda.nome} />}
                  </div>
                  <div className="text-xs text-gray truncate">
                    {labelCategoriaPeca(peca.categoria)} · Vendida em{" "}
                    {formatarData(peca.dataVenda)}
                  </div>
                </div>
                <span className="text-sm font-medium text-ink shrink-0">
                  {formatarMoeda(peca.preco)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
