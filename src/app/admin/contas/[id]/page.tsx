import { obterUsuario } from "@/lib/actions/usuarios";
import { requireAdminPagina } from "@/lib/dal";
import { ContaDetalhe } from "@/components/conta-detalhe";
import { BackButton } from "@/components/ui/back-button";
import { notFound } from "next/navigation";

export default async function ContaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAdminPagina();
  const { id } = await params;
  const usuario = await obterUsuario(id);
  if (!usuario) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            {usuario.nome}
          </h1>
        </div>
        <p className="text-sm text-gray mt-1">
          {usuario.email} ·{" "}
          {usuario.tipo === "ADMIN" ? "Administrador" : `Loja — ${usuario.loja?.nome}`}
        </p>
      </div>
      <ContaDetalhe
        id={usuario.id}
        email={usuario.email}
        ativo={usuario.ativo}
        isPropriaConta={usuario.id === session.userId}
      />
    </div>
  );
}
