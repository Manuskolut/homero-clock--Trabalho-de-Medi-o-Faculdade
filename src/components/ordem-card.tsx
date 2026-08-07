import Link from "next/link";
import { clsx } from "clsx";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { ItemOrdemResumo } from "@/components/item-ordem-resumo";
import { formatarData, formatarMoeda, formatarNumeroOS, estaAtrasada } from "@/lib/format";
import type { Prisma } from "@prisma/client";

type OrdemCardData = {
  id: string;
  numeroOS: number;
  status: string;
  tipoItem: string;
  relogiosDetalhes: Prisma.JsonValue;
  pecasJoia: Prisma.JsonValue;
  dataPrevista: Date | string | null;
  valorOrcado: number | null;
  cliente?: { nome: string; telefone: string };
  loja?: { nome: string };
};

/**
 * Card compacto de uma ordem, usado como alternativa à linha de tabela em
 * telas estreitas (abaixo de md). Reaproveitado nas listagens de Ordens,
 * Alertas, Busca e Dar baixa — cada uma mostra um recorte diferente de datas/
 * valor/loja, por isso esses campos são configuráveis via props.
 */
export function OrdemCard({
  ordem,
  datas,
  mostrarValor = true,
  mostrarLoja = false,
}: {
  ordem: OrdemCardData;
  datas: { label: string; valor: Date | string | null }[];
  mostrarValor?: boolean;
  mostrarLoja?: boolean;
}) {
  const atrasada = estaAtrasada(ordem.dataPrevista, ordem.status);

  return (
    <Link
      href={`/ordens/${ordem.id}`}
      className={clsx(
        "flex flex-col gap-1.5 px-4 py-3.5 hover:bg-gold-light/10 transition-colors",
        atrasada && "bg-[#E31717]/[0.06] border-l-[3px] border-l-[#E31717]"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-ink">#{formatarNumeroOS(ordem.numeroOS)}</span>
        {atrasada ? <AtrasadaBadge /> : <StatusBadge status={ordem.status} />}
      </div>

      {ordem.cliente && (
        <div className="text-sm text-ink">
          {ordem.cliente.nome}{" "}
          <span className="text-gray-light">· {ordem.cliente.telefone}</span>
        </div>
      )}

      <div className="text-xs text-gray">
        <ItemOrdemResumo ordem={ordem} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-gray-light mt-0.5">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {datas.map((d) => (
            <span key={d.label}>
              {d.label}: {formatarData(d.valor)}
            </span>
          ))}
        </div>
        {mostrarValor && <span>{formatarMoeda(ordem.valorOrcado)}</span>}
      </div>

      {mostrarLoja && ordem.loja && <LojaBadge nome={ordem.loja.nome} />}
    </Link>
  );
}
