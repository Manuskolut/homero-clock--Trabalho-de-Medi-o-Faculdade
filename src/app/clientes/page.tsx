import { buscarClientes } from "@/lib/actions/clientes";
import { listarLojasSelecionaveis } from "@/lib/actions/lojas";
import { LinkButton } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { Card } from "@/components/ui/card";
import { LojaBadge } from "@/components/loja-badge";
import { LojaFiltro } from "@/components/loja-filtro";
import { ClienteCard } from "@/components/cliente-card";
import { getOptionalSession } from "@/lib/dal";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; loja?: string }>;
}) {
  const { q = "", loja } = await searchParams;
  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";
  const [clientes, lojas] = await Promise.all([
    buscarClientes(q, loja),
    isAdmin ? listarLojasSelecionaveis() : Promise.resolve(undefined),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
              Clientes
            </h1>
          </div>
          <p className="text-sm text-gray mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
            {q ? ` encontrado(s) para "${q}"` : " cadastrado(s)"}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          {lojas && <LojaFiltro lojas={lojas} />}
          <LinkButton href="/clientes/novo">+ Novo Cliente</LinkButton>
        </div>
      </div>

      <form method="GET" className="max-w-md">
        {loja && <input type="hidden" name="loja" value={loja} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, telefone ou e-mail…"
          className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
        />
      </form>

      <Card className="overflow-hidden">
        {clientes.length === 0 ? (
          <p className="text-sm text-gray-light py-12 text-center">
            Nenhum cliente encontrado.
          </p>
        ) : (
          <>
          <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
            {clientes.map((cliente) => (
              <ClienteCard key={cliente.id} cliente={cliente} mostrarLoja={isAdmin} />
            ))}
          </div>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold-light/40 text-left text-xs uppercase tracking-wide text-gray">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Telefone</th>
                  <th className="px-5 py-3 font-medium">E-mail</th>
                  {isAdmin && <th className="px-5 py-3 font-medium">Loja</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-light/20">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gold-light/10 transition-colors">
                    <td className="px-5 py-3">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="font-medium text-ink hover:text-gold"
                      >
                        {cliente.nome}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-gray">{cliente.telefone}</td>
                    <td className="px-5 py-3 text-gray">{cliente.email ?? "—"}</td>
                    {isAdmin && (
                      <td className="px-5 py-3">
                        <LojaBadge nome={cliente.loja.nome} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </Card>
    </div>
  );
}
