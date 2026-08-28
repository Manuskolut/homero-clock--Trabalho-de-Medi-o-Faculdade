"use server";

import { prisma } from "@/lib/prisma";
import { pecaSchema, FOTO_PECA_TAMANHO_MAX } from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type CategoriaPeca } from "@prisma/client";
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
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const CODIGO_BARRAS_LARGURA = 8;

const PASTA_UPLOADS_PECAS = path.join(process.cwd(), "public", "uploads", "pecas");

const EXTENSAO_POR_TIPO: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// Salva a foto como arquivo em public/uploads/pecas (fora do SQLite) e
// devolve o caminho público (ex: "/uploads/pecas/<uuid>.jpg") pra guardar em Peca.fotoUrl.
async function salvarFotoPeca(file: File): Promise<string> {
  if (file.size > FOTO_PECA_TAMANHO_MAX) {
    throw new Error("A foto deve ter no máximo 5MB.");
  }
  const extensao = EXTENSAO_POR_TIPO[file.type];
  if (!extensao) {
    throw new Error("Formato de imagem não suportado. Use JPG, PNG ou WEBP.");
  }

  await mkdir(PASTA_UPLOADS_PECAS, { recursive: true });
  const nomeArquivo = `${randomUUID()}.${extensao}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(PASTA_UPLOADS_PECAS, nomeArquivo), buffer);

  return `/uploads/pecas/${nomeArquivo}`;
}

// Monta a cláusula OR de busca por texto (nome ou referência) — devolve {}
// (sem efeito no where) quando não há termo, pra poder espalhar direto.
function filtroBusca(busca?: string): Prisma.PecaWhereInput {
  const termo = busca?.trim();
  if (!termo) return {};
  return {
    OR: [{ nome: { contains: termo } }, { referencia: { contains: termo } }],
  };
}

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
    categoria: String(formData.get("categoria") ?? ""),
    referencia: String(formData.get("referencia") ?? ""),
    lojaDestinoId: String(formData.get("lojaDestinoId") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error) };
  }

  let fotoUrl: string | null = null;
  const foto = formData.get("foto");
  if (foto instanceof File && foto.size > 0) {
    try {
      fotoUrl = await salvarFotoPeca(foto);
    } catch (e) {
      return { ok: false, errors: { foto: (e as Error).message } };
    }
  }

  // Loja destino em branco = Mueller (destino padrão, sem etapa de confirmação).
  const lojaDestinoId = parsed.data.lojaDestinoId || "mueller";
  const status = lojaDestinoId === "mueller" ? "DISPONIVEL" : "AGUARDANDO_CONFIRMACAO";
  // Preço vazio só passa da validação quando a categoria é Joia (ver
  // pecaSchema) — nesse caso fica null em vez de forçar um número.
  const preco = parsed.data.preco === "" ? null : Number(parsed.data.preco);
  // Referência se aplica a Relógio e Folheado (Folheado tem os dois campos).
  const referencia =
    parsed.data.categoria === "RELOGIO" || parsed.data.categoria === "FOLHEADO"
      ? parsed.data.referencia || null
      : null;

  const peca = await criarPecaComCodigoSequencial({
    nome: parsed.data.nome,
    descricao: parsed.data.descricao || null,
    preco,
    categoria: parsed.data.categoria,
    referencia,
    fotoUrl,
    lojaDestinoId,
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
  // Cobre exatamente as listas que cada loja já vê hoje: fila/confirmar
  // (por lojaDestinoId, via temAcesso) e "Minhas vendas" (por lojaVendaId,
  // que pode ser uma loja diferente do destino original da peça).
  const podeVer =
    session.tipo === "ADMIN" ||
    session.lojaId === "mueller" ||
    temAcesso(session, peca.lojaDestinoId) ||
    (peca.lojaVendaId != null && peca.lojaVendaId === session.lojaId);
  if (!podeVer) return null;
  return peca;
}

export type FiltroPecasFila = {
  lojaId?: string;
  categoria?: CategoriaPeca;
  busca?: string;
};

export async function listarPecasFila(filtro: FiltroPecasFila = {}) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, filtro.lojaId);

  return prisma.peca.findMany({
    where: {
      status: { in: ["DISPONIVEL", "AGUARDANDO_CONFIRMACAO"] },
      ...(lojaId ? { lojaDestinoId: lojaId } : {}),
      ...(filtro.categoria ? { categoria: filtro.categoria } : {}),
      ...filtroBusca(filtro.busca),
    },
    include: { lojaDestino: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listarPecasAguardandoConfirmacao(
  lojaIdFiltro?: string,
  categoriaFiltro?: CategoriaPeca
) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  return prisma.peca.findMany({
    where: {
      status: "AGUARDANDO_CONFIRMACAO",
      ...(lojaId ? { lojaDestinoId: lojaId } : {}),
      ...(categoriaFiltro ? { categoria: categoriaFiltro } : {}),
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

export type PecaParaVenda = {
  id: string;
  nome: string;
  codigoBarras: string;
  preco: number | null;
  fotoUrl: string | null;
};

export type BuscarPecaResultado = {
  ok: boolean;
  error?: string;
  peca?: PecaParaVenda;
};

// Só consulta e valida — não muda status nem cria evento. Usado na etapa de
// leitura do código de barras, antes da confirmação (ver darBaixaPeca, que
// só roda quando o atendente clica em "Confirmar venda").
export async function buscarPecaParaVenda(codigoBarras: string): Promise<BuscarPecaResultado> {
  await verifySession();

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

  return {
    ok: true,
    peca: {
      id: peca.id,
      nome: peca.nome,
      codigoBarras: peca.codigoBarras,
      preco: peca.preco,
      fotoUrl: peca.fotoUrl,
    },
  };
}

export type DarBaixaResultado = {
  ok: boolean;
  error?: string;
  peca?: { nome: string; codigoBarras: string; preco: number | null };
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

export type FiltroPecasVendidas = {
  lojaId?: string;
  categoria?: CategoriaPeca;
  de?: string;
  ate?: string;
  busca?: string;
};

export async function listarPecasVendidas(filtro: FiltroPecasVendidas = {}) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, filtro.lojaId);

  return prisma.peca.findMany({
    where: {
      status: "VENDIDA",
      ...(lojaId ? { lojaVendaId: lojaId } : {}),
      ...(filtro.categoria ? { categoria: filtro.categoria } : {}),
      ...(filtro.de || filtro.ate
        ? {
            dataVenda: {
              ...(filtro.de ? { gte: new Date(filtro.de) } : {}),
              ...(filtro.ate ? { lte: new Date(`${filtro.ate}T23:59:59.999`) } : {}),
            },
          }
        : {}),
      ...filtroBusca(filtro.busca),
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

// Exclusão de peça cadastrada por engano: pra loja Mueller, só permitida se
// a peça NUNCA foi vendida — não basta olhar o status atual, porque uma
// peça vendida e depois reativada volta para DISPONIVEL mas já tem
// histórico em PecaEvento. Admin não tem essa restrição: pode excluir
// qualquer peça (aberta, vendida ou reativada) — ação destrutiva e
// irreversível, por isso o log de auditoria abaixo.
// A FK PecaEvento->Peca é ON DELETE RESTRICT (não há cascade no schema),
// então os eventos são apagados manualmente antes da peça, numa transação
// (mesmo padrão de scripts/limpar-pecas-vendidas.ts), pra nunca sobrar
// histórico órfão nem uma peça "meio excluída".
export async function excluirPeca(id: string) {
  const session = await verifySession();
  if (!podeCadastrarPecas(session)) {
    throw new Error("Ação restrita à loja Mueller.");
  }
  const isAdmin = session.tipo === "ADMIN";

  const atual = await prisma.peca.findUnique({
    where: { id },
    include: { _count: { select: { eventos: true } } },
  });
  if (!atual) {
    throw new Error("Peça não encontrada.");
  }

  if (!isAdmin) {
    if (atual.status === "VENDIDA") {
      throw new Error("Não é possível excluir uma peça que já foi vendida.");
    }
    if (atual._count.eventos > 0) {
      throw new Error(
        "Não é possível excluir: esta peça já foi vendida em algum momento (e reativada depois)."
      );
    }
  }

  if (isAdmin) {
    console.warn(
      `[auditoria] admin ${session.nome} (${session.userId}) excluiu a peça ` +
        `${atual.codigoBarras} (id ${atual.id}, status ${atual.status}, ` +
        `${atual._count.eventos} evento(s) de histórico) em ${new Date().toISOString()}`
    );
  }

  await prisma.$transaction([
    prisma.pecaEvento.deleteMany({ where: { pecaId: id } }),
    prisma.peca.delete({ where: { id } }),
  ]);

  if (atual.fotoUrl) {
    await unlink(path.join(process.cwd(), "public", atual.fotoUrl)).catch(() => {});
  }

  revalidatePath("/pecas");
  revalidatePath("/pecas/cadastradas");
  revalidatePath("/pecas/confirmar");
  revalidatePath("/pecas/vendidas");
}

// Tela exclusiva da Mueller: como só ela cadastra peças, isto é o histórico
// completo de tudo que já foi cadastrado, qualquer status ou destino.
export type FiltroPecasCadastradas = {
  categoria?: CategoriaPeca;
  busca?: string;
};

export async function listarPecasCadastradas(filtro: FiltroPecasCadastradas = {}) {
  const session = await verifySession();
  if (!podeCadastrarPecas(session)) {
    throw new Error("Ação restrita à loja Mueller.");
  }

  return prisma.peca.findMany({
    where: {
      ...(filtro.categoria ? { categoria: filtro.categoria } : {}),
      ...filtroBusca(filtro.busca),
    },
    include: {
      lojaDestino: true,
      lojaVenda: true,
      _count: { select: { eventos: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
