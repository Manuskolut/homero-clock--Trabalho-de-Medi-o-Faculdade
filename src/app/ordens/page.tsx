import { listarOrdens, type FiltroOrdens } from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { STATUS_ORDEM_OPTIONS, TIPO_ITEM_OPTIONS } from "@/lib/validation";
import { formatarData, formatarMoeda, formatarNumeroOS, estaAtrasada } from "@/lib/format";
import { ItemOrdemResumo } from "@/components/item-ordem-resumo";
import { OrdemCard } from "@/components/ordem-card";
import { OficinaSelect } from "@/components/oficina-select";
import { BackButton } from "@/components/ui/back-button";
import { getOptionalSession } from "@/lib/dal";
import Link from "next/link";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

export default async function OrdensPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    de?: string;
    ate?: string;
    tipo?: string;
    loja?: string;
  }>;
}) {
  const sp = await searchParams;
  const filtro: FiltroOrdens = {
    termo: sp.q,
    status: (sp.status as FiltroOrdens["status"]) || "TODAS",
    de: sp.de,
    ate: sp.ate,
    tipoItem: (sp.tipo as FiltroOrdens["tipoItem"]) || "TODOS",
    lojaId: sp.loja,
  };
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";
  const [ordens, lojas] = await Promise.all([
    listarOrdens(filtro),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Ordens de Serviço
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            {ordens.length} ordem{ordens.length !== 1 ? "s" : ""} encontrada(s)
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {lojas && <LojaFiltro lojas={lojas} />}
          <LinkButton href={sp.loja ? `/ordens/novo?lojaId=${sp.loja}` : "/ordens/novo"}>
            + Nova Ordem
          </LinkButton>
        </div>
      </div>

      <form method="GET" className="flex flex-wrap gap-3 items-end">
        {sp.loja && <input type="hidden" name="loja" value={sp.loja} />}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
          <label htmlFor="q" className="text-xs font-medium text-gray uppercase tracking-wide">
            Buscar
          </label>
          <input
            id="q"
            type="search"
            name="q"
            defaultValue={sp.q}
            placeholder="Nº OS, cliente, telefone ou item…"
            className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-xs font-medium text-gray uppercase tracking-wide">
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={sp.status || "TODAS"}
            className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          >
            <option value="TODAS">Todas</option>
            {STATUS_ORDEM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipo" className="text-xs font-medium text-gray uppercase tracking-wide">
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            defaultValue={sp.tipo || "TODOS"}
            className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          >
            <option value="TODOS">Todos</option>
            {TIPO_ITEM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="de" className="text-xs font-medium text-gray uppercase tracking-wide">
            Previsão de
          </label>
          <input
            id="de"
            type="date"
            name="de"
            defaultValue={sp.de}
            className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="ate" className="text-xs font-medium text-gray uppercase tracking-wide">
            até
          </label>
          <input
            id="ate"
            type="date"
            name="ate"
            defaultValue={sp.ate}
            className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gold text-white px-4 py-2.5 text-sm font-medium"
        >
          Filtrar
        </button>
        {(sp.q || sp.status || sp.de || sp.ate || sp.tipo) && (
          <Link
            href="/ordens"
            className="text-sm text-gray hover:text-ink px-2 py-2.5"
          >
            Limpar filtros
          </Link>
        )}
      </form>

      <Card className="overflow-hidden">
        {ordens.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            Nenhuma ordem de serviço encontrada.
          </p>
        ) : (
          <>
          <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
            {ordens.map((ordem) => (
              <OrdemCard
                key={ordem.id}
                ordem={ordem}
                datas={[{ label: "Previsão", valor: ordem.dataPrevista }]}
                mostrarLoja={isAdmin}
              />
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-light/40 text-left text-xs uppercase tracking-wide text-gray">
                  <th className="px-5 py-3 font-medium">OS</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Oficina</th>
                  <th className="px-5 py-3 font-medium">Previsão</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  {isAdmin && <th className="px-5 py-3 font-medium">Loja</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-light/20">
                {ordens.map((ordem) => {
                  const atrasada = estaAtrasada(ordem.dataPrevista, ordem.status);
                  const somenteLeitura = ordem.dataRetirada != null;
                  return (
                    <tr
                      key={ordem.id}
                      className={clsx(
                        "hover:bg-gold-light/10 transition-colors",
                        atrasada && "bg-[#E31717]/[0.06]"
                      )}
                    >
                      <td
                        className={clsx(
                          "px-5 py-3",
                          atrasada && "border-l-[3px] border-l-[#E31717]"
                        )}
                      >
                        <Link
                          href={`/ordens/${ordem.id}`}
                          className="font-medium text-ink hover:text-gold"
                        >
                          #{formatarNumeroOS(ordem.numeroOS)}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/clientes/${ordem.clienteId}`}
                          className="text-ink hover:text-gold"
                        >
                          {ordem.cliente.nome}
                        </Link>
                        <div className="text-xs text-gray-light">
                          {ordem.cliente.telefone}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray">
                        <ItemOrdemResumo ordem={ordem} />
                      </td>
                      <td className="px-5 py-3">
                        {ordem.tipoItem === "RELOGIO" ? (
                          <OficinaSelect
                            id={ordem.id}
                            oficina={ordem.oficina}
                            somenteLeitura={somenteLeitura}
                          />
                        ) : (
                          <span className="text-gray-light">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-gray whitespace-nowrap">
                        {formatarData(ordem.dataPrevista)}
                      </td>
                      <td className="px-5 py-3 text-gray whitespace-nowrap">
                        {formatarMoeda(ordem.valorOrcado)}
                      </td>
                      <td className="px-5 py-3">
                        {atrasada ? <AtrasadaBadge /> : <StatusBadge status={ordem.status} />}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <LojaBadge nome={ordem.loja.nome} />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>
    </div>
  );
}
