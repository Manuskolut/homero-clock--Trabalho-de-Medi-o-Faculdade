import { criarOrdem, previewProximoNumeroOS } from "@/lib/actions/ordens";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { OrdemForm } from "@/components/ordem-form";
import { BackButton } from "@/components/ui/back-button";
import { FormPage } from "@/components/ui/form-page";
import { getOptionalSession } from "@/lib/dal";

export default async function NovaOrdemPage({
  searchParams,
}: {
  searchParams: Promise<{ nome?: string; telefone?: string; lojaId?: string }>;
}) {
  const { nome, telefone, lojaId } = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";

  const [numeroPreviewInicial, lojas] = await Promise.all([
    isAdmin ? Promise.resolve(null) : previewProximoNumeroOS(),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <FormPage>
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Nova ordem de serviço
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Registre a entrada de um relógio ou joia para conserto.
        </p>
      </div>
      <OrdemForm
        action={criarOrdem}
        lojas={lojas}
        numeroPreviewInicial={numeroPreviewInicial}
        lojaNomeSessao={!isAdmin ? session?.nome : undefined}
        cancelHref="/ordens"
        defaultValues={{
          lojaId,
          dataEntrada: hoje,
          clienteNomePrefill: nome,
          clienteTelefonePrefill: telefone,
        }}
      />
    </FormPage>
  );
}
