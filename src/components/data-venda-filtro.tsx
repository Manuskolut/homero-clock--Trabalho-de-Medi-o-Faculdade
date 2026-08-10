"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { clsx } from "clsx";

function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function mesAtualISO(): { inicio: string; fim: string } {
  const agora = new Date();
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fim = new Date(agora.getFullYear(), agora.getMonth() + 1, 0);
  return { inicio: inicio.toISOString().slice(0, 10), fim: fim.toISOString().slice(0, 10) };
}

function chip(ativo: boolean) {
  return clsx(
    "px-3 py-2 rounded-lg text-xs font-medium border transition-colors",
    ativo
      ? "bg-gold text-white border-gold"
      : "bg-white text-ink border-gray-light/50 hover:border-gold-light"
  );
}

export function DataVendaFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const de = searchParams.get("de") ?? "";
  const ate = searchParams.get("ate") ?? "";
  const hoje = hojeISO();
  const { inicio: inicioMes, fim: fimMes } = mesAtualISO();

  function aplicar(novoDe: string, novoAte: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (novoDe) params.set("de", novoDe);
    else params.delete("de");
    if (novoAte) params.set("ate", novoAte);
    else params.delete("ate");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray uppercase tracking-wide">Vendida em</span>
        <div className="flex flex-wrap gap-1.5">
          <button type="button" onClick={() => aplicar("", "")} className={chip(!de && !ate)}>
            Todas
          </button>
          <button
            type="button"
            onClick={() => aplicar(hoje, hoje)}
            className={chip(de === hoje && ate === hoje)}
          >
            Hoje
          </button>
          <button
            type="button"
            onClick={() => aplicar(inicioMes, fimMes)}
            className={chip(de === inicioMes && ate === fimMes)}
          >
            Este mês
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="dataVendaEspecifica"
          className="text-xs font-medium text-gray uppercase tracking-wide"
        >
          Dia específico
        </label>
        <input
          id="dataVendaEspecifica"
          type="date"
          value={de && de === ate ? de : ""}
          onChange={(e) => aplicar(e.target.value, e.target.value)}
          className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
        />
      </div>
    </div>
  );
}
