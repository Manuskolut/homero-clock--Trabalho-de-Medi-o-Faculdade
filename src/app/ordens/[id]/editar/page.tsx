import { atualizarOrdem, obterOrdemComCliente } from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { OrdemForm } from "@/components/ordem-form";
import { paraInputDate, parseRelogiosDetalhes, parsePecasJoia, formatarNumeroOS } from "@/lib/format";
import { BackButton } from "@/components/ui/back-button";
import { FormPage } from "@/components/ui/form-page";
import { getOptionalSession } from "@/lib/dal";
import { notFound, redirect } from "next/navigation";

export default async function EditarOrdemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ordem = await obterOrdemComCliente(id);
  if (!ordem) notFound();
  if (ordem.dataRetirada) redirect(`/ordens/${id}`);

  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";
  const lojas = isAdmin ? await listarLojasSelecionaveis() : undefined;

  const action = atualizarOrdem.bind(null, id);

  return (
    <FormPage>
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Editar ordem de serviço
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          {ordem.loja.nome} nº {formatarNumeroOS(ordem.numeroOS)}
        </p>
      </div>
      <OrdemForm
        action={action}
        lojas={lojas}
        cancelHref={`/ordens/${ordem.id}`}
        defaultValues={{
          lojaId: ordem.lojaId,
          tipoItem: ordem.tipoItem,
          dataEntrada: paraInputDate(ordem.dataEntrada),
          dataPrevista: paraInputDate(ordem.dataPrevista),
          valorOrcado: ordem.valorOrcado ?? undefined,
          observacoes: ordem.observacoes,
          relogios: parseRelogiosDetalhes(ordem.relogiosDetalhes),
          oficina: ordem.oficina,
          pecasJoia: parsePecasJoia(ordem.pecasJoia),
          clienteNomeAtual: ordem.cliente.nome,
          clienteTelefoneAtual: ordem.cliente.telefone,
        }}
      />
    </FormPage>
  );
}
