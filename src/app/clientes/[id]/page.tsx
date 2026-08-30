import { obterClienteComHistorico } from "@/lib/actions/clientes";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { ExcluirClienteButton } from "@/components/excluir-cliente-button";
import { formatarData, formatarMoeda, formatarNumeroOS, estaAtrasada } from "@/lib/format";
import { ItemOrdemResumo } from "@/components/item-ordem-resumo";
import { OrdemCard } from "@/components/ordem-card";
import { BackButton } from "@/components/ui/back-button";
import { getOptionalSession } from "@/lib/dal";
import { notFound } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await obterClienteComHistorico(id);
  if (!cliente) notFound();

  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              {cliente.nome}
            </h1>
          </div>
          <div className="text-sm text-gray mt-1 flex flex-col sm:flex-row sm:gap-4">
            <span>Telefone: {cliente.telefone}</span>
            <span>E-mail: {cliente.email ?? "—"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton
            href={`/ordens/novo?lojaId=${cliente.lojaId}&nome=${encodeURIComponent(cliente.nome)}&telefone=${encodeURIComponent(cliente.telefone)}`}
            variant="primary"
          >
            + Nova Ordem
          </LinkButton>
          <LinkButton href={`/clientes/${cliente.id}/editar`} variant="secondary">
            Editar cliente
          </LinkButton>
          {isAdmin && (
            <ExcluirClienteButton
              id={cliente.id}
              nome={cliente.nome}
              totalOrdens={cliente.ordens.length}
            />
          )}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-heading tracking-wide font-semibold text-ink mb-3">
          Histórico de ordens de serviço ({cliente.ordens.length})
        </h2>
        <Card className="overflow-hidden">
          {cliente.ordens.length === 0 ? (
            <p className="text-sm text-gray-light py-12 text-center">
              Este cliente ainda não possui ordens de serviço registradas.
            </p>
          ) : (
            <>
            <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
              {cliente.ordens.map((ordem) => (
                <OrdemCard
                  key={ordem.id}
                  ordem={ordem}
                  datas={[
                    { label: "Entrada", valor: ordem.dataEntrada },
                    { label: "Previsão", valor: ordem.dataPrevista },
                  ]}
                />
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-light/40 text-left text-xs uppercase tracking-wide text-gray">
                    <th className="px-5 py-3 font-medium">OS</th>
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 font-medium">Entrada</th>
                    <th className="px-5 py-3 font-medium">Previsão</th>
                    <th className="px-5 py-3 font-medium">Valor</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-light/20">
                  {cliente.ordens.map((ordem) => {
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
                        <td className="px-5 py-3 text-gray">
                          <ItemOrdemResumo ordem={ordem} />
                        </td>
                        <td className="px-5 py-3 text-gray whitespace-nowrap">
                          {formatarData(ordem.dataEntrada)}
                        </td>
                        <td className="px-5 py-3 text-gray whitespace-nowrap">
                          {formatarData(ordem.dataPrevista)}
                        </td>
                        <td className="px-5 py-3 text-gray whitespace-nowrap">
                          {formatarMoeda(ordem.valorOrcado)}
                        </td>
                        <td className="px-5 py-3">
                          {atrasada ? <AtrasadaBadge /> : <StatusBadge status={ordem.status} tipoItem={ordem.tipoItem} />}
                        </td>
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
  );
}
