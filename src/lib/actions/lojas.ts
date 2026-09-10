"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, verifySession } from "@/lib/dal";
import { revalidatePath } from "next/cache";

export async function listarLojasSelecionaveis() {
  await requireAdmin();
  return prisma.loja.findMany({
    where: { ativa: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}

// Versão sem restrição de Admin — usada onde qualquer sessão logada precisa
// escolher entre as lojas ativas (ex: loja destino no cadastro de peças).
export async function listarLojasAtivas() {
  await verifySession();
  return prisma.loja.findMany({
    where: { ativa: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
}

export async function listarLojasComTelefone() {
  await requireAdmin();
  return prisma.loja.findMany({
    where: { ativa: true },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true, telefone: true },
  });
}

export type ResultadoLoja = { ok: boolean; error?: string };

export async function atualizarTelefoneLoja(
  lojaId: string,
  novoTelefone: string
): Promise<ResultadoLoja> {
  await requireAdmin();

  await prisma.loja.update({
    where: { id: lojaId },
    data: { telefone: novoTelefone.trim() },
  });

  revalidatePath("/admin/lojas");
  return { ok: true };
}
