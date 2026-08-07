import { criarCliente } from "@/lib/actions/clientes";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { ClienteForm } from "@/components/cliente-form";
import { BackButton } from "@/components/ui/back-button";
import { FormPage } from "@/components/ui/form-page";
import { getOptionalSession } from "@/lib/dal";

export default async function NovoClientePage() {
  const session = await getOptionalSession();
  const lojas =
    session?.tipo === "ADMIN" ? await listarLojasSelecionaveis() : undefined;

  return (
    <FormPage>
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Novo cliente
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Cadastre os dados do cliente para associar às ordens de serviço.
        </p>
      </div>
      <ClienteForm action={criarCliente} cancelHref="/clientes" lojas={lojas} />
    </FormPage>
  );
}
