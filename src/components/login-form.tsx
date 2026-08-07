"use client";

import { useActionState } from "react";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = { ok: true };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField
        label="E-mail"
        name="email"
        type="email"
        required
        autoFocus
        placeholder="loja@homeroclock.com.br"
      />
      <TextField label="Senha" name="senha" type="password" required />

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
