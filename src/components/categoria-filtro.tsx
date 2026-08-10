"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CATEGORIA_PECA_OPTIONS } from "@/lib/validation";

export function CategoriaFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const atual = searchParams.get("categoria") ?? "";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="categoria" className="text-xs font-medium text-gray uppercase tracking-wide">
        Categoria
      </label>
      <select
        id="categoria"
        value={atual}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams.toString());
          if (e.target.value) params.set("categoria", e.target.value);
          else params.delete("categoria");
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
      >
        <option value="">Todas as categorias</option>
        {CATEGORIA_PECA_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
