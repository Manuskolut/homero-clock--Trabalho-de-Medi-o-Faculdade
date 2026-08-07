import { buscarClientes } from "@/lib/actions/clientes";
import { listarOrdens } from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { Card } from "@/components/ui/card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { formatarData, formatarNumeroOS, estaAtrasada } from "@/lib/format";
import { ItemOrdemResumo } from "@/components/item-ordem-resumo";
import { OrdemCard } from "@/components/ordem-card";
import { BackButton } from "@/components/ui/back-button";
import { getOptionalSession } from "@/lib/dal";
import Link from "next/link";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; loja?: string }>;
}) {
  const { q = "", loja } = await searchParams;
  const temBusca = q.trim().length > 0;

  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";
  const lojas = isAdmin ? await listarLojasSelecionaveis() : undefined;

  const [clientes, ordens] = temBusca
    ? await Promise.all([buscarClientes(q, loja), listarOrdens({ termo: q, lojaId: loja })])
    : [[], []];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Histórico e garantia
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            Busque por nome do cliente, telefone ou número de ordem de serviço para
            consultar o histórico completo, incluindo ordens já encerradas.
          </p>
        </div>
        {lojas && <LojaFiltro lojas={lojas} />}
      </div>

      <form method="GET" className="max-w-lg">
        {loja && <input type="hidden" name="loja" value={loja} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus
          placeholder="Nome, telefone ou número da OS…"
          className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-3 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
        />
      </form>

      {!temBusca ? (
        <p className="text-sm text-gray-light">
          Digite um termo acima para iniciar a busca.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-sm font-heading tracking-wide font-semibold text-ink mb-3">
              Clientes ({clientes.length})
            </h2>
            <Card className="overflow-hidden">
              {clientes.length === 0 ? (
                <p className="text-sm text-gray-light py-8 text-center">
                  Nenhum cliente encontrado.
                </p>
              ) : (
                <ul className="divide-y divide-gold-light/20">
                  {clientes.map((cliente) => (
                    <li key={cliente.id}>
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="flex items-center justify-between px-5 py-3 hover:bg-gold-light/10 transition-colors"
                      >
                        <div>
                          <div className="text-sm font-medium text-ink flex items-center gap-2">
                            {cliente.nome}
                            {isAdmin && <LojaBadge nome={cliente.loja.nome} />}
                          </div>
                          <div className="text-xs text-gray-light">{cliente.telefone}</div>
                        </div>
                        <span className="text-xs text-gold">Ver histórico completo →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div>
            <h2 className="text-sm font-heading tracking-wide font-semibold text-ink mb-3">
              Ordens de serviço ({ordens.length})
            </h2>
            <Card className="overflow-hidden">
              {ordens.length === 0 ? (
                <p className="text-sm text-gray-light py-8 text-center">
                  Nenhuma ordem encontrada.
                </p>
              ) : (
                <>
                <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
                  {ordens.map((ordem) => (
                    <OrdemCard
                      key={ordem.id}
                      ordem={ordem}
                      datas={[{ label: "Entrada", valor: ordem.dataEntrada }]}
                      mostrarValor={false}
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
                        <th className="px-5 py-3 font-medium">Entrada</th>
                        <th className="px-5 py-3 font-medium">Status</th>
                        {isAdmin && <th className="px-5 py-3 font-medium">Loja</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-light/20">
                      {ordens.map((ordem) => {
                        const atrasada = estaAtrasada(ordem.dataPrevista, ordem.status);
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
                            <td className="px-5 py-3 text-ink">{ordem.cliente.nome}</td>
                            <td className="px-5 py-3 text-gray">
                              <ItemOrdemResumo ordem={ordem} />
                            </td>
                            <td className="px-5 py-3 text-gray whitespace-nowrap">
                              {formatarData(ordem.dataEntrada)}
                            </td>
                            <td className="px-5 py-3">
                              {atrasada ? (
                                <AtrasadaBadge />
                              ) : (
                                <StatusBadge status={ordem.status} />
                              )}
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
        </div>
      )}
    </div>
  );
}
