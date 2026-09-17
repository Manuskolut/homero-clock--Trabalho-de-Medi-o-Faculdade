"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

// Ciclo de fechamento de caixa (dia 6 a dia 5) que contém hoje, nomeado pelo
// mês em que começa — mesma regra de cicloContendo() em actions/financeiro.
function cicloAtualISO(): string {
  const agora = new Date();
  const mesIndex = agora.getDate() >= 6 ? agora.getMonth() : agora.getMonth() - 1;
  const data = new Date(agora.getFullYear(), mesIndex, 1);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}`;
}

export function MesFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const atual = searchParams.get("mes") || cicloAtualISO();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="mes" className="text-xs font-medium text-gray uppercase tracking-wide">
        Ciclo (mês de início)
      </label>
      <input
        id="mes"
        type="month"
        value={atual}
        max={cicloAtualISO()}
        onChange={(e) => {
          if (!e.target.value) return;
          const params = new URLSearchParams(searchParams.toString());
          params.set("mes", e.target.value);
          router.push(`${pathname}?${params.toString()}`);
        }}
        className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
      />
    </div>
  );
}
