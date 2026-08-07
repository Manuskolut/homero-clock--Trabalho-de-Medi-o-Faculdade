"use server";

import { prisma } from "@/lib/prisma";
import { hashSenha } from "@/lib/hash";
import { requireAdmin } from "@/lib/dal";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/actions/clientes";

export async function listarUsuarios() {
  await requireAdmin();
  return prisma.usuario.findMany({
    orderBy: [{ tipo: "asc" }, { nome: "asc" }],
    select: {
      id: true,
      email: true,
      nome: true,
      tipo: true,
      ativo: true,
      createdAt: true,
      loja: { select: { nome: true } },
    },
  });
}

export async function obterUsuario(id: string) {
  await requireAdmin();
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      nome: true,
      tipo: true,
      ativo: true,
      loja: { select: { nome: true } },
    },
  });
}

export async function criarContaAdmin(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireAdmin();

  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");

  const errors: Record<string, string> = {};
  if (nome.length < 2) errors.nome = "Informe o nome.";
  if (!email.includes("@")) errors.email = "Informe um e-mail válido.";
  if (senha.length < 8) errors.senha = "A senha deve ter ao menos 8 caracteres.";
  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return { ok: false, errors: { email: "Já existe uma conta com este e-mail." } };
  }

  const senhaHash = await hashSenha(senha);
  await prisma.usuario.create({
    data: { nome, email, senhaHash, tipo: "ADMIN", lojaId: null },
  });

  revalidatePath("/admin/contas");
  redirect("/admin/contas");
}

export type ResultadoConta = { ok: boolean; error?: string };

export async function resetarSenhaUsuario(
  id: string,
  novaSenha: string
): Promise<ResultadoConta> {
  await requireAdmin();

  if (novaSenha.length < 8) {
    return { ok: false, error: "A senha deve ter ao menos 8 caracteres." };
  }

  const senhaHash = await hashSenha(novaSenha);
  await prisma.usuario.update({ where: { id }, data: { senhaHash } });
  revalidatePath("/admin/contas");
  return { ok: true };
}

export async function alternarAtivoUsuario(
  id: string,
  ativo: boolean
): Promise<ResultadoConta> {
  const session = await requireAdmin();
  if (!ativo && id === session.userId) {
    return { ok: false, error: "Você não pode desativar a própria conta." };
  }
  await prisma.usuario.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/contas");
  return { ok: true };
}

// Exclusão definitiva (hard delete) — só permitida para contas já
// desativadas, como confirmação em duas etapas. Usuario não tem outras
// tabelas referenciando seu id, então remover a linha é seguro.
export async function excluirUsuario(id: string): Promise<ResultadoConta> {
  const session = await requireAdmin();
  if (id === session.userId) {
    return { ok: false, error: "Você não pode excluir a própria conta." };
  }

  const atual = await prisma.usuario.findUnique({ where: { id }, select: { ativo: true } });
  if (!atual) {
    return { ok: false, error: "Conta não encontrada." };
  }
  if (atual.ativo) {
    return { ok: false, error: "Desative a conta antes de excluí-la." };
  }

  await prisma.usuario.delete({ where: { id } });
  revalidatePath("/admin/contas");
  return { ok: true };
}

export async function atualizarEmailUsuario(
  id: string,
  novoEmail: string
): Promise<ResultadoConta> {
  await requireAdmin();

  const email = novoEmail.trim();
  if (!email.includes("@")) {
    return { ok: false, error: "Informe um e-mail válido." };
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente && existente.id !== id) {
    return { ok: false, error: "Já existe uma conta com este e-mail." };
  }

  await prisma.usuario.update({ where: { id }, data: { email } });
  revalidatePath("/admin/contas");
  revalidatePath(`/admin/contas/${id}`);
  return { ok: true };
}
