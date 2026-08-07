import { listarUsuarios } from "@/lib/actions/usuarios";
import { requireAdminPagina } from "@/lib/dal";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { formatarDataHora } from "@/lib/format";
import Link from "next/link";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

export default async function ContasPage() {
  await requireAdminPagina();
  const usuarios = await listarUsuarios();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Administração de contas
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            Contas de loja e de administrador com acesso ao sistema.
          </p>
        </div>
        <LinkButton href="/admin/contas/novo">+ Nova conta admin</LinkButton>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold-light/40 text-left text-xs uppercase tracking-wide text-gray">
                <th className="px-5 py-3 font-medium">Nome</th>
                <th className="px-5 py-3 font-medium">E-mail</th>
                <th className="px-5 py-3 font-medium">Tipo</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Criada em</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-light/20">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gold-light/10 transition-colors">
                  <td className="px-5 py-3 font-medium text-ink">
                    {usuario.nome}
                    {usuario.loja && (
                      <span className="text-xs text-gray-light font-normal"> · {usuario.loja.nome}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray">{usuario.email}</td>
                  <td className="px-5 py-3 text-gray">
                    {usuario.tipo === "ADMIN" ? "Administrador" : "Loja"}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                        usuario.ativo
                          ? "bg-[#5C8A66]/15 text-[#3D6647]"
                          : "bg-gray-light/30 text-gray"
                      )}
                    >
                      {usuario.ativo ? "Ativa" : "Desativada"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-light whitespace-nowrap">
                    {formatarDataHora(usuario.createdAt)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/contas/${usuario.id}`}
                      className="text-gold hover:underline"
                    >
                      Gerenciar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
