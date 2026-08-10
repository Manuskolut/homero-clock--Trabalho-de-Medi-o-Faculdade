import { listarPecasVendidas } from "@/lib/actions/pecas";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { Card } from "@/components/ui/card";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { CategoriaFiltro } from "@/components/categoria-filtro";
import { DataVendaFiltro } from "@/components/data-venda-filtro";
import { BuscaPecaFiltro } from "@/components/busca-peca-filtro";
import { ReativarPecaButton } from "@/components/reativar-peca-button";
import { PecaCard } from "@/components/peca-card";
import { BackButton } from "@/components/ui/back-button";
import {
  formatarData,
  formatarDataHora,
  formatarMoeda,
  labelCategoriaPeca,
  podeReativarPeca,
} from "@/lib/format";
import { getOptionalSession } from "@/lib/dal";
import type { CategoriaPeca } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

const LABEL_EVENTO: Record<string, string> = {
  VENDA: "Venda",
  REATIVACAO: "Reativação",
};

type Evento = { id: string; tipo: string; data: Date; loja: { nome: string } };

function HistoricoEventos({ eventos }: { eventos: Evento[] }) {
  if (eventos.length <= 1) return null;
  return (
    <details className="text-xs text-gray-light">
      <summary className="cursor-pointer hover:text-ink">
        Histórico ({eventos.length} evento{eventos.length !== 1 ? "s" : ""})
      </summary>
      <ul className="mt-1.5 flex flex-col gap-1 pl-3 border-l border-gold-light/40">
        {eventos.map((evento) => (
          <li key={evento.id}>
            {LABEL_EVENTO[evento.tipo] ?? evento.tipo} — {evento.loja.nome} em{" "}
            {formatarDataHora(evento.data)}
          </li>
        ))}
      </ul>
    </details>
  );
}

export default async function PecasVendidasPage({
  searchParams,
}: {
  searchParams: Promise<{
    loja?: string;
    categoria?: string;
    de?: string;
    ate?: string;
    busca?: string;
  }>;
}) {
  const sp = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [pecas, lojas] = await Promise.all([
    listarPecasVendidas({
      lojaId: sp.loja,
      categoria: sp.categoria as CategoriaPeca | undefined,
      de: sp.de,
      ate: sp.ate,
      busca: sp.busca,
    }),
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
        <div className="flex flex-wrap items-end gap-3">
          <BuscaPecaFiltro />
          <CategoriaFiltro />
          {lojas && <LojaFiltro lojas={lojas} />}
        </div>
      </div>

      <DataVendaFiltro />

      <Card className="overflow-hidden">
        {pecas.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            {sp.busca
              ? "Nenhuma peça encontrada para essa busca."
              : sp.de || sp.ate
                ? "Nenhuma peça vendida nesse período."
                : "Nenhuma peça vendida ainda."}
          </p>
        ) : (
          <>
          <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
            {pecas.map((peca) => {
              const podeReativar = podeReativarPeca(peca.dataVenda);
              return (
                <div key={peca.id} className="flex flex-col gap-2">
                  <PecaCard
                    peca={peca}
                    loja={peca.lojaVenda}
                    extra={<span>Vendida em {formatarData(peca.dataVenda)}</span>}
                  />
                  <div className="px-4 pb-3.5 flex flex-col gap-2">
                    {podeReativar ? (
                      <ReativarPecaButton id={peca.id} nome={peca.nome} />
                    ) : (
                      <span
                        className="text-xs text-gray-light"
                        title="Só é possível reativar até 7 dias após a venda"
                      >
                        Prazo de reativação expirado
                      </span>
                    )}
                    <HistoricoEventos eventos={peca.eventos} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hidden md:flex flex-col divide-y divide-gold-light/20">
            {pecas.map((peca) => {
              const podeReativar = podeReativarPeca(peca.dataVenda);
              return (
                <div key={peca.id} className="flex flex-col gap-2 px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/pecas/${peca.id}`} className="group">
                      <div className="font-medium text-ink group-hover:text-gold">{peca.nome}</div>
                      <div className="text-xs text-gray-light font-mono mt-0.5">
                        {peca.codigoBarras}
                      </div>
                      <div className="text-xs text-gray mt-0.5">
                        {labelCategoriaPeca(peca.categoria)} · {formatarMoeda(peca.preco)} ·
                        Vendida em {formatarData(peca.dataVenda)}
                        {peca.lojaVenda && (
                          <>
                            {" · "}
                            <LojaBadge nome={peca.lojaVenda.nome} />
                          </>
                        )}
                      </div>
                    </Link>
                    {podeReativar ? (
                      <ReativarPecaButton id={peca.id} nome={peca.nome} />
                    ) : (
                      <span className="text-xs text-gray-light" title="Só é possível reativar até 7 dias após a venda">
                        Prazo de reativação expirado
                      </span>
                    )}
                  </div>
                  <HistoricoEventos eventos={peca.eventos} />
                </div>
              );
            })}
          </div>
          </>
        )}
      </Card>
    </div>
  );
}
