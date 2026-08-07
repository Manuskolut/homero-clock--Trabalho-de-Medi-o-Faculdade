import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { DarBaixaScanner } from "@/components/dar-baixa-scanner";
import { BackButton } from "@/components/ui/back-button";
import { getOptionalSession } from "@/lib/dal";

export default async function DarBaixaPecaPage() {
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";
  const lojas = isAdmin ? await listarLojasSelecionaveis() : undefined;

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Dar baixa em peça
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Leia o código de barras da peça com o leitor USB para registrar a venda.
        </p>
      </div>

      <DarBaixaScanner isAdmin={!!isAdmin} lojas={lojas} />
    </div>
  );
}
