"use client";

import { useState } from "react";
import {
  MAX_PECAS_JOIA,
  TIPOS_CONSERTO_JOIA_OPTIONS,
  TAMANHO_ARO_OPTIONS,
  TIPO_CONSERTO_COM_ARO,
  TIPO_CONSERTO_OUTRO,
  TIPO_CONSERTO_CONFECCAO,
  TIPO_CONSERTO_FOLHEACAO,
  DEIXOU_OURO_OPTIONS,
  COR_FOLHEACAO_OPTIONS,
} from "@/lib/validation";
import type { JoiaPeca } from "@/lib/format";
import { clsx } from "clsx";

type PecaRow = JoiaPeca & { id: string };

let contadorId = 0;
function novoId() {
  contadorId += 1;
  return `nova-peca-${contadorId}`;
}

export function JoiasFieldArray({
  defaultPecas,
  error,
}: {
  defaultPecas: JoiaPeca[];
  error?: string;
}) {
  const [linhas, setLinhas] = useState<PecaRow[]>(() => {
    const base =
      defaultPecas.length > 0 ? defaultPecas : [{ descricao: "", tiposConserto: [] }];
    return base.map((p) => ({ ...p, id: novoId() }));
  });

  function remover(id: string) {
    setLinhas((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  function adicionar() {
    setLinhas((prev) =>
      prev.length >= MAX_PECAS_JOIA
        ? prev
        : [...prev, { descricao: "", tiposConserto: [], id: novoId() }]
    );
  }

  function atualizarDescricao(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, descricao: valor } : l)));
  }

  function alternarTipoConserto(id: string, tipo: string) {
    setLinhas((prev) =>
      prev.map((l) => {
        if (l.id !== id) return l;
        const ativo = l.tiposConserto.includes(tipo);
        return {
          ...l,
          tiposConserto: ativo
            ? l.tiposConserto.filter((t) => t !== tipo)
            : [...l.tiposConserto, tipo],
        };
      })
    );
  }

  function atualizarTamanhoAro(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, tamanhoAro: valor } : l)));
  }

  function atualizarPeso(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, peso: valor } : l)));
  }

  function atualizarOutroConserto(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, outroConserto: valor } : l)));
  }

  function atualizarDeixouOuro(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, deixouOuro: valor } : l)));
  }

  function atualizarPesoOuro(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, pesoOuro: valor } : l)));
  }

  function atualizarCorFolheacao(id: string, valor: string) {
    setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, corFolheacao: valor } : l)));
  }

  const atingiuLimite = linhas.length >= MAX_PECAS_JOIA;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-ink">
        Peças
        <span className="text-gold ml-0.5">*</span>
      </label>

      <div className="flex flex-col gap-4">
        {linhas.map((linha, i) => {
          const precisaAro = linha.tiposConserto.includes(TIPO_CONSERTO_COM_ARO);
          const precisaOutro = linha.tiposConserto.includes(TIPO_CONSERTO_OUTRO);
          const precisaOuro = linha.tiposConserto.includes(TIPO_CONSERTO_CONFECCAO);
          const precisaCorFolheacao = linha.tiposConserto.includes(TIPO_CONSERTO_FOLHEACAO);
          return (
            <div
              key={linha.id}
              className="rounded-xl border border-gray-light/40 bg-white p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gold uppercase tracking-wide">
                  Peça {i + 1}
                </span>
                {linhas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remover(linha.id)}
                    aria-label={`Remover Peça ${i + 1}`}
                    className="h-7 w-7 rounded-lg border border-gray-light/50 text-gray hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center text-base leading-none"
                  >
                    −
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <input
                  name={`descricaoPeca_${i}`}
                  value={linha.descricao}
                  onChange={(e) => atualizarDescricao(linha.id, e.target.value)}
                  placeholder='O que é a peça — ex: "anel de ouro", "corrente de prata"'
                  className="flex-1 rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                />
                <input
                  name={`pesoPeca_${i}`}
                  value={linha.peso ?? ""}
                  onChange={(e) => atualizarPeso(linha.id, e.target.value)}
                  placeholder="Peso — ex: 3g"
                  className="w-28 shrink-0 rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-gray-light">Tipo de conserto</span>
                <div className="grid sm:grid-cols-2 gap-2">
                  {TIPOS_CONSERTO_JOIA_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-sm text-ink rounded-lg border border-gray-light/50 bg-white px-3 py-2 cursor-pointer hover:border-gold-light transition-colors"
                    >
                      <input
                        type="checkbox"
                        name={`tipoConsertoPeca_${i}`}
                        value={opt.value}
                        checked={linha.tiposConserto.includes(opt.value)}
                        onChange={() => alternarTipoConserto(linha.id, opt.value)}
                        className="accent-gold h-4 w-4"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {precisaAro && (
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor={`tamanhoAroPeca_${i}`}
                    className="text-xs text-gray-light"
                  >
                    Tamanho do aro
                  </label>
                  <select
                    id={`tamanhoAroPeca_${i}`}
                    name={`tamanhoAroPeca_${i}`}
                    value={linha.tamanhoAro ?? ""}
                    onChange={(e) => atualizarTamanhoAro(linha.id, e.target.value)}
                    className={clsx(
                      "w-full sm:w-40 rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink",
                      "focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    )}
                  >
                    <option value="">Selecione…</option>
                    {TAMANHO_ARO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {precisaOutro && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`outroConserto-${linha.id}`} className="text-xs text-gray-light">
                    Descreva o tipo de conserto
                  </label>
                  <input
                    id={`outroConserto-${linha.id}`}
                    name={`outroConsertoPeca_${i}`}
                    value={linha.outroConserto ?? ""}
                    onChange={(e) => atualizarOutroConserto(linha.id, e.target.value)}
                    placeholder="Ex: gravação personalizada"
                    className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>
              )}

              {precisaOuro && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor={`deixouOuro-${linha.id}`} className="text-xs text-gray-light">
                      A cliente deixou o ouro?
                    </label>
                    <select
                      id={`deixouOuro-${linha.id}`}
                      name={`deixouOuroPeca_${i}`}
                      value={linha.deixouOuro ?? ""}
                      onChange={(e) => atualizarDeixouOuro(linha.id, e.target.value)}
                      className="w-full sm:w-40 rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                    >
                      <option value="">Selecione…</option>
                      {DEIXOU_OURO_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {linha.deixouOuro === "SIM" && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor={`pesoOuro-${linha.id}`} className="text-xs text-gray-light">
                        Peso do ouro
                      </label>
                      <input
                        id={`pesoOuro-${linha.id}`}
                        name={`pesoOuroPeca_${i}`}
                        value={linha.pesoOuro ?? ""}
                        onChange={(e) => atualizarPesoOuro(linha.id, e.target.value)}
                        placeholder="Peso — ex: 3g"
                        className="w-full sm:w-40 rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                      />
                    </div>
                  )}
                </div>
              )}

              {precisaCorFolheacao && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`corFolheacao-${linha.id}`} className="text-xs text-gray-light">
                    Cor da folheação
                  </label>
                  <select
                    id={`corFolheacao-${linha.id}`}
                    name={`corFolheacaoPeca_${i}`}
                    value={linha.corFolheacao ?? ""}
                    onChange={(e) => atualizarCorFolheacao(linha.id, e.target.value)}
                    className="w-full sm:w-48 rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  >
                    <option value="">Selecione…</option>
                    {COR_FOLHEACAO_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {atingiuLimite ? (
        <span className="text-xs text-gray-light">
          Limite máximo de {MAX_PECAS_JOIA} peças por ordem
        </span>
      ) : (
        <button
          type="button"
          onClick={adicionar}
          className="self-start text-sm font-medium text-gold hover:underline"
        >
          + Adicionar outra peça
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
