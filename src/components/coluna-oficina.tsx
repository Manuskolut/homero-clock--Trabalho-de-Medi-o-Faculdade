"use client";

import { useState } from "react";
import { clsx } from "clsx";
import Link from "next/link";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { LojaBadge } from "@/components/loja-badge";
import {
  formatarNumeroOS,
  parseRelogiosDetalhes,
  estaAtrasada,
  OFICINA_COLOR_HEX,
} from "@/lib/format";
import type { listarOrdens } from "@/lib/actions/ordens";

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 9L12 15L18 9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type ColunaData = {
  value: string;
  label: string;
  ordens: Awaited<ReturnType<typeof listarOrdens>>;
};

export function ColunaOficina({
  coluna,
  isAdmin,
  className,
}: {
  coluna: ColunaData;
  isAdmin: boolean;
  className?: string;
}) {
  const [aberta, setAberta] = useState(false);

  return (
    <div className={clsx("flex flex-col gap-3", className)}>
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        aria-expanded={aberta}
        className="flex items-center gap-2 group text-left"
      >
        <span
          className="h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: OFICINA_COLOR_HEX[coluna.value] }}
        />
        <h3 className="font-heading tracking-wide font-semibold text-ink group-hover:text-gold transition-colors flex-1">
          {coluna.label} ({coluna.ordens.length})
        </h3>
        <ChevronIcon
          className={clsx(
            "h-4 w-4 text-ink shrink-0 transition-transform",
            !aberta && "-rotate-90"
          )}
        />
      </button>

      {aberta && (
        <div className="flex flex-col gap-2.5">
          {coluna.ordens.length === 0 ? (
            <p className="text-xs text-gray-light bg-white/70 border border-gray-light/30 rounded-lg px-3 py-6 text-center">
              Nenhuma ordem
            </p>
          ) : (
            coluna.ordens.map((ordem) => {
              const atrasada = estaAtrasada(ordem.dataPrevista, ordem.status);
              const modelos = parseRelogiosDetalhes(ordem.relogiosDetalhes)
                .map((r) => r.modelo)
                .join(", ");
              return (
                <Link
                  key={ordem.id}
                  href={`/ordens/${ordem.id}`}
                  className="rounded-lg border border-gray-light/40 bg-white p-3 flex flex-col gap-1.5 hover:border-gold-light hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-heading font-semibold text-ink">
                      #{formatarNumeroOS(ordem.numeroOS)}
                    </span>
                    {atrasada ? (
                      <AtrasadaBadge />
                    ) : (
                      <StatusBadge status={ordem.status} tipoItem={ordem.tipoItem} />
                    )}
                  </div>
                  <div className="text-sm text-ink truncate">{ordem.cliente.nome}</div>
                  {modelos && <div className="text-xs text-gray truncate">{modelos}</div>}
                  {isAdmin && <LojaBadge nome={ordem.loja.nome} />}
                </Link>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
