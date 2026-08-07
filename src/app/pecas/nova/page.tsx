import { criarPeca } from "@/lib/actions/pecas";
import { listarLojasAtivas } from "@/lib/actions/lojas";
import { PecaForm } from "@/components/peca-form";
import { BackButton } from "@/components/ui/back-button";
import { FormPage } from "@/components/ui/form-page";
import { requireMuellerOuAdminPagina } from "@/lib/dal";

export default async function NovaPecaPage() {
  await requireMuellerOuAdminPagina();
  const lojas = await listarLojasAtivas();

  return (
    <FormPage>
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Nova peça
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Cadastre uma peça e escolha a loja para onde ela será enviada. O código de
          barras é gerado automaticamente ao salvar.
        </p>
      </div>
      <PecaForm action={criarPeca} lojas={lojas} />
    </FormPage>
  );
}
