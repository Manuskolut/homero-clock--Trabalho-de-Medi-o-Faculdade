"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

function mesAtualISO(): string {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

export function MesFiltro() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const atual = searchParams.get("mes") || mesAtualISO();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor="mes" className="text-xs font-medium text-gray uppercase tracking-wide">
        Mês
      </label>
      <input
        id="mes"
        type="month"
        value={atual}
        max={mesAtualISO()}
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
