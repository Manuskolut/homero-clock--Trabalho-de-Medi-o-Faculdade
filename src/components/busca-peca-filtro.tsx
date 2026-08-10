"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function BuscaPecaFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [valor, setValor] = useState(searchParams.get("busca") ?? "");

  function aplicar() {
    const params = new URLSearchParams(searchParams.toString());
    if (valor.trim()) params.set("busca", valor.trim());
    else params.delete("busca");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
      <label htmlFor="buscaPeca" className="text-xs font-medium text-gray uppercase tracking-wide">
        Buscar
      </label>
      <div className="flex gap-2">
        <input
          id="buscaPeca"
          type="search"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              aplicar();
            }
          }}
          placeholder="Nome ou referência…"
          className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
        />
        <button
          type="button"
          onClick={aplicar}
          className="rounded-lg bg-gold text-white px-4 py-2.5 text-sm font-medium shrink-0"
        >
          Buscar
        </button>
      </div>
    </div>
  );
}
