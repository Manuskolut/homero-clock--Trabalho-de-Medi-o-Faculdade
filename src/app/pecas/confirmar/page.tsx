import { listarPecasAguardandoConfirmacao } from "@/lib/actions/pecas";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { Card } from "@/components/ui/card";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { ConfirmarRecebimentoButton } from "@/components/confirmar-recebimento-button";
import { BackButton } from "@/components/ui/back-button";
import { formatarData, formatarMoeda } from "@/lib/format";
import { requireConfirmacaoPecasPagina } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function ConfirmarRecebimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>;
}) {
  const session = await requireConfirmacaoPecasPagina();
  const sp = await searchParams;
  const isAdmin = session.tipo === "ADMIN";

  const [pecas, lojas] = await Promise.all([
    listarPecasAguardandoConfirmacao(sp.loja),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Confirmar recebimento
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            Peças enviadas pela Mueller aguardando confirmação de chegada.
          </p>
        </div>
        {lojas && <LojaFiltro lojas={lojas} />}
      </div>

      <Card className="overflow-hidden">
        {pecas.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            Nenhuma peça aguardando confirmação.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gold-light/20">
            {pecas.map((peca) => (
              <div
                key={peca.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <div>
                  <div className="font-medium text-ink">{peca.nome}</div>
                  <div className="text-xs text-gray-light font-mono mt-0.5">
                    {peca.codigoBarras}
                  </div>
                  <div className="text-xs text-gray mt-0.5">
                    {formatarMoeda(peca.preco)} · Cadastrada em {formatarData(peca.createdAt)}
                    {isAdmin && (
                      <>
                        {" · "}
                        <LojaBadge nome={peca.lojaDestino.nome} />
                      </>
                    )}
                  </div>
                </div>
                <ConfirmarRecebimentoButton id={peca.id} nome={peca.nome} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
