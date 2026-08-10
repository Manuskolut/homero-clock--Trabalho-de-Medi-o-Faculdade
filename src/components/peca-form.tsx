"use client";

import { useActionState, useState } from "react";
import { TextField, TextAreaField, SelectField, FileField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  CATEGORIA_PECA_OPTIONS,
  CATEGORIAS_COM_PESO,
  CATEGORIAS_COM_REFERENCIA,
} from "@/lib/validation";
import type { ActionState } from "@/lib/actions/clientes";
import { clsx } from "clsx";

const initialState: ActionState = { ok: true };

type LojaOption = { id: string; nome: string };
type Categoria = "JOIA" | "FOLHEADO" | "RELOGIO";

export function PecaForm({
  action,
  lojas,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  lojas: LojaOption[];
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const mostrarPeso = categoria
    ? (CATEGORIAS_COM_PESO as readonly string[]).includes(categoria)
    : false;
  const mostrarReferencia = categoria
    ? (CATEGORIAS_COM_REFERENCIA as readonly string[]).includes(categoria)
    : false;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">
          Categoria
          <span className="text-gold ml-0.5">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIA_PECA_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategoria(opt.value)}
              className={clsx(
                "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                categoria === opt.value
                  ? "bg-gold text-white border-gold shadow-sm"
                  : "bg-white text-ink border-gray-light/50 hover:border-gold-light"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="categoria" value={categoria ?? ""} />
        {state.errors?.categoria && (
          <span className="text-xs text-red-600">{state.errors.categoria}</span>
        )}
      </div>

      {categoria && (
        <>
          <TextField
            label="Nome da peça"
            name="nome"
            required
            error={state.errors?.nome}
            placeholder="Ex: Pulseira de couro marrom"
          />
          <TextAreaField
            label="Descrição (opcional)"
            name="descricao"
            error={state.errors?.descricao}
            placeholder="Detalhes adicionais da peça…"
          />
          <TextField
            label="Preço"
            name="preco"
            type="number"
            step="0.01"
            min="0"
            required
            error={state.errors?.preco}
            placeholder="Ex: 89.90"
          />
          {(mostrarPeso || mostrarReferencia) && (
            <div className="grid sm:grid-cols-2 gap-5">
              {mostrarPeso && (
                <TextField
                  label="Peso (opcional)"
                  name="peso"
                  error={state.errors?.peso}
                  placeholder="Ex: 3g"
                />
              )}
              {mostrarReferencia && (
                <TextField
                  label="Referência (opcional)"
                  name="referencia"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  error={state.errors?.referencia}
                  placeholder="Ex: 12345"
                />
              )}
            </div>
          )}
          <FileField
            label="Foto (opcional)"
            name="foto"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            error={state.errors?.foto}
          />
          <SelectField
            label="Loja destino"
            name="lojaDestinoId"
            error={state.errors?.lojaDestinoId}
            defaultValue=""
          >
            <option value="">Mueller</option>
            {lojas
              .filter((loja) => loja.id !== "mueller")
              .map((loja) => (
                <option key={loja.id} value={loja.id}>
                  {loja.nome}
                </option>
              ))}
          </SelectField>

          {state.errors?._form && <p className="text-sm text-red-600">{state.errors._form}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando…" : "Cadastrar peça"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
