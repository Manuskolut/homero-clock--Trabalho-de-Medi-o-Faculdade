import { atualizarCliente, obterClienteParaEdicao } from "@/lib/actions/clientes";
import { ClienteForm } from "@/components/cliente-form";
import { BackButton } from "@/components/ui/back-button";
import { FormPage } from "@/components/ui/form-page";
import { notFound } from "next/navigation";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = await obterClienteParaEdicao(id);
  if (!cliente) notFound();

  const action = atualizarCliente.bind(null, id);

  return (
    <FormPage>
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Editar cliente
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">{cliente.nome}</p>
      </div>
      <ClienteForm
        action={action}
        defaultValues={cliente}
        cancelHref={`/clientes/${cliente.id}`}
      />
    </FormPage>
  );
}
