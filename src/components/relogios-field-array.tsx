"use client";

import { useState } from "react";
import {
  MAX_RELOGIOS_POR_ORDEM,
  TIPO_RELOGIO_OPTIONS,
  PULSEIRA_OPTIONS,
  ESTADO_PECA_OPTIONS,
} from "@/lib/validation";
import { ESTADO_PECA_COLOR_HEX, type RelogioDetalhe } from "@/lib/format";
import { ChipSelect } from "@/components/ui/chip-select";
import { CaixaIcon, PulseiraIcon, VidroIcon, MostradorIcon } from "@/components/icons/peca-icons";

type RelogioRow = RelogioDetalhe & { id: string };

let contadorId = 0;
function novoId() {
  contadorId += 1;
  return `novo-${contadorId}`;
}

const PECAS_ESTADO = [
  { campo: "estadoCaixa" as const, label: "Caixa", Icone: CaixaIcon },
  { campo: "estadoPulseira" as const, label: "Pulseira", Icone: PulseiraIcon },
  { campo: "estadoVidro" as const, label: "Vidro", Icone: VidroIcon },
  { campo: "estadoMostrador" as const, label: "Mostrador", Icone: MostradorIcon },
];

export function RelogiosFieldArray({
  defaultRelogios,
  error,
}: {
  defaultRelogios: RelogioDetalhe[];
  error?: string;
}) {
  const [linhas, setLinhas] = useState<RelogioRow[]>(() => {
    const base = defaultRelogios.length > 0 ? defaultRelogios : [{ modelo: "" }];
    return base.map((r) => ({ ...r, id: novoId() }));
  });

  function remover(id: string) {
    setLinhas((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  function adicionar() {
    setLinhas((prev) =>
      prev.length >= MAX_RELOGIOS_POR_ORDEM ? prev : [...prev, { modelo: "", id: novoId() }]
    );
  }

  function atualizarModelo(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, modelo: valor } : l)));
  }

  function atualizarDescricao(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, descricao: valor } : l)));
  }

  const atingiuLimite = linhas.length >= MAX_RELOGIOS_POR_ORDEM;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-ink">
        Relógios
        <span className="text-gold ml-0.5">*</span>
      </label>

      <div className="flex flex-col gap-4">
        {linhas.map((linha, i) => (
          <div
            key={linha.id}
            className="rounded-xl border border-gray-light/40 bg-white p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gold uppercase tracking-wide">
                Relógio {i + 1}
              </span>
              {linhas.length > 1 && (
                <button
                  type="button"
                  onClick={() => remover(linha.id)}
                  aria-label={`Remover Relógio ${i + 1}`}
                  className="h-7 w-7 rounded-lg border border-gray-light/50 text-gray hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center text-base leading-none"
                >
                  −
                </button>
              )}
            </div>

            <input
              name="modeloRelogio"
              value={linha.modelo}
              onChange={(e) => atualizarModelo(linha.id, e.target.value)}
              placeholder="Modelo — ex: Rolex Submariner automático"
              className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-light">Tipo do relógio</span>
                <ChipSelect
                  name="tipoRelogio"
                  options={TIPO_RELOGIO_OPTIONS}
                  defaultValue={linha.tipo}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-light">Apresentação (pulseira)</span>
                <ChipSelect
                  name="pulseiraRelogio"
                  options={PULSEIRA_OPTIONS}
                  defaultValue={linha.pulseira}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2 border-t border-gold-light/30">
              <span className="text-xs text-gray-light">
                Estado das peças na entrada
                <span className="text-gold ml-0.5">*</span>
              </span>
              <div className="flex flex-col gap-2">
                {PECAS_ESTADO.map(({ campo, label, Icone }) => (
                  <div
                    key={campo}
                    className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap"
                  >
                    <span className="flex items-center gap-2 text-sm text-ink w-28 shrink-0">
                      <Icone className="h-4 w-4 text-gold shrink-0" />
                      {label}
                    </span>
                    <ChipSelect
                      name={`${campo}Relogio`}
                      options={ESTADO_PECA_OPTIONS}
                      defaultValue={linha[campo]}
                      colorMap={ESTADO_PECA_COLOR_HEX}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 pt-2 border-t border-gold-light/30">
              <label htmlFor={`descricao-${linha.id}`} className="text-xs text-gray-light">
                Descrição do serviço deste relógio
                <span className="text-gold ml-0.5">*</span>
              </label>
              <textarea
                id={`descricao-${linha.id}`}
                name="descricaoRelogio"
                value={linha.descricao ?? ""}
                onChange={(e) => atualizarDescricao(linha.id, e.target.value)}
                placeholder="Defeito relatado pelo cliente para este relógio…"
                className="rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light min-h-16 resize-y focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
              />
            </div>
          </div>
        ))}
      </div>

      {atingiuLimite ? (
        <span className="text-xs text-gray-light">
          Limite máximo de {MAX_RELOGIOS_POR_ORDEM} relógios por ordem
        </span>
      ) : (
        <button
          type="button"
          onClick={adicionar}
          className="self-start text-sm font-medium text-gold hover:underline"
        >
          + Adicionar outro relógio
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
