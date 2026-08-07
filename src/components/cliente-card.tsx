import Link from "next/link";
import { LojaBadge } from "@/components/loja-badge";

type ClienteCardData = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  loja?: { nome: string };
};

export function ClienteCard({
  cliente,
  mostrarLoja = false,
}: {
  cliente: ClienteCardData;
  mostrarLoja?: boolean;
}) {
  return (
    <Link
      href={`/clientes/${cliente.id}`}
      className="flex flex-col gap-1 px-4 py-3.5 hover:bg-gold-light/10 transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-ink">{cliente.nome}</span>
        {mostrarLoja && cliente.loja && <LojaBadge nome={cliente.loja.nome} />}
      </div>
      <div className="text-xs text-gray-light">
        {cliente.telefone}
        {cliente.email && <> · {cliente.email}</>}
      </div>
    </Link>
  );
}
