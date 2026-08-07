"use server";

import { prisma } from "@/lib/prisma";
import { pecaSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import type { ActionState } from "@/lib/actions/clientes";
import {
  verifySession,
  temAcesso,
  filtroLoja,
  podeCadastrarPecas,
  podeConfirmarRecebimentoPecas,
  type Session,
} from "@/lib/dal";
import { podeReativarPeca } from "@/lib/format";

const CODIGO_BARRAS_LARGURA = 8;

function flattenErrors(error: import("zod").ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

// Resolve a loja que está operando uma ação sem formulário (dar baixa,
// reativar): conta de Loja sempre usa a própria sessão; Admin precisa
// escolher explicitamente (não tem lojaId próprio).
function resolverLojaOperacao(session: Session, lojaIdParam?: string): string {
  if (session.tipo === "LOJA") {
    if (!session.lojaId) throw new Error("Sessão de loja sem lojaId associado.");
    return session.lojaId;
  }
  if (!lojaIdParam) throw new Error("Selecione a loja.");
  return lojaIdParam;
}

async function gerarCodigoBarrasSequencial(tx: Prisma.TransactionClient): Promise<string> {
  const ultima = await tx.peca.findFirst({
    orderBy: { codigoBarras: "desc" },
    select: { codigoBarras: true },
  });
  const proximo = (ultima ? Number(ultima.codigoBarras) : 0) + 1;
  return String(proximo).padStart(CODIGO_BARRAS_LARGURA, "0");
}

async function criarPecaComCodigoSequencial(
  dados: Omit<Prisma.PecaUncheckedCreateInput, "codigoBarras">
) {
  const MAX_TENTATIVAS = 5;
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const codigoBarras = await gerarCodigoBarrasSequencial(tx);
        return tx.peca.create({ data: { ...dados, codigoBarras } });
      });
    } catch (e) {
      const ehColisao = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (ehColisao && tentativa < MAX_TENTATIVAS - 1) continue;
      throw e;
    }
  }
  throw new Error("Não foi possível gerar o código de barras após várias tentativas.");
}

export async function criarPeca(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await verifySession();
  if (!podeCadastrarPecas(session)) {
    return { ok: false, errors: { _form: "Somente a loja Mueller pode cadastrar peças." } };
  }

  const parsed = pecaSchema.safeParse({
    nome: String(formData.get("nome") ?? ""),
    descricao: String(formData.get("descricao") ?? ""),
    preco: String(formData.get("preco") ?? ""),
    lojaDestinoId: String(formData.get("lojaDestinoId") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error) };
  }

  const status = parsed.data.lojaDestinoId === "mueller" ? "DISPONIVEL" : "AGUARDANDO_CONFIRMACAO";

  const peca = await criarPecaComCodigoSequencial({
    nome: parsed.data.nome,
    descricao: parsed.data.descricao || null,
    preco: Number(parsed.data.preco),
    lojaDestinoId: parsed.data.lojaDestinoId,
    status,
  });

  revalidatePath("/pecas");
  revalidatePath("/pecas/cadastradas");
  redirect(`/pecas/${peca.id}/etiqueta`);
}

export async function obterPeca(id: string) {
  const session = await verifySession();
  const peca = await prisma.peca.findUnique({
    where: { id },
    include: { lojaDestino: true, lojaVenda: true },
  });
  if (!peca) return null;
  const podeVer =
    session.tipo === "ADMIN" ||
    session.lojaId === "mueller" ||
    temAcesso(session, peca.lojaDestinoId);
  if (!podeVer) return null;
  return peca;
}

