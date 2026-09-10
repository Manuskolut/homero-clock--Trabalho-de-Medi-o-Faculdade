import { listarPecasFila } from "@/lib/actions/pecas";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PecaStatusBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { CategoriaFiltro } from "@/components/categoria-filtro";
import { BuscaPecaFiltro } from "@/components/busca-peca-filtro";
import { PecaCard } from "@/components/peca-card";
import { PecaThumb } from "@/components/peca-thumb";
import { BackButton } from "@/components/ui/back-button";
import { formatarData, formatarMoeda, labelCategoriaPeca } from "@/lib/format";
import { getOptionalSession, podeCadastrarPecas, podeConfirmarRecebimentoPecas } from "@/lib/dal";
import type { CategoriaPeca } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function PecasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string; categoria?: string; busca?: string }>;
}) {
  const sp = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [pecas, lojas] = await Promise.all([
    listarPecasFila({
      lojaId: sp.loja,
      categoria: sp.categoria as CategoriaPeca | undefined,
      busca: sp.busca,
    }),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  const mostrarCadastro = session ? podeCadastrarPecas(session) : false;
  const mostrarConfirmacao = session ? podeConfirmarRecebimentoPecas(session) : false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Peças
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            {pecas.length} peça{pecas.length !== 1 ? "s" : ""} disponível ou a caminho
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <BuscaPecaFiltro />
          <CategoriaFiltro />
          {lojas && <LojaFiltro lojas={lojas} />}
          {mostrarCadastro && <LinkButton href="/pecas/nova">+ Nova Peça</LinkButton>}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {mostrarCadastro && (
          <LinkButton href="/pecas/cadastradas" variant="secondary">
            Peças cadastradas
          </LinkButton>
        )}
        {mostrarConfirmacao && (
          <LinkButton href="/pecas/confirmar" variant="secondary">
            Confirmar recebimento
          </LinkButton>
        )}
        <LinkButton href="/pecas/dar-baixa" variant="secondary">
          Dar baixa
        </LinkButton>
        <LinkButton href="/pecas/vendidas" variant="secondary">
          Peças vendidas
        </LinkButton>
      </div>

      <Card className="overflow-hidden">
        {pecas.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            {sp.busca
              ? "Nenhuma peça encontrada para essa busca."
              : "Nenhuma peça disponível no momento."}
          </p>
        ) : (
          <>
          <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
            {pecas.map((peca) => (
              <PecaCard
                key={peca.id}
                peca={peca}
                loja={isAdmin ? peca.lojaDestino : undefined}
                extra={<span>Cadastrada em {formatarData(peca.createdAt)}</span>}
              />
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-light/40 text-left text-xs uppercase tracking-wide text-gray">
                  <th className="pl-5 pr-2 py-3 font-medium w-[52px]"></th>
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Categoria</th>
                  <th className="px-5 py-3 font-medium">Código de barras</th>
                  <th className="px-5 py-3 font-medium">Preço</th>
                  <th className="px-5 py-3 font-medium">Cadastrada em</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  {isAdmin && <th className="px-5 py-3 font-medium">Loja destino</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-light/20">
                {pecas.map((peca) => (
                  <tr key={peca.id} className="hover:bg-gold-light/10 transition-colors">
                    <td className="pl-5 pr-2 py-3">
                      <PecaThumb fotoUrl={peca.fotoUrl} nome={peca.nome} />
                    </td>
                    <td className="px-5 py-3 font-medium">
                      <Link href={`/pecas/${peca.id}`} className="text-ink hover:text-gold">
                        {peca.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray">{labelCategoriaPeca(peca.categoria)}</td>
                    <td className="px-5 py-3 font-mono text-gray">{peca.codigoBarras}</td>
                    <td className="px-5 py-3 text-gray whitespace-nowrap">
                      {formatarMoeda(peca.preco)}
                    </td>
                    <td className="px-5 py-3 text-gray whitespace-nowrap">
                      {formatarData(peca.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <PecaStatusBadge status={peca.status} />
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        <LojaBadge nome={peca.lojaDestino.nome} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>
    </div>
  );
}
