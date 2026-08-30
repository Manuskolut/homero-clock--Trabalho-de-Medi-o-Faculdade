"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import { formatarData, formatarMoeda, formatarNumeroOS, diasParaPrazo } from "@/lib/format";
import { ItemOrdemResumo } from "@/components/item-ordem-resumo";
import { OrdemCard } from "@/components/ordem-card";
import type { ordensProximasDoPrazo } from "@/lib/actions/ordens";
import Link from "next/link";
import { clsx } from "clsx";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SecaoRetratil({
  titulo,
  descricao,
  ordens,
  tom,
  isAdmin,
}: {
  titulo: string;
  descricao: string;
  ordens: Awaited<ReturnType<typeof ordensProximasDoPrazo>>;
  tom: "danger" | "warning" | "default";
  isAdmin: boolean;
}) {
  const [aberta, setAberta] = useState(true);

  const toneBorder = {
    danger: "border-[#E31717]/60",
    warning: "border-gold",
    default: "border-gold-light/40",
  }[tom];

  return (
    <div>
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        aria-expanded={aberta}
        className="w-full flex items-center justify-between gap-2 group"
      >
        <h2 className="text-sm font-heading tracking-wide font-semibold text-ink group-hover:text-gold transition-colors">
          {titulo}
        </h2>
        <ChevronIcon
          className={clsx(
            "h-4 w-4 text-ink shrink-0 transition-transform",
            !aberta && "-rotate-90"
          )}
        />
      </button>
      <p className="text-xs text-gray-light mb-3 text-left">{descricao}</p>

      {aberta && (
        <Card className={clsx("overflow-hidden border-2", toneBorder)}>
          {ordens.length === 0 ? (
            <p className="text-sm text-gray-light py-8 text-center">
              Nenhuma ordem nesta categoria.
            </p>
          ) : (
            <>
            <div className="md:hidden flex flex-col divide-y divide-gold-light/20">
              {ordens.map((ordem) => (
                <OrdemCard
                  key={ordem.id}
                  ordem={ordem}
                  datas={[{ label: "Previsão", valor: ordem.dataPrevista }]}
                  mostrarLoja={isAdmin}
                />
              ))}
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-light/40 text-left text-xs uppercase tracking-wide text-gray">
                    <th className="px-5 py-3 font-medium">OS</th>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Item</th>
                    <th className="px-5 py-3 font-medium">Previsão</th>
                    <th className="px-5 py-3 font-medium">Valor</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    {isAdmin && <th className="px-5 py-3 font-medium">Loja</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-light/20">
                  {ordens.map((ordem) => {
                    const atrasada = diasParaPrazo(ordem.dataPrevista) < 0;
                    return (
                    <tr
                      key={ordem.id}
                      className={clsx(
                        "hover:bg-gold-light/10 transition-colors",
                        atrasada && "bg-[#E31717]/[0.06]"
                      )}
                    >
                      <td
                        className={clsx(
                          "px-5 py-3",
                          atrasada && "border-l-[3px] border-l-[#E31717]"
                        )}
                      >
                        <Link
                          href={`/ordens/${ordem.id}`}
                          className="font-medium text-ink hover:text-gold"
                        >
                          #{formatarNumeroOS(ordem.numeroOS)}
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/clientes/${ordem.clienteId}`}
                          className="text-ink hover:text-gold"
                        >
                          {ordem.cliente.nome}
                        </Link>
                        <div className="text-xs text-gray-light">{ordem.cliente.telefone}</div>
                      </td>
                      <td className="px-5 py-3 text-gray">
                        <ItemOrdemResumo ordem={ordem} />
                      </td>
                      <td className="px-5 py-3 text-gray whitespace-nowrap">
                        {formatarData(ordem.dataPrevista)}
                      </td>
                      <td className="px-5 py-3 text-gray whitespace-nowrap">
                        {formatarMoeda(ordem.valorOrcado)}
                      </td>
                      <td className="px-5 py-3">
                        {atrasada ? <AtrasadaBadge /> : <StatusBadge status={ordem.status} tipoItem={ordem.tipoItem} />}
                      </td>
                      {isAdmin && (
                        <td className="px-5 py-3">
                          <LojaBadge nome={ordem.loja.nome} />
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
