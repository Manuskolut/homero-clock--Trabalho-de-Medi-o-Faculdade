import { obterOrdemComCliente } from "@/lib/actions/ordens";
import { LinkButton } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { ImprimirViaButton } from "@/components/imprimir-via-button";
import { ViaCliente, ViaLoja } from "@/components/via-impressao";
import { parseRelogiosDetalhes, parsePecasJoia, formatarNumeroOS } from "@/lib/format";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ViasOrdemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ordem = await obterOrdemComCliente(id);
  if (!ordem) notFound();

  const dados = {
    numeroOS: ordem.numeroOS,
    lojaNome: ordem.loja.nome,
    clienteNome: ordem.cliente.nome,
    clienteTelefone: ordem.cliente.telefone,
    clienteEmail: ordem.cliente.email,
    tipoItem: ordem.tipoItem,
    dataEntrada: ordem.dataEntrada,
    dataPrevista: ordem.dataPrevista,
    valorOrcado: ordem.valorOrcado,
    sinal: ordem.sinal,
    custoOurives: ordem.custoOurives,
    observacoes: ordem.observacoes,
    oficina: ordem.oficina,
    relogios: parseRelogiosDetalhes(ordem.relogiosDetalhes),
    pecasJoia: parsePecasJoia(ordem.pecasJoia),
  };

  return (
    <div className="flex flex-col gap-6 print:block">
      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Vias — {ordem.loja.nome} nº {formatarNumeroOS(ordem.numeroOS)}
          </h1>
        </div>
        <div className="flex gap-3">
          <LinkButton href={`/ordens/${ordem.id}`} variant="secondary">
            Ver OS completa
          </LinkButton>
          <ImprimirViaButton dados={dados} />
        </div>
      </div>

      <div className="flex flex-col gap-6 print:block print:gap-0">
        <ViaCliente {...dados} />
        <ViaLoja {...dados} />
      </div>
    </div>
  );
}
