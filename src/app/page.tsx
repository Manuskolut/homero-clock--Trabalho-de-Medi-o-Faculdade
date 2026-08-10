import {
  estatisticasDashboard,
  ordensProximasDoPrazo,
  contarRelogiosPorOficina,
} from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { StatCard, Card } from "@/components/ui/card";
import { GraficoOrdensCard } from "@/components/grafico-ordens-card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { formatarData, formatarNumeroOS, estaAtrasada } from "@/lib/format";
import { LinkButton } from "@/components/ui/button";
import { getOptionalSession } from "@/lib/dal";
import Link from "next/link";
import { clsx } from "clsx";
import type { TipoItem } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; loja?: string }>;
}) {
  const { tipo, loja } = await searchParams;
  const tipoFiltro: TipoItem | undefined =
    tipo === "RELOGIO" || tipo === "JOIA" ? tipo : undefined;

  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [stats, proximas, lojas, porOficina] = await Promise.all([
    estatisticasDashboard(loja),
    ordensProximasDoPrazo(7, tipoFiltro, loja),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
    contarRelogiosPorOficina(loja),
  ]);

  const porStatus = stats.porStatus;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Painel geral
          </h1>
          <p className="text-sm text-gray mt-1">
            Visão geral das ordens de serviço da Homero Clock Relojóias.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {lojas && <LojaFiltro lojas={lojas} />}
          {/* Mobile: empilhado (Nova Ordem em cima, Venda embaixo, mais fino).
              Desktop: "contents" dissolve o wrapper — os dois viram itens
              diretos do flex pai, daí sm:order-* reordena junto com "Dar
              baixa em OS" sem depender da posição no DOM. */}
          <div className="flex flex-col gap-2 sm:contents">
            <LinkButton
              href={loja ? `/ordens/novo?lojaId=${loja}` : "/ordens/novo"}
              variant="primary"
              className="btn-gold-shine sm:order-1 sm:w-40 sm:justify-center"
            >
              + Nova Ordem
            </LinkButton>
            <LinkButton
              href="/pecas/dar-baixa"
              variant="primary"
              className="sm:order-3 sm:w-40 sm:justify-center"
            >
              Venda
            </LinkButton>
          </div>
          <LinkButton href="/ordens/dar-baixa" variant="secondary" className="sm:order-2">
            Dar baixa em OS
          </LinkButton>
        </div>
      </div>

      {/* Mobile (abaixo de sm): carrossel com scroll-snap em 2 "páginas" de 2x2. */}
      <div className="sm:hidden flex overflow-x-auto snap-x snap-mandatory -mx-4 px-4 gap-4">
        <div className="shrink-0 w-full snap-start grid grid-cols-2 gap-4">
          <StatCard label="Em aberto" value={stats.emAberto} />
          <StatCard label="Atrasadas" value={stats.atrasadas} />
          <StatCard label="Próxima semana" value={stats.previstasSemana} />
          <StatCard label="OS entradas este mês" value={stats.osEsteMes} />
        </div>
        <div className="shrink-0 w-full snap-start grid grid-cols-2 gap-4">
          <div className="col-start-1">
            <StatCard label="Encerradas no mês" value={stats.encerradasMes} />
          </div>
          <div className="col-start-1">
            <StatCard label="Sem conserto (mês)" value={stats.semConsertoMes} />
          </div>
        </div>
      </div>

      {/* Tablet/desktop (sm+): os 6 cards juntos, sem paginação. */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Em aberto" value={stats.emAberto} />
        <StatCard label="Atrasadas" value={stats.atrasadas} />
        <StatCard label="Próxima semana" value={stats.previstasSemana} />
        <StatCard label="OS entradas este mês" value={stats.osEsteMes} />
        <StatCard label="Encerradas no mês" value={stats.encerradasMes} />
        <StatCard label="Sem conserto (mês)" value={stats.semConsertoMes} />
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        <Card className="p-5 lg:col-span-2">
          <GraficoOrdensCard porStatus={porStatus} porOficina={porOficina} />
        </Card>

        <Card className="p-5 lg:col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
              Prazos nos próximos 7 dias
            </h2>
            <Link href="/alertas" className="text-xs text-gold hover:underline">
              Ver todos os prazos →
            </Link>
          </div>
          <div className="flex items-center gap-1 mb-4">
            {[
              { label: "Todos", valor: undefined },
              { label: "Relógios", valor: "RELOGIO" },
              { label: "Joias", valor: "JOIA" },
            ].map((opt) => (
              <Link
                key={opt.label}
                href={`/?${new URLSearchParams({
                  ...(opt.valor ? { tipo: opt.valor } : {}),
                  ...(loja ? { loja } : {}),
                }).toString()}`}
                className={clsx(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                  tipoFiltro === opt.valor
                    ? "bg-gold text-white"
                    : "text-ink/60 hover:text-ink hover:bg-gold-light/30"
                )}
              >
                {opt.label}
              </Link>
            ))}
          </div>
          {proximas.length === 0 ? (
            <p className="text-sm text-gray-light py-8 text-center">
              {tipoFiltro
                ? "Nenhuma ordem deste tipo com entrega prevista para os próximos 7 dias."
                : "Nenhuma ordem com entrega prevista para os próximos 7 dias."}
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-gold-light/30 -mx-5">
              {proximas.slice(0, 6).map((ordem) => (
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
                      {ordem.descricaoItem}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {estaAtrasada(ordem.dataPrevista, ordem.status) ? (
                      <AtrasadaBadge />
                    ) : (
                      <StatusBadge status={ordem.status} />
                    )}
                    <span className="text-xs text-gray-light">
                      {formatarData(ordem.dataPrevista)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
