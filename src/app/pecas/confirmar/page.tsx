import { listarPecasAguardandoConfirmacao } from "@/lib/actions/pecas";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { Card } from "@/components/ui/card";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { CategoriaFiltro } from "@/components/categoria-filtro";
import { ConfirmarRecebimentoButton } from "@/components/confirmar-recebimento-button";
import { PecaCard } from "@/components/peca-card";
import { PecaThumb } from "@/components/peca-thumb";
import { BackButton } from "@/components/ui/back-button";
import { formatarData, formatarMoeda, labelCategoriaPeca } from "@/lib/format";
import { requireConfirmacaoPecasPagina } from "@/lib/dal";
import type { CategoriaPeca } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ConfirmarRecebimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string; categoria?: string }>;
}) {
  const session = await requireConfirmacaoPecasPagina();
  const sp = await searchParams;
  const isAdmin = session.tipo === "ADMIN";

  const [pecas, lojas] = await Promise.all([
    listarPecasAguardandoConfirmacao(sp.loja, sp.categoria as CategoriaPeca | undefined),
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
        <div className="flex flex-wrap items-end gap-3">
          <CategoriaFiltro />
          {lojas && <LojaFiltro lojas={lojas} />}
        </div>
      </div>

      <Card className="overflow-hidden">
        {pecas.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            Nenhuma peça aguardando confirmação.
          </p>
        ) : (
          <>
          <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
            {pecas.map((peca) => (
              <div key={peca.id}>
                <PecaCard
                  peca={peca}
                  loja={isAdmin ? peca.lojaDestino : undefined}
                  extra={<span>Cadastrada em {formatarData(peca.createdAt)}</span>}
                />
                <div className="px-4 pb-3.5">
                  <ConfirmarRecebimentoButton id={peca.id} nome={peca.nome} />
                </div>
              </div>
            ))}
          </div>
          <div className="hidden md:flex flex-col divide-y divide-gold-light/20">
            {pecas.map((peca) => (
              <div
                key={peca.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
              >
                <Link href={`/pecas/${peca.id}`} className="group flex items-center gap-3">
                  <PecaThumb fotoUrl={peca.fotoUrl} nome={peca.nome} />
                  <div>
                    <div className="font-medium text-ink group-hover:text-gold">{peca.nome}</div>
                    <div className="text-xs text-gray-light font-mono mt-0.5">
                      {peca.codigoBarras}
                    </div>
                    <div className="text-xs text-gray mt-0.5">
                      {labelCategoriaPeca(peca.categoria)} · {formatarMoeda(peca.preco)} ·
                      Cadastrada em {formatarData(peca.createdAt)}
                      {isAdmin && (
                        <>
                          {" · "}
                          <LojaBadge nome={peca.lojaDestino.nome} />
                        </>
                      )}
                    </div>
                  </div>
                </Link>
                <ConfirmarRecebimentoButton id={peca.id} nome={peca.nome} />
              </div>
            ))}
          </div>
          </>
        )}
      </Card>
    </div>
  );
}
