"use client";

import { useActionState, useState } from "react";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = { ok: true };

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.36 5.3A10.87 10.87 0 0 1 12 5c7 0 10.5 7 10.5 7a13.5 13.5 0 0 1-3.14 4.06M6.4 6.4C3.86 8.1 1.5 12 1.5 12s3.5 7 10.5 7a10.6 10.6 0 0 0 3.6-.63"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

      <div className="flex flex-col gap-1.5">
        <label htmlFor="senha" className="text-sm font-medium text-ink">
          Senha
          <span className="text-gold ml-0.5">*</span>
        </label>
        <div className="relative">
          <input
            id="senha"
            name="senha"
            type={mostrarSenha ? "text" : "password"}
            required
            className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 pr-10 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold transition-colors"
          />
          <button
            type="button"
            onClick={() => setMostrarSenha((v) => !v)}
            aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
            className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-light hover:text-ink transition-colors"
          >
            {mostrarSenha ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
