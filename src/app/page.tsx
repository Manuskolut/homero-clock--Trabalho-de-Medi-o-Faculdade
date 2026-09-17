import {
  estatisticasDashboard,
  ordensProximasDoPrazo,
  contarRelogiosPorOficina,
} from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { StatCard, Card } from "@/components/ui/card";
import {
  InboxIcon,
  ClockAlertIcon,
  CalendarIcon,
  TrayInIcon,
  CheckCircleIcon,
  WrenchOffIcon,
} from "@/components/icons/stat-icons";
import { GraficoOrdensCard } from "@/components/grafico-ordens-card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import {
  formatarData,
  formatarNumeroOS,
  estaAtrasada,
  diasParaPrazo,
  PAINEL_STATUS_EXCLUIDOS_ATRASADA,
} from "@/lib/format";
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

      {/* Celular: 2 colunas (3 linhas de 2). Tablet (sm+): 3 colunas.
          Desktop (lg+): as 6 juntas numa linha só. Nunca exige rolagem
          horizontal — só reflui em mais linhas conforme a tela encolhe. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          label="Em aberto"
          value={stats.emAberto}
          icon={<InboxIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Atrasadas"
          value={stats.atrasadas}
          icon={<ClockAlertIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Próxima semana"
          value={stats.previstasSemana}
          icon={<CalendarIcon className="h-5 w-5" />}
        />
        <StatCard
          label="OS entradas este mês"
          value={stats.osEsteMes}
          icon={<TrayInIcon className="h-5 w-5" />}
        />
        <StatCard
          label="Encerradas no mês"
          value={stats.encerradasMes}
          icon={<CheckCircleIcon className="h-5 w-5" />}
          href={loja ? `/financeiro?loja=${loja}` : "/financeiro"}
        />
        <StatCard
          label="Canceladas (mês)"
          value={stats.semConsertoMes}
          icon={<WrenchOffIcon className="h-5 w-5" />}
        />
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
              {proximas.slice(0, 6).map((ordem) => {
                const atrasada = estaAtrasada(
                  ordem.dataPrevista,
                  ordem.status,
                  PAINEL_STATUS_EXCLUIDOS_ATRASADA
                );
                const diasVencido = -diasParaPrazo(ordem.dataPrevista);
                const prontoVencido = ordem.status === "PRONTO_RETIRADA" && diasVencido > 0;
                return (
                  <Link
                    key={ordem.id}
                    href={`/ordens/${ordem.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gold-light/10 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-ink truncate">
                          OS #{formatarNumeroOS(ordem.numeroOS)} — {ordem.cliente.nome}
                        </span>
                        {isAdmin && <LojaBadge nome={ordem.loja.nome} />}
                      </div>
                      <div className="text-xs text-gray truncate">
                        {ordem.descricaoItem}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {atrasada ? (
                        <AtrasadaBadge />
                      ) : (
                        <StatusBadge status={ordem.status} tipoItem={ordem.tipoItem} />
                      )}
                      {prontoVencido && (
                        <span className="text-xs text-[#E31717]">
                          Prazo vencido há {diasVencido} dia{diasVencido === 1 ? "" : "s"}
                        </span>
                      )}
                      <span className="text-xs text-gray-light">
                        {formatarData(ordem.dataPrevista)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
