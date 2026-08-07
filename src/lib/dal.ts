import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { decrypt, getSessionCookie } from "@/lib/session";
import type { TipoUsuario } from "@prisma/client";

export type Session = {
  userId: string;
  tipo: TipoUsuario;
  lojaId: string | null;
  nome: string;
};

export const verifySession = cache(async (): Promise<Session> => {
  const cookie = await getSessionCookie();
  const payload = await decrypt(cookie);

  if (!payload?.userId) {
    redirect("/login");
  }

  return {
    userId: payload.userId,
    tipo: payload.tipo,
    lojaId: payload.lojaId,
    nome: payload.nome,
  };
});

export const getOptionalSession = cache(async (): Promise<Session | null> => {
  const cookie = await getSessionCookie();
  const payload = await decrypt(cookie);
  if (!payload?.userId) return null;

  return {
    userId: payload.userId,
    tipo: payload.tipo,
    lojaId: payload.lojaId,
    nome: payload.nome,
  };
});

export async function requireAdmin(): Promise<Session> {
  const session = await verifySession();
  if (session.tipo !== "ADMIN") {
    throw new Error("Ação restrita ao administrador.");
  }
  return session;
}

/** Para uso em páginas (não Server Actions): redireciona em vez de lançar erro. */
export async function requireAdminPagina(): Promise<Session> {
  const session = await verifySession();
  if (session.tipo !== "ADMIN") {
    redirect("/");
  }
  return session;
}

/**
 * Resolve a loja-alvo de uma mutação de escrita: conta de Loja sempre usa a
 * própria sessão (nunca confia em valor vindo do form); Admin precisa
 * escolher explicitamente via campo "lojaId" do formData.
 */
export function resolverLojaAlvo(
  session: Session,
  formData: FormData
): string {
  if (session.tipo === "LOJA") {
    if (!session.lojaId) {
      throw new Error("Sessão de loja sem lojaId associado.");
    }
    return session.lojaId;
  }

  const lojaId = formData.get("lojaId");
  if (typeof lojaId !== "string" || lojaId.trim() === "") {
    throw new Error("Selecione a loja.");
  }
  return lojaId;
}

/**
 * Checagem de posse (leitura e escrita): Admin sempre tem acesso; conta de
 * Loja só a registros da própria loja.
 */
export function temAcesso(session: Session, registroLojaId: string) {
  return session.tipo === "ADMIN" || registroLojaId === session.lojaId;
}

/** Filtro de loja para listagens: Loja sempre a própria; Admin usa o filtro
 * opcional escolhido na UI (ou undefined = sem filtro, todas as lojas). */
export function filtroLoja(session: Session, lojaIdFiltro?: string): string | undefined {
  return session.tipo === "LOJA" ? (session.lojaId ?? undefined) : lojaIdFiltro;
}

// Módulo de Peças: só a loja Mueller cadastra peças; só Jockey e Patio Batel
// confirmam recebimento (peças com destino Mueller já nascem disponíveis).
export function podeCadastrarPecas(session: Session): boolean {
  return session.tipo === "ADMIN" || session.lojaId === "mueller";
}

export function podeConfirmarRecebimentoPecas(session: Session): boolean {
  return (
    session.tipo === "ADMIN" ||
    session.lojaId === "jockey" ||
    session.lojaId === "patio-batel"
  );
}

/** Para uso em páginas: redireciona quem não pode cadastrar peças (só Mueller/Admin). */
export async function requireMuellerOuAdminPagina(): Promise<Session> {
  const session = await verifySession();
  if (!podeCadastrarPecas(session)) {
    redirect("/pecas");
  }
  return session;
}

/** Para uso em páginas: redireciona quem não pode confirmar recebimento de peças. */
export async function requireConfirmacaoPecasPagina(): Promise<Session> {
  const session = await verifySession();
  if (!podeConfirmarRecebimentoPecas(session)) {
    redirect("/pecas");
  }
  return session;
}
