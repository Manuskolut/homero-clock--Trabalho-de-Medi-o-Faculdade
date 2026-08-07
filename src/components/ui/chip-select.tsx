"use client";

import { useState } from "react";
import { clsx } from "clsx";

type ChipOption = { value: string; label: string };

/**
 * Seletor único em formato de chips/selos clicáveis. Reutilizável sempre que
 * precisar de uma avaliação rápida (ex: estado de uma peça) ou uma escolha
 * curta entre poucas opções, com destaque visual mais forte que um <select>.
 */
export function ChipSelect({
  name,
  options,
  defaultValue,
  colorMap,
}: {
  name: string;
  options: readonly ChipOption[];
  defaultValue?: string | null;
  colorMap?: Record<string, string>;
}) {
  const [selecionado, setSelecionado] = useState(defaultValue ?? "");

  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const ativo = selecionado === opt.value;
        const cor = colorMap?.[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setSelecionado(ativo ? "" : opt.value)}
            style={ativo && cor ? { backgroundColor: cor, borderColor: cor } : undefined}
            className={clsx(
              "px-3.5 py-2.5 rounded-full text-xs font-medium border transition-colors",
              ativo
                ? cor
                  ? "text-white"
                  : "bg-gold text-white border-gold"
                : "bg-cream text-gray border-gray-light/40 hover:border-gold-light"
            )}
          >
            {opt.label}
          </button>
        );
      })}
      <input type="hidden" name={name} value={selecionado} />
    </div>
  );
}
