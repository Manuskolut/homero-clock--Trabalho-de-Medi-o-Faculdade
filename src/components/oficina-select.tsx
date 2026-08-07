"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { atualizarOficinaOrdem } from "@/lib/actions/ordens";
import { OFICINA_OPTIONS } from "@/lib/validation";

export function OficinaSelect({
  id,
  oficina,
  somenteLeitura = false,
}: {
  id: string;
  oficina: string | null;
  somenteLeitura?: boolean;
}) {
  const [valor, setValor] = useState(oficina ?? "");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <select
      value={valor}
      disabled={isPending || somenteLeitura}
      onChange={(e) => {
        const novaOficina = e.target.value;
        const anterior = valor;
        setValor(novaOficina);
        startTransition(async () => {
          try {
            await atualizarOficinaOrdem(id, novaOficina);
            router.refresh();
          } catch {
            setValor(anterior);
          }
        });
      }}
      className="rounded-lg border border-gray-light/50 bg-white px-2.5 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <option value="">Selecione…</option>
      {OFICINA_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
