"use client";

import { useRouter } from "next/navigation";
import { clsx } from "clsx";

/**
 * Seta de voltar — navega para a página anterior (histórico do navegador).
 * Nunca envia formulários nem salva dados: se o usuário não confirmou a ação
 * (ex: não clicou em "Salvar"), os campos preenchidos são simplesmente
 * descartados ao sair da página, como já acontece por padrão na navegação.
 */
export function BackButton({ className }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      aria-label="Voltar"
      className={clsx(
        "inline-flex items-center justify-center h-9 w-9 shrink-0 rounded-lg text-ink hover:bg-gold-light/20 transition-colors",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M15 5L8 12L15 19"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
