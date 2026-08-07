"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { criarContaAdmin } from "@/lib/actions/usuarios";
import type { ActionState } from "@/lib/actions/clientes";

const initialState: ActionState = { ok: true };

export function ContaAdminForm() {
  const [state, formAction, isPending] = useActionState(criarContaAdmin, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-lg">
      <TextField
        label="Nome"
        name="nome"
        required
        error={state.errors?.nome}
        placeholder="Ex: Maria (Administração)"
      />
      <TextField
        label="E-mail"
        name="email"
        type="email"
        required
        error={state.errors?.email}
        placeholder="admin@homeroclock.com.br"
      />
      <TextField
        label="Senha"
        name="senha"
        type="password"
        required
        error={state.errors?.senha}
        placeholder="Mínimo 8 caracteres"
      />

      {state.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Criando…" : "Criar conta admin"}
        </Button>
        <LinkButton href="/admin/contas" variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
