import { ordensProximasDoPrazo, listarOrdens } from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { LojaFiltro } from "@/components/loja-filtro";
import { diasParaPrazo } from "@/lib/format";
import { SecaoRetratil } from "@/components/secao-retratil";
import { BackButton } from "@/components/ui/back-button";
import { getOptionalSession } from "@/lib/dal";

export const dynamic = "force-dynamic";

export default async function AlertasPage({
  searchParams,
}: {
  searchParams: Promise<{ loja?: string }>;
}) {
  const { loja } = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [ordens, emOrcamento, lojas] = await Promise.all([
    ordensProximasDoPrazo(7, undefined, loja),
    listarOrdens({ status: "EM_ANALISE", lojaId: loja }),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  const atrasadas = ordens.filter((o) => diasParaPrazo(o.dataPrevista) < 0);
  const proximas3 = ordens.filter((o) => {
    const d = diasParaPrazo(o.dataPrevista);
    return d >= 0 && d <= 3;
  });
  const proximas7 = ordens.filter((o) => {
    const d = diasParaPrazo(o.dataPrevista);
    return d > 3 && d <= 7;
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Alertas de prazo
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            Ordens em aberto que precisam de atenção quanto ao prazo de entrega.
          </p>
        </div>
        {lojas && <LojaFiltro lojas={lojas} />}
      </div>

      <SecaoRetratil
        titulo={`Atrasadas (${atrasadas.length})`}
        descricao="Ordens com entrega prevista já vencida e ainda não retiradas."
        ordens={atrasadas}
        tom="danger"
        isAdmin={isAdmin}
      />
      <SecaoRetratil
        titulo={`Próximos 3 dias (${proximas3.length})`}
        descricao="Ordens com entrega prevista para hoje até os próximos 3 dias."
        ordens={proximas3}
        tom="warning"
        isAdmin={isAdmin}
      />
      <SecaoRetratil
        titulo={`Próximos 7 dias (${proximas7.length})`}
        descricao="Ordens com entrega prevista entre 4 e 7 dias."
        ordens={proximas7}
        tom="default"
        isAdmin={isAdmin}
      />
      <SecaoRetratil
        titulo={`Em orçamento (${emOrcamento.length})`}
        descricao="Ordens atualmente em orçamento, independente do prazo de entrega."
        ordens={emOrcamento}
        tom="default"
        isAdmin={isAdmin}
      />
    </div>
  );
}