export async function listarPecasFila(lojaIdFiltro?: string) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  return prisma.peca.findMany({
    where: {
      status: { in: ["DISPONIVEL", "AGUARDANDO_CONFIRMACAO"] },
      ...(lojaId ? { lojaDestinoId: lojaId } : {}),
    },
    include: { lojaDestino: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listarPecasAguardandoConfirmacao(lojaIdFiltro?: string) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  return prisma.peca.findMany({
    where: {
      status: "AGUARDANDO_CONFIRMACAO",
      ...(lojaId ? { lojaDestinoId: lojaId } : {}),
    },
    include: { lojaDestino: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function confirmarRecebimentoPeca(id: string) {
  const session = await verifySession();
  if (!podeConfirmarRecebimentoPecas(session)) {
    throw new Error("Ação restrita às lojas que recebem peças (Jockey e Patio Batel).");
  }

  const atual = await prisma.peca.findUnique({ where: { id } });
  if (!atual || !temAcesso(session, atual.lojaDestinoId)) {
    throw new Error("Peça não encontrada.");
  }
  if (atual.status !== "AGUARDANDO_CONFIRMACAO") {
    throw new Error("Esta peça não está aguardando confirmação.");
  }

  await prisma.peca.update({
    where: { id },
    data: { status: "DISPONIVEL", dataConfirmacao: new Date() },
  });

  revalidatePath("/pecas");
  revalidatePath("/pecas/confirmar");
}

export type DarBaixaResultado = {
  ok: boolean;
  error?: string;
  peca?: { nome: string; codigoBarras: string; preco: number };
};

export async function darBaixaPeca(
  codigoBarras: string,
  lojaIdParaAdmin?: string
): Promise<DarBaixaResultado> {
  const session = await verifySession();

  let lojaVendaId: string;
  try {
    lojaVendaId = resolverLojaOperacao(session, lojaIdParaAdmin);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const codigo = codigoBarras.trim();
  if (!codigo) {
    return { ok: false, error: "Informe o código de barras." };
  }

  const peca = await prisma.peca.findUnique({ where: { codigoBarras: codigo } });
  if (!peca) {
    return { ok: false, error: "Código de barras não encontrado." };
  }
  if (peca.status === "VENDIDA") {
    return { ok: false, error: `Peça "${peca.nome}" já foi vendida.` };
  }
  if (peca.status !== "DISPONIVEL") {
    return { ok: false, error: `Peça "${peca.nome}" ainda aguarda confirmação da loja destino.` };
  }

  await prisma.$transaction([
    prisma.peca.update({
      where: { id: peca.id },
      data: { status: "VENDIDA", dataVenda: new Date(), lojaVendaId },
    }),
    prisma.pecaEvento.create({
      data: { pecaId: peca.id, tipo: "VENDA", lojaId: lojaVendaId },
    }),
  ]);

  revalidatePath("/pecas");
  revalidatePath("/pecas/dar-baixa");
  revalidatePath("/pecas/vendidas");

  return { ok: true, peca: { nome: peca.nome, codigoBarras: peca.codigoBarras, preco: peca.preco } };
}

export async function listarPecasVendidas(lojaIdFiltro?: string) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  return prisma.peca.findMany({
    where: {
      status: "VENDIDA",
      ...(lojaId ? { lojaVendaId: lojaId } : {}),
    },
    include: {
      lojaDestino: true,
      lojaVenda: true,
      eventos: { include: { loja: true }, orderBy: { data: "asc" } },
    },
    orderBy: { dataVenda: "desc" },
  });
}

export async function reativarPeca(id: string, lojaIdParaAdmin?: string) {
  const session = await verifySession();

  const atual = await prisma.peca.findUnique({ where: { id } });
  if (!atual) {
    throw new Error("Peça não encontrada.");
  }
  if (atual.status !== "VENDIDA") {
    throw new Error("Só é possível reativar peças vendidas.");
  }
  if (!podeReativarPeca(atual.dataVenda)) {
    throw new Error("Prazo de 7 dias para reativação expirado.");
  }

  // Admin não tem loja própria: por padrão, credita a reativação à mesma
  // loja que efetuou a venda (contexto mais natural para a ação).
  const lojaReativacaoId =
    session.tipo === "LOJA"
      ? resolverLojaOperacao(session)
      : (lojaIdParaAdmin ?? atual.lojaVendaId);
  if (!lojaReativacaoId) {
    throw new Error("Não foi possível determinar a loja responsável pela reativação.");
  }

  await prisma.$transaction([
    prisma.peca.update({
      where: { id },
      data: { status: "DISPONIVEL", dataVenda: null, lojaVendaId: null },
    }),
    prisma.pecaEvento.create({
      data: { pecaId: id, tipo: "REATIVACAO", lojaId: lojaReativacaoId },
    }),
  ]);

  revalidatePath("/pecas");
  revalidatePath("/pecas/vendidas");
}

// Tela exclusiva da Mueller: como só ela cadastra peças, isto é o histórico
// completo de tudo que já foi cadastrado, qualquer status ou destino.
export async function listarPecasCadastradas() {
  const session = await verifySession();
  if (!podeCadastrarPecas(session)) {
    throw new Error("Ação restrita à loja Mueller.");
  }

  return prisma.peca.findMany({
    include: { lojaDestino: true, lojaVenda: true },
    orderBy: { createdAt: "desc" },
  });
}
