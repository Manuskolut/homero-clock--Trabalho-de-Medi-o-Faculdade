"use client";

import { useActionState } from "react";
import { TextField, SelectField } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions/clientes";

const initialState: ActionState = { ok: true };

type LojaOption = { id: string; nome: string };

export function ClienteForm({
  action,
  defaultValues,
  lojas,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: { nome: string; telefone: string; email: string | null };
  /** Presente só quando a sessão é Admin — permite escolher a loja do cliente (só na criação). */
  lojas?: LojaOption[];
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const isEdicao = !!defaultValues;

  return (
    <form action={formAction} className="flex flex-col gap-5 w-full">
      {!isEdicao && lojas && (
        <SelectField
          label="Loja"
          name="lojaId"
          required
          defaultValue=""
          error={state.errors?.lojaId}
        >
          <option value="">Selecione a loja…</option>
          {lojas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </SelectField>
      )}
      <TextField
        label="Nome completo"
        name="nome"
        required
        defaultValue={defaultValues?.nome}
        error={state.errors?.nome}
        placeholder="Ex: Maria da Silva"
      />
      <TextField
        label="Telefone"
        name="telefone"
        required
        defaultValue={defaultValues?.telefone}
        error={state.errors?.telefone}
        placeholder="Ex: (11) 91234-5678"
      />
      <TextField
        label="E-mail (opcional)"
        name="email"
        type="email"
        defaultValue={defaultValues?.email ?? ""}
        error={state.errors?.email}
        placeholder="Ex: cliente@email.com"
      />

      {state.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvando…"
            : isEdicao
              ? "Salvar cliente"
              : "Salvar e continuar para a ordem"}
        </Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
