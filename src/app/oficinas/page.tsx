import { listarOrdens } from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { Card } from "@/components/ui/card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { BackButton } from "@/components/ui/back-button";
import { type OficinaDatum } from "@/components/oficina-chart";
import { OficinaBarChart } from "@/components/oficina-bar-chart";
import { OFICINA_OPTIONS } from "@/lib/validation";
import {
  formatarNumeroOS,
  parseRelogiosDetalhes,
  estaAtrasada,
  OFICINA_COLOR_HEX,
} from "@/lib/format";
import { getOptionalSession } from "@/lib/dal";
import Link from "next/link";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

const COLUNAS = OFICINA_OPTIONS;

export default async function OficinasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>;
}) {
  const { loja } = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [ordens, lojas] = await Promise.all([
    listarOrdens({ tipoItem: "RELOGIO", lojaId: loja, status: "EM_CONSERTO" }),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  const colunas = COLUNAS.map((c) => ({
    ...c,
    ordens: ordens.filter((o) => (o.oficina ?? "") === c.value),
  }));

  const chartDados: OficinaDatum[] = colunas.map((c) => ({
    value: c.value,
    label: c.label,
    total: c.ordens.length,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Oficinas
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            Distribuição das ordens de relógio por oficina terceirizada.
          </p>
        </div>
        {lojas && <LojaFiltro lojas={lojas} />}
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-heading tracking-wide font-semibold text-ink mb-4">
          Distribuição por oficina
        </h2>
        <OficinaBarChart dados={chartDados} height={320} />
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 justify-center mt-4">
          {colunas.map((c) => (
            <span key={c.value} className="flex items-center gap-1.5 text-xs text-gray">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: OFICINA_COLOR_HEX[c.value] }}
              />
              {c.label}: <span className="font-medium text-ink">{c.ordens.length}</span>
            </span>
          ))}
        </div>
      </Card>

      {/* Desktop/tablet (md+): colunas lado a lado, com rolagem horizontal se precisar. */}
      <div className="hidden md:flex gap-4 overflow-x-auto pb-2">
        {colunas.map((c) => (
          <ColunaOficina key={c.value} coluna={c} isAdmin={isAdmin} className="w-72 shrink-0" />
        ))}
      </div>

      {/* Mobile (abaixo de md): colunas empilhadas verticalmente. */}
      <div className="md:hidden flex flex-col gap-6">
        {colunas.map((c) => (
          <ColunaOficina key={c.value} coluna={c} isAdmin={isAdmin} className="w-full" />
        ))}
      </div>
    </div>
  );
}

type ColunaData = {
  value: string;
  label: string;
  ordens: Awaited<ReturnType<typeof listarOrdens>>;
};

function ColunaOficina({
  coluna,
  isAdmin,
  className,
}: {
  coluna: ColunaData;
  isAdmin: boolean;
  className?: string;
}) {
  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: OFICINA_COLOR_HEX[coluna.value] }}
        />
        <h3 className="font-heading tracking-wide font-semibold text-ink">
          {coluna.label} ({coluna.ordens.length})
        </h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {coluna.ordens.length === 0 ? (
          <p className="text-xs text-gray-light bg-white/70 border border-gray-light/30 rounded-lg px-3 py-6 text-center">
            Nenhuma ordem
          </p>
        ) : (
          coluna.ordens.map((ordem) => {
            const atrasada = estaAtrasada(ordem.dataPrevista, ordem.status);
            const modelos = parseRelogiosDetalhes(ordem.relogiosDetalhes)
              .map((r) => r.modelo)
              .join(", ");
            return (
              <Link
                key={ordem.id}
                href={`/ordens/${ordem.id}`}
                className="rounded-lg border border-gray-light/40 bg-white p-3 flex flex-col gap-1.5 hover:border-gold-light hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-heading font-semibold text-ink">
                    #{formatarNumeroOS(ordem.numeroOS)}
                  </span>
                  {atrasada ? <AtrasadaBadge /> : <StatusBadge status={ordem.status} tipoItem={ordem.tipoItem} />}
                </div>
                <div className="text-sm text-ink truncate">{ordem.cliente.nome}</div>
                {modelos && (
                  <div className="text-xs text-gray truncate">{modelos}</div>
                )}
                {isAdmin && <LojaBadge nome={ordem.loja.nome} />}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
