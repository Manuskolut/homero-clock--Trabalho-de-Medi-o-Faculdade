import { requireAdminPagina } from "@/lib/dal";
import { ContaAdminForm } from "@/components/conta-admin-form";
import { BackButton } from "@/components/ui/back-button";

export default async function NovaContaAdminPage() {
  await requireAdminPagina();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Nova conta de administrador
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Não cria contas de loja nem novas lojas — apenas outra conta com
          acesso administrativo total.
        </p>
      </div>
      <ContaAdminForm />
    </div>
  );
}
