"use server";

import { prisma } from "@/lib/prisma";
import { verificarSenha } from "@/lib/hash";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export type LoginState = {
  ok: boolean;
  error?: string;
};

export async function login(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  if (!email || !senha) {
    return { ok: false, error: "Informe e-mail e senha." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });

  if (!usuario || !usuario.ativo) {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }

  const senhaValida = await verificarSenha(senha, usuario.senhaHash);
  if (!senhaValida) {
    return { ok: false, error: "E-mail ou senha inválidos." };
  }

  await createSession({
    userId: usuario.id,
    tipo: usuario.tipo,
    lojaId: usuario.lojaId,
    nome: usuario.nome,
  });

  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
