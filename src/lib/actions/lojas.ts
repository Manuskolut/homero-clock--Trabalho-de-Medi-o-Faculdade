"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin, verifySession } from "@/lib/dal";

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
