import { listarOrdens } from "@/lib/actions/ordens";
import { Card } from "@/components/ui/card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { ItemOrdemResumo } from "@/components/item-ordem-resumo";
import { OrdemCard } from "@/components/ordem-card";
import { BackButton } from "@/components/ui/back-button";
import { formatarData, formatarMoeda, formatarNumeroOS, estaAtrasada } from "@/lib/format";
import { TIPO_ITEM_OPTIONS } from "@/lib/validation";
import Link from "next/link";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

export default async function DarBaixaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string }>;
}) {
  const { q = "", tipo } = await searchParams;
  const ordens = await listarOrdens({
    termo: q,
    apenasAbertas: true,
    tipoItem: (tipo as "RELOGIO" | "JOIA" | undefined) || "TODOS",
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Dar baixa em ordem de serviço
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Busque a ordem em aberto do cliente que está retirando o item para
          registrar a entrega.
        </p>
      </div>

      <form method="GET" className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
          <input
            type="search"
            name="q"
            defaultValue={q}
            autoFocus
            placeholder="Número da OS, nome do cliente ou telefone…"
            className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-3 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <select
            name="tipo"
            defaultValue={tipo || "TODOS"}
            className="rounded-lg border border-gray-light/50 bg-white px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
          >
            <option value="TODOS">Todos os tipos</option>
            {TIPO_ITEM_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-lg bg-gold text-white px-4 py-3 text-sm font-medium"
        >
          Buscar
        </button>
      </form>

      <Card className="overflow-hidden">
        {ordens.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            {q
              ? "Nenhuma ordem em aberto encontrada para essa busca."
              : "Nenhuma ordem em aberto no momento."}
          </p>
        ) : (
          <>
          <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
            {ordens.map((ordem) => (
              <OrdemCard
                key={ordem.id}
                ordem={ordem}
                datas={[{ label: "Previsão", valor: ordem.dataPrevista }]}
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
                  <th className="px-5 py-3 font-medium">Previsão</th>
                  <th className="px-5 py-3 font-medium">Valor</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-light/20">
                {ordens.map((ordem) => {
                  const atrasada = estaAtrasada(ordem.dataPrevista, ordem.status);
                  return (
                    <tr
                      key={ordem.id}
                      className={clsx(
                        "hover:bg-gold-light/10 transition-colors cursor-pointer",
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
                        <Link href={`/ordens/${ordem.id}`} className="text-ink hover:text-gold">
                          {ordem.cliente.nome}
                        </Link>
                        <div className="text-xs text-gray-light">
                          {ordem.cliente.telefone}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray">
                        <ItemOrdemResumo ordem={ordem} />
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
