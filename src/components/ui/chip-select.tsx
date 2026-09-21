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
  onChange,
  disabled,
  nowrap,
}: {
  name: string;
  options: readonly ChipOption[];
  defaultValue?: string | null;
  colorMap?: Record<string, string>;
  onChange?: (valor: string) => void;
  disabled?: boolean;
  // Mantém as opções numa única linha (com scroll horizontal se não couber)
  // em vez de quebrar para a próxima linha — usado quando o espaço vertical
  // do layout não pode variar conforme o número de opções.
  nowrap?: boolean;
}) {
  const [selecionado, setSelecionado] = useState(defaultValue ?? "");

  function selecionar(valor: string) {
    setSelecionado(valor);
    onChange?.(valor);
  }

  return (
    <div
      className={clsx(
        "flex gap-1.5",
        nowrap ? "flex-nowrap overflow-x-auto pb-1" : "flex-wrap"
      )}
    >
      {options.map((opt) => {
        const ativo = selecionado === opt.value;
        const cor = colorMap?.[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => selecionar(ativo ? "" : opt.value)}
            style={ativo && cor ? { backgroundColor: cor, borderColor: cor } : undefined}
            className={clsx(
              "px-3.5 py-2.5 rounded-full text-xs font-medium border transition-colors",
              nowrap && "shrink-0",
              disabled
                ? "bg-cream text-gray-light border-gray-light/30 cursor-not-allowed opacity-60"
                : ativo
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
