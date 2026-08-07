"use client";

import { useActionState } from "react";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/clientes";

const initialState: ActionState = { ok: true };

type LojaOption = { id: string; nome: string };

export function PecaForm({
  action,
  lojas,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  lojas: LojaOption[];
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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
      <SelectField
        label="Loja destino"
        name="lojaDestinoId"
        required
        error={state.errors?.lojaDestinoId}
        defaultValue=""
      >
        <option value="" disabled>
          Selecione a loja destino…
        </option>
        {lojas.map((loja) => (
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
    </form>
  );
}
