"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { StatusChart } from "@/components/status-chart";
import { OficinaChart, type OficinaDatum } from "@/components/oficina-chart";

type Aba = "status" | "oficina";

export function GraficoOrdensCard({
  porStatus,
  porOficina,
}: {
  porStatus: { status: string; total: number }[];
  porOficina: OficinaDatum[];
}) {
  const [aba, setAba] = useState<Aba>("status");

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
        Distribuição de ordens
      </h2>
      <div className="flex items-center gap-1">
        {(
          [
            { valor: "status", label: "Por status" },
            { valor: "oficina", label: "Por oficina" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.valor}
            type="button"
            onClick={() => setAba(opt.valor)}
            className={clsx(
              "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              aba === opt.valor
                ? "bg-gold text-white"
                : "text-ink/60 hover:text-ink hover:bg-gold-light/30"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {aba === "status" ? (
        <StatusChart dados={porStatus} />
      ) : (
        <OficinaChart dados={porOficina} />
      )}
    </div>
  );
}
