"use server";

import { prisma } from "@/lib/prisma";
import { clienteSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { verifySession, resolverLojaAlvo, temAcesso, filtroLoja, requireAdmin } from "@/lib/dal";

export type ActionState = {
  ok: boolean;
  errors?: Record<string, string>;
  message?: string;
};

export async function criarCliente(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();

  const raw = {
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error) };
  }

  let lojaId: string;
  try {
    lojaId = resolverLojaAlvo(session, formData);
  } catch (e) {
    return { ok: false, errors: { lojaId: (e as Error).message } };
  }

  const cliente = await prisma.cliente.create({
    data: {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      email: parsed.data.email || null,
      lojaId,
    },
  });

  revalidatePath("/clientes");
  redirect(
    `/ordens/novo?lojaId=${lojaId}&nome=${encodeURIComponent(cliente.nome)}&telefone=${encodeURIComponent(cliente.telefone)}`
  );
}

export async function atualizarCliente(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();

  const atual = await prisma.cliente.findUnique({ where: { id } });
  if (!atual || !temAcesso(session, atual.lojaId)) {
    return { ok: false, errors: { _form: "Cliente não encontrado." } };
  }

  const raw = {
    nome: String(formData.get("nome") ?? ""),
    telefone: String(formData.get("telefone") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = clienteSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error) };
  }

  await prisma.cliente.update({
    where: { id },
    data: {
      nome: parsed.data.nome,
      telefone: parsed.data.telefone,
      email: parsed.data.email || null,
    },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}`);
}

// Exclusão restrita ao Admin. Cliente.id é obrigatório em Ordem (FK
// ON DELETE RESTRICT), então não dá pra apagar um cliente com ordens sem
// apagar as ordens junto — por decisão explícita, o Admin pode excluir um
// cliente mesmo com histórico, e isso apaga TODAS as ordens dele junto
// (ação irreversível, diferente do soft-delete usado em excluirOrdem).
export async function excluirCliente(id: string) {
  const session = await requireAdmin();

  const atual = await prisma.cliente.findUnique({
    where: { id },
    include: { _count: { select: { ordens: true } } },
  });
  if (!atual) {
    throw new Error("Cliente não encontrado.");
  }

  if (atual._count.ordens > 0) {
    console.warn(
      `[auditoria] admin ${session.nome} (${session.userId}) excluiu o cliente ` +
        `${atual.nome} (id ${atual.id}) e suas ${atual._count.ordens} ordem(ns) de serviço ` +
        `vinculada(s) em ${new Date().toISOString()}`
    );
  }

  await prisma.$transaction([
    prisma.ordem.deleteMany({ where: { clienteId: id } }),
    prisma.cliente.delete({ where: { id } }),
  ]);

  revalidatePath("/clientes");
  revalidatePath("/ordens");
  revalidatePath("/");
}

export async function buscarClientes(termo: string, lojaIdFiltro?: string) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);
  const q = termo.trim();

  return prisma.cliente.findMany({
    where: {
      ...(lojaId ? { lojaId } : {}),
      ...(q
        ? {
            OR: [
              { nome: { contains: q } },
              { telefone: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    include: { loja: true },
    orderBy: { nome: "asc" },
    take: 50,
  });
}

export async function buscarClientePorTelefone(telefone: string, lojaIdFiltro?: string) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);
  if (!lojaId) return null;

  const digitosBusca = telefone.replace(/\D/g, "");
  if (digitosBusca.length < 8) return null;

  const candidatos = await prisma.cliente.findMany({
    where: { lojaId },
    select: { id: true, nome: true, telefone: true },
  });
  return candidatos.find((c) => c.telefone.replace(/\D/g, "") === digitosBusca) ?? null;
}

export async function obterClienteComHistorico(id: string) {
  const session = await verifySession();
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      ordens: {
        where: { deletedAt: null },
        orderBy: { dataEntrada: "desc" },
      },
    },
  });
  if (!cliente || !temAcesso(session, cliente.lojaId)) return null;
  return cliente;
}

export async function obterClienteParaEdicao(id: string) {
  const session = await verifySession();
  const cliente = await prisma.cliente.findUnique({ where: { id } });
  if (!cliente || !temAcesso(session, cliente.lojaId)) return null;
  return cliente;
}

function flattenErrors(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
