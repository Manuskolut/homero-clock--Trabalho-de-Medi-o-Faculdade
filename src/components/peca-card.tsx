import Link from "next/link";
import type { ReactNode } from "react";
import { PecaStatusBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { formatarMoeda, labelCategoriaPeca } from "@/lib/format";

type PecaCardData = {
  id: string;
  nome: string;
  categoria: string;
  codigoBarras: string;
  preco: number | null;
  status: string;
  fotoUrl?: string | null;
};

/**
 * Card compacto de uma peça, usado como alternativa à linha de tabela em
 * telas estreitas (abaixo de md) — mesmo papel do OrdemCard/ClienteCard.
 * Card inteiro é um link pro detalhe; ações (excluir, confirmar, reativar
 * etc.) ficam fora dele, renderizadas pela página chamadora logo abaixo.
 */
export function PecaCard({
  peca,
  loja,
  extra,
}: {
  peca: PecaCardData;
  loja?: { nome: string } | null;
  extra?: ReactNode;
}) {
  return (
    <Link
      href={`/pecas/${peca.id}`}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-gold-light/10 transition-colors"
    >
      {peca.fotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={peca.fotoUrl}
          alt={peca.nome}
          className="h-16 w-16 rounded-lg object-cover border border-gold-light/30 bg-cream shrink-0"
        />
      ) : (
        <div className="h-16 w-16 rounded-lg bg-gold-light/15 shrink-0" />
      )}

      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="font-medium text-ink truncate">{peca.nome}</span>
          <PecaStatusBadge status={peca.status} />
        </div>
        <div className="text-xs text-gray-light font-mono">{peca.codigoBarras}</div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs text-gray">
          <span>{labelCategoriaPeca(peca.categoria)}</span>
          <span>{formatarMoeda(peca.preco)}</span>
        </div>
        {extra}
        {loja && <LojaBadge nome={loja.nome} />}
      </div>
    </Link>
  );
}
