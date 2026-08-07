import { listarPecasVendidas } from "@/lib/actions/pecas";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { Card } from "@/components/ui/card";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { ReativarPecaButton } from "@/components/reativar-peca-button";
import { BackButton } from "@/components/ui/back-button";
import { formatarData, formatarDataHora, formatarMoeda, podeReativarPeca } from "@/lib/format";
import { getOptionalSession } from "@/lib/dal";

export const dynamic = "force-dynamic";

const LABEL_EVENTO: Record<string, string> = {
  VENDA: "Venda",
  REATIVACAO: "Reativação",
};

export default async function PecasVendidasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>;
}) {
  const sp = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [pecas, lojas] = await Promise.all([
    listarPecasVendidas(sp.loja),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Peças vendidas
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            {isAdmin ? "Histórico de vendas de peças." : "Vendas realizadas por esta loja."}
          </p>
        </div>
        {lojas && <LojaFiltro lojas={lojas} />}
      </div>

      <Card className="overflow-hidden">
        {pecas.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            Nenhuma peça vendida ainda.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gold-light/20">
            {pecas.map((peca) => {
              const podeReativar = podeReativarPeca(peca.dataVenda);
              return (
                <div key={peca.id} className="flex flex-col gap-2 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-ink">{peca.nome}</div>
                      <div className="text-xs text-gray-light font-mono mt-0.5">
                        {peca.codigoBarras}
                      </div>
                      <div className="text-xs text-gray mt-0.5">
                        {formatarMoeda(peca.preco)} · Vendida em {formatarData(peca.dataVenda)}
                        {peca.lojaVenda && (
                          <>
                            {" · "}
                            <LojaBadge nome={peca.lojaVenda.nome} />
                          </>
                        )}
                      </div>
                    </div>
                    {podeReativar ? (
                      <ReativarPecaButton id={peca.id} nome={peca.nome} />
                    ) : (
                      <span className="text-xs text-gray-light" title="Só é possível reativar até 7 dias após a venda">
                        Prazo de reativação expirado
                      </span>
                    )}
                  </div>
                  {peca.eventos.length > 1 && (
                    <details className="text-xs text-gray-light">
                      <summary className="cursor-pointer hover:text-ink">
                        Histórico ({peca.eventos.length} evento{peca.eventos.length !== 1 ? "s" : ""})
                      </summary>
                      <ul className="mt-1.5 flex flex-col gap-1 pl-3 border-l border-gold-light/40">
                        {peca.eventos.map((evento) => (
                          <li key={evento.id}>
                            {LABEL_EVENTO[evento.tipo] ?? evento.tipo} — {evento.loja.nome} em{" "}
                            {formatarDataHora(evento.data)}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
