import { listarPecasCadastradas } from "@/lib/actions/pecas";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { PecaStatusBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { ExcluirPecaButton } from "@/components/excluir-peca-button";
import { BackButton } from "@/components/ui/back-button";
import { formatarData, formatarMoeda } from "@/lib/format";
import { requireMuellerOuAdminPagina } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function PecasCadastradasPage() {
  await requireMuellerOuAdminPagina();
  const pecas = await listarPecasCadastradas();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Peças cadastradas
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Todas as peças já cadastradas pela Mueller, independente do destino ou status.
        </p>
      </div>

      <Card className="overflow-hidden">
        {pecas.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            Nenhuma peça cadastrada ainda.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-light/40 text-left text-xs uppercase tracking-wide text-gray">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Código de barras</th>
                  <th className="px-5 py-3 font-medium">Preço</th>
                  <th className="px-5 py-3 font-medium">Loja destino</th>
                  <th className="px-5 py-3 font-medium">Cadastrada em</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-light/20">
                {pecas.map((peca) => (
                  <tr key={peca.id} className="hover:bg-gold-light/10 transition-colors">
                    <td className="px-5 py-3 font-medium text-ink">{peca.nome}</td>
                    <td className="px-5 py-3 font-mono text-gray">{peca.codigoBarras}</td>
                    <td className="px-5 py-3 text-gray whitespace-nowrap">
                      {formatarMoeda(peca.preco)}
                    </td>
                    <td className="px-5 py-3">
                      <LojaBadge nome={peca.lojaDestino.nome} />
                    </td>
                    <td className="px-5 py-3 text-gray whitespace-nowrap">
                      {formatarData(peca.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <PecaStatusBadge status={peca.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <LinkButton href={`/pecas/${peca.id}/etiqueta`} variant="ghost">
                          Reimprimir etiqueta
                        </LinkButton>
                        {peca._count.eventos > 0 ? (
                          <span
                            className="text-xs text-gray-light"
                            title="Peças já vendidas em algum momento (mesmo reativadas depois) não podem ser excluídas."
                          >
                            Não pode excluir
                          </span>
                        ) : (
                          <ExcluirPecaButton id={peca.id} nome={peca.nome} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
