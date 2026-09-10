import { listarLojasComTelefone } from "@/lib/actions/lojas";
import { requireAdminPagina } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { BackButton } from "@/components/ui/back-button";
import { LojaTelefoneForm } from "@/components/loja-telefone-form";

export const dynamic = "force-dynamic";

export default async function LojasConfigPage() {
  await requireAdminPagina();
  const lojas = await listarLojasComTelefone();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Configurações de loja
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          Telefone de contato de cada loja, exibido na Via do Cliente ao imprimir uma OS.
        </p>
      </div>

      <Card className="flex flex-col gap-6 p-5">
        {lojas.map((loja) => (
          <LojaTelefoneForm
            key={loja.id}
            lojaId={loja.id}
            lojaNome={loja.nome}
            telefoneAtual={loja.telefone}
          />
        ))}
      </Card>
    </div>
  );
}
