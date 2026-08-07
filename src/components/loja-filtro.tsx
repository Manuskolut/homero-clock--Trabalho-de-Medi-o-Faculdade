"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

type LojaOption = { id: string; nome: string };

export function LojaFiltro({ lojas }: { lojas: LojaOption[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const atual = searchParams.get("loja") ?? "";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="loja" className="text-xs font-medium text-gray uppercase tracking-wide">
        Loja
      </label>
      <select
        id="loja"
        value={atual}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set("loja", e.target.value);
          else params.delete("loja");
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
      >
        <option value="">Todas as lojas</option>
        {lojas.map((l) => (
          <option key={l.id} value={l.id}>
            {l.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
