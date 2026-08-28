import { obterPeca } from "@/lib/actions/pecas";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PecaStatusBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { BackButton } from "@/components/ui/back-button";
import { formatarData, formatarDataHora, formatarMoeda, labelCategoriaPeca } from "@/lib/format";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PecaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peca = await obterPeca(id);
  if (!peca) notFound();

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            {peca.nome}
          </h1>
          <PecaStatusBadge status={peca.status} />
          <span className="text-xs font-medium uppercase tracking-wide text-gray bg-gold-light/20 rounded-full px-2.5 py-1">
            {labelCategoriaPeca(peca.categoria)}
          </span>
        </div>
        <LinkButton href={`/pecas/${peca.id}/etiqueta`} variant="secondary">
          Ver / reimprimir etiqueta
        </LinkButton>
      </div>

      <Card className="p-6 flex flex-col gap-4">
        {peca.fotoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={peca.fotoUrl}
            alt={peca.nome}
            className="w-full max-h-80 object-contain rounded-lg border border-gold-light/30 bg-cream"
          />
        )}

        {peca.descricao && (
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray">Descrição</dt>
            <dd className="text-ink mt-1 whitespace-pre-wrap">{peca.descricao}</dd>
          </div>
        )}

        <dl className="grid sm:grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray">Código de barras</dt>
            <dd className="text-ink font-mono mt-0.5">{peca.codigoBarras}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray">Preço</dt>
            <dd className="text-ink mt-0.5">{formatarMoeda(peca.preco)}</dd>
          </div>
          {peca.referencia && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Referência</dt>
              <dd className="text-ink mt-0.5">{peca.referencia}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray">Loja destino</dt>
            <dd className="mt-0.5">
              <LojaBadge nome={peca.lojaDestino.nome} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-gray">Cadastrada em</dt>
            <dd className="text-ink mt-0.5">{formatarData(peca.createdAt)}</dd>
          </div>
          {peca.dataConfirmacao && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">
                Confirmação de recebimento
              </dt>
              <dd className="text-ink mt-0.5">{formatarDataHora(peca.dataConfirmacao)}</dd>
            </div>
          )}
          {peca.dataVenda && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Vendida em</dt>
              <dd className="text-ink mt-0.5">
                {formatarDataHora(peca.dataVenda)}
                {peca.lojaVenda && (
                  <>
                    {" · "}
                    <LojaBadge nome={peca.lojaVenda.nome} />
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
}
