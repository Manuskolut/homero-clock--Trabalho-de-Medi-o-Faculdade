"use server";

import { prisma } from "@/lib/prisma";
import {
  ordemSchema,
  encerrarOrdemSchema,
  MAX_PECAS_JOIA,
  OFICINA_OPTIONS,
  type EncerrarOrdemInput,
} from "@/lib/validation";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma, type StatusOrdem, type TipoItem } from "@prisma/client";
import type { ActionState } from "@/lib/actions/clientes";
import { verifySession, resolverLojaAlvo, temAcesso, filtroLoja, requireAdmin } from "@/lib/dal";
import { estaAtrasada, PAINEL_STATUS_EXCLUIDOS_ATRASADA } from "@/lib/format";
import { enviarEmailEntradaOrdem, enviarEmailBaixaOrdem } from "@/lib/email";

// Prazo padrão de entrega quando o atendente não informa data prometida
// no cadastro da OS.
const PRAZO_PADRAO_DIAS = 18;

function somarDias(data: Date, dias: number) {
  const resultado = new Date(data);
  resultado.setUTCDate(resultado.getUTCDate() + dias);
  return resultado;
}

// Status automático a partir de ter ou não valor orçado: com valor vira "Em
// conserto", sem valor vira "Em orçamento". Só é aplicado na criação (status
// atual nulo) e ao editar uma ordem que já está num desses dois status —
// nunca sobrescreve "Sem conserto"/"Pronto para retirada"/"Entregue", que só
// mudam por ação manual explícita (StatusSelect/alterarStatusOrdem).
function statusAutomaticoPorValor(
  statusAtual: StatusOrdem | null,
  valorOrcado: number | null
): StatusOrdem {
  if (statusAtual && statusAtual !== "EM_ANALISE" && statusAtual !== "EM_CONSERTO") {
    return statusAtual;
  }
  return valorOrcado != null ? "EM_CONSERTO" : "EM_ANALISE";
}

const CAMPOS_RELOGIO = [
  "modeloRelogio",
  "descricaoRelogio",
  "tipoRelogio",
  "pulseiraRelogio",
  "estadoCaixaRelogio",
  "estadoPulseiraRelogio",
  "estadoVidroRelogio",
  "estadoMostradorRelogio",
] as const;

function extrairRelogios(formData: FormData) {
  const colunas = Object.fromEntries(
    CAMPOS_RELOGIO.map((campo) => [campo, formData.getAll(campo).map(String)])
  ) as Record<(typeof CAMPOS_RELOGIO)[number], string[]>;

  const total = colunas.modeloRelogio.length;
  const relogios = [];
  for (let i = 0; i < total; i++) {
    const modelo = colunas.modeloRelogio[i].trim();
    if (!modelo) continue;
    relogios.push({
      modelo,
      descricao: colunas.descricaoRelogio[i]?.trim() ?? "",
      tipo: colunas.tipoRelogio[i]?.trim() || undefined,
      pulseira: colunas.pulseiraRelogio[i]?.trim() || undefined,
      estadoCaixa: colunas.estadoCaixaRelogio[i]?.trim() || undefined,
      estadoPulseira: colunas.estadoPulseiraRelogio[i]?.trim() || undefined,
      estadoVidro: colunas.estadoVidroRelogio[i]?.trim() || undefined,
      estadoMostrador: colunas.estadoMostradorRelogio[i]?.trim() || undefined,
    });
  }
  return relogios;
}

function extrairPecasJoia(formData: FormData) {
  const pecas = [];
  for (let i = 0; i < MAX_PECAS_JOIA; i++) {
    const descricaoRaw = formData.get(`descricaoPeca_${i}`);
    if (descricaoRaw === null) continue; // linha não renderizada nesta submissão
    const descricao = String(descricaoRaw).trim();
    if (!descricao) continue;
    const tiposConserto = formData
      .getAll(`tipoConsertoPeca_${i}`)
      .map(String)
      .map((v) => v.trim())
      .filter(Boolean);
    const tamanhoAro = String(formData.get(`tamanhoAroPeca_${i}`) ?? "").trim() || undefined;
    const peso = String(formData.get(`pesoPeca_${i}`) ?? "").trim() || undefined;
    const outroConserto = String(formData.get(`outroConsertoPeca_${i}`) ?? "").trim() || undefined;
    const deixouOuroRaw = String(formData.get(`deixouOuroPeca_${i}`) ?? "").trim();
    const deixouOuro = deixouOuroRaw === "SIM" || deixouOuroRaw === "NAO" ? deixouOuroRaw : undefined;
    const pesoOuro =
      deixouOuro === "SIM"
        ? String(formData.get(`pesoOuroPeca_${i}`) ?? "").trim() || undefined
        : undefined;
    const corFolheacaoRaw = String(formData.get(`corFolheacaoPeca_${i}`) ?? "").trim();
    const corFolheacao =
      corFolheacaoRaw === "AMARELO" || corFolheacaoRaw === "BRANCO" ? corFolheacaoRaw : undefined;
    pecas.push({
      descricao,
      tiposConserto,
      tamanhoAro,
      peso,
      outroConserto,
      deixouOuro,
      pesoOuro,
      corFolheacao,
    });
  }
  return pecas;
}

function parseOrdemForm(formData: FormData) {
  const tipoItem = String(formData.get("tipoItem") ?? "");

  const comuns = {
    nomeCliente: String(formData.get("nomeCliente") ?? ""),
    telefoneCliente: String(formData.get("telefoneCliente") ?? ""),
    emailCliente: String(formData.get("emailCliente") ?? ""),
    dataEntrada: String(formData.get("dataEntrada") ?? ""),
    dataPrevista: String(formData.get("dataPrevista") ?? ""),
    valorOrcado: String(formData.get("valorOrcado") ?? ""),
    sinal: String(formData.get("sinal") ?? ""),
    observacoes: String(formData.get("observacoes") ?? ""),
    nomeAtendente: String(formData.get("nomeAtendente") ?? ""),
  };

  if (tipoItem === "JOIA") {
    return ordemSchema.safeParse({
      ...comuns,
      tipoItem: "JOIA" as const,
      pecas: extrairPecasJoia(formData),
    });
  }

  return ordemSchema.safeParse({
    ...comuns,
    tipoItem: "RELOGIO" as const,
    relogios: extrairRelogios(formData),
    oficina: String(formData.get("oficina") ?? ""),
  });
}

// Não existe mais um campo de descrição único da OS em nenhum dos dois fluxos —
// cada relógio/peça tem a sua própria. `descricaoItem` (coluna obrigatória,
// compartilhada entre os dois tipos) passa a guardar um resumo derivado
// (descrições concatenadas), usado só pra busca textual e pro preview de uma
// linha no painel — nunca exibido como campo próprio em nenhuma tela.
function dadosEspecificosPorTipo(dados: ReturnType<typeof ordemSchema.parse>) {
  if (dados.tipoItem === "RELOGIO") {
    return {
      relogiosDetalhes: dados.relogios,
      oficina: dados.oficina || null,
      pecasJoia: Prisma.DbNull,
      descricaoItem: dados.relogios.map((r) => r.descricao.trim()).join(" | "),
    };
  }
  return {
    relogiosDetalhes: Prisma.DbNull,
    oficina: null,
    pecasJoia: dados.pecas,
    descricaoItem: dados.pecas.map((p) => p.descricao.trim()).join(" | "),
  };
}

async function resolverOuCriarCliente(
  tx: Prisma.TransactionClient,
  lojaId: string,
  nome: string,
  telefone: string,
  email?: string
) {
  const digitosBusca = telefone.replace(/\D/g, "");
  const candidatos = await tx.cliente.findMany({
    where: { lojaId },
    select: { id: true, nome: true, telefone: true, email: true },
  });
  const encontrado = candidatos.find((c) => c.telefone.replace(/\D/g, "") === digitosBusca);

  if (encontrado) {
    // E-mail em branco nunca apaga o já salvo — só um valor digitado sobrescreve.
    const data: Prisma.ClienteUpdateInput = {};
    if (encontrado.nome !== nome) data.nome = nome;
    if (email) data.email = email;
    if (Object.keys(data).length === 0) return encontrado;
    return tx.cliente.update({ where: { id: encontrado.id }, data });
  }
  return tx.cliente.create({ data: { nome, telefone, lojaId, email: email || null } });
}

async function criarOrdemComNumeroSequencial(
  lojaId: string,
  clienteInfo: { nome: string; telefone: string; email?: string },
  dadosOrdem: Omit<Prisma.OrdemUncheckedCreateInput, "lojaId" | "numeroOS" | "clienteId">
) {
  const MAX_TENTATIVAS = 5;
  for (let tentativa = 0; tentativa < MAX_TENTATIVAS; tentativa++) {
    try {
      return await prisma.$transaction(async (tx) => {
        const cliente = await resolverOuCriarCliente(
          tx,
          lojaId,
          clienteInfo.nome,
          clienteInfo.telefone,
          clienteInfo.email
        );
        const loja = await tx.loja.findUniqueOrThrow({
          where: { id: lojaId },
          select: { nome: true },
        });
        const ultima = await tx.ordem.findFirst({
          where: { lojaId },
          orderBy: { numeroOS: "desc" },
          select: { numeroOS: true },
        });
        const numeroOS = (ultima?.numeroOS ?? 0) + 1;
        const ordem = await tx.ordem.create({
          data: { ...dadosOrdem, lojaId, numeroOS, clienteId: cliente.id },
        });
        return { ordem, clienteEmail: cliente.email, lojaNome: loja.nome };
      });
    } catch (e) {
      const ehColisao = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (ehColisao && tentativa < MAX_TENTATIVAS - 1) continue;
      throw e;
    }
  }
  throw new Error("Não foi possível gerar o número da OS após várias tentativas.");
}

export async function previewProximoNumeroOS(lojaIdFiltro?: string): Promise<number | null> {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);
  if (!lojaId) return null;

  const ultima = await prisma.ordem.findFirst({
    where: { lojaId },
    orderBy: { numeroOS: "desc" },
    select: { numeroOS: true },
  });
  return (ultima?.numeroOS ?? 0) + 1;
}

export async function criarOrdem(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();

  const parsed = parseOrdemForm(formData);
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error) };
  }

  let lojaId: string;
  try {
    lojaId = resolverLojaAlvo(session, formData);
  } catch (e) {
    return { ok: false, errors: { lojaId: (e as Error).message } };
  }

  const dataEntrada = new Date(parsed.data.dataEntrada);
  const valorOrcado = parsed.data.valorOrcado ? Number(parsed.data.valorOrcado) : null;

  const { ordem, clienteEmail, lojaNome } = await criarOrdemComNumeroSequencial(
    lojaId,
    {
      nome: parsed.data.nomeCliente,
      telefone: parsed.data.telefoneCliente,
      email: parsed.data.emailCliente,
    },
    {
      tipoItem: parsed.data.tipoItem,
      dataEntrada,
      dataPrevista: parsed.data.dataPrevista
        ? new Date(parsed.data.dataPrevista)
        : somarDias(dataEntrada, PRAZO_PADRAO_DIAS),
      // Marca se a data prometida foi digitada pelo atendente (true) ou
      // calculada pelo sistema (false) — controla o campo "Urgente" na Via
      // da Loja (só aparece quando calculada automaticamente).
      dataPrometidaManual: !!parsed.data.dataPrevista,
      valorOrcado,
      status: statusAutomaticoPorValor(null, valorOrcado),
      sinal: parsed.data.sinal ? Number(parsed.data.sinal) : null,
      observacoes: parsed.data.observacoes || null,
      nomeAtendente: parsed.data.nomeAtendente,
      ...dadosEspecificosPorTipo(parsed.data),
    }
  );

  if (clienteEmail) {
    await enviarEmailEntradaOrdem({
      destinatario: clienteEmail,
      lojaNome,
      numeroOS: ordem.numeroOS,
      clienteNome: parsed.data.nomeCliente,
      clienteTelefone: parsed.data.telefoneCliente,
      tipoItem: ordem.tipoItem,
      relogiosDetalhes: ordem.relogiosDetalhes,
      pecasJoia: ordem.pecasJoia,
      valorOrcado: ordem.valorOrcado,
      sinal: ordem.sinal,
      dataEntrada: ordem.dataEntrada,
    });
  }

  revalidatePath("/ordens");
  revalidatePath("/");
  redirect(`/ordens/${ordem.id}/vias`);
}

export async function atualizarOrdem(
  id: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await verifySession();

  const atual = await prisma.ordem.findUnique({ where: { id } });
  if (!atual || !temAcesso(session, atual.lojaId)) {
    return { ok: false, errors: { _form: "Ordem não encontrada." } };
  }
  if (atual.dataRetirada) {
    return {
      ok: false,
      errors: {
        _form: "Esta ordem já teve baixa dada e está somente leitura. Reabra-a antes de editar.",
      },
    };
  }

  const parsed = parseOrdemForm(formData);
  if (!parsed.success) {
    return { ok: false, errors: flattenErrors(parsed.error) };
  }

  const valorOrcado = parsed.data.valorOrcado ? Number(parsed.data.valorOrcado) : null;

  // O cliente da ordem não muda na edição — só é definido na criação
  // (nomeCliente/telefoneCliente vêm no form só pra satisfazer o schema
  // compartilhado com a criação; não são usados aqui). nomeAtendente segue
  // a mesma regra (vem como campo oculto no form, também não é usado aqui).
  await prisma.ordem.update({
    where: { id },
    data: {
      tipoItem: parsed.data.tipoItem,
      dataEntrada: new Date(parsed.data.dataEntrada),
      dataPrevista: parsed.data.dataPrevista ? new Date(parsed.data.dataPrevista) : null,
      dataPrometidaManual: !!parsed.data.dataPrevista,
      valorOrcado,
      status: statusAutomaticoPorValor(atual.status, valorOrcado),
      sinal: parsed.data.sinal ? Number(parsed.data.sinal) : null,
      observacoes: parsed.data.observacoes || null,
      ...dadosEspecificosPorTipo(parsed.data),
    },
  });

  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
  revalidatePath("/");
  redirect(`/ordens/${id}`);
}

export async function alterarStatusOrdem(id: string, status: StatusOrdem) {
  const session = await verifySession();

  const atual = await prisma.ordem.findUnique({ where: { id } });
  if (!atual || !temAcesso(session, atual.lojaId)) {
    throw new Error("Ordem não encontrada.");
  }
  if (atual.dataRetirada) {
    throw new Error("Ordem com baixa dada é somente leitura. Reabra-a para alterar o status.");
  }

  // dataMarcadoSemConserto registra quando o status entrou em "Sem conserto"
  // (dataRetirada continua nula até a baixa formal) — usado só no KPI
  // mensal. Limpo ao sair de "Sem conserto" para o caso de reentrar depois.
  const data: Prisma.OrdemUpdateInput = { status };
  if (status === "SEM_CONSERTO" && atual.status !== "SEM_CONSERTO") {
    data.dataMarcadoSemConserto = new Date();
  } else if (status !== "SEM_CONSERTO") {
    data.dataMarcadoSemConserto = null;
  }

  await prisma.ordem.update({ where: { id }, data });
  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
  revalidatePath("/");
}

export async function atualizarOficinaOrdem(id: string, oficina: string) {
  const session = await verifySession();

  const atual = await prisma.ordem.findUnique({ where: { id } });
  if (!atual || !temAcesso(session, atual.lojaId)) {
    throw new Error("Ordem não encontrada.");
  }
  if (atual.tipoItem !== "RELOGIO") {
    throw new Error("Oficina destinada só se aplica a ordens de relógio.");
  }
  if (atual.dataRetirada) {
    throw new Error("Ordem com baixa dada é somente leitura. Reabra-a para alterar a oficina.");
  }

  await prisma.ordem.update({
    where: { id },
    data: { oficina: oficina || null },
  });
  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
  revalidatePath("/oficinas");
}

export type EncerrarOrdemResult = { ok: boolean; error?: string };

// Baixa formal (CPF/nome/e-mail de quem retirou + revisão) — única forma de
// finalizar uma ordem. Se a ordem já estava "Sem conserto" (marcada direto
// no seletor rápido, sem baixa), permanece "Sem conserto"; senão, vira
// "Entregue". O status em si não muda na baixa — só passa a ser finalizada
// (dataRetirada preenchida).
export async function encerrarOrdem(
  id: string,
  dados: EncerrarOrdemInput
): Promise<EncerrarOrdemResult> {
  const session = await verifySession();

  const atual = await prisma.ordem.findUnique({
    where: { id },
    include: {
      loja: { select: { nome: true } },
      cliente: { select: { nome: true, telefone: true } },
    },
  });
  if (!atual || !temAcesso(session, atual.lojaId)) {
    return { ok: false, error: "Ordem não encontrada." };
  }

  const parsed = encerrarOrdemSchema.safeParse(dados);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const statusFinal = atual.status === "SEM_CONSERTO" ? "SEM_CONSERTO" : "ENTREGUE";

  await prisma.ordem.update({
    where: { id },
    data: {
      status: statusFinal,
      dataRetirada: new Date(parsed.data.dataRetirada),
      observacaoRetirada: parsed.data.observacaoRetirada?.trim() || null,
      valorOrcado: Number(parsed.data.valorOrcado),
      dataPrevista: parsed.data.dataPrevista ? new Date(parsed.data.dataPrevista) : null,
      custoOurives: parsed.data.custoOurives ? Number(parsed.data.custoOurives) : null,
      cpfRetirada: parsed.data.cpfRetirada,
      nomeRetirada: parsed.data.nomeRetirada,
      emailRetirada: parsed.data.emailRetirada?.trim() || null,
    },
  });

  const emailRetirada = parsed.data.emailRetirada?.trim();
  if (emailRetirada) {
    await enviarEmailBaixaOrdem({
      destinatario: emailRetirada,
      lojaNome: atual.loja.nome,
      numeroOS: atual.numeroOS,
      clienteNome: atual.cliente.nome,
      clienteTelefone: atual.cliente.telefone,
      tipoItem: atual.tipoItem,
      relogiosDetalhes: atual.relogiosDetalhes,
      pecasJoia: atual.pecasJoia,
      valorOrcado: Number(parsed.data.valorOrcado),
      sinal: atual.sinal,
      dataRetirada: new Date(parsed.data.dataRetirada),
    });
  }

  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function reabrirOrdem(id: string) {
  const session = await verifySession();

  const atual = await prisma.ordem.findUnique({ where: { id } });
  if (!atual || !temAcesso(session, atual.lojaId)) {
    throw new Error("Ordem não encontrada.");
  }

  await prisma.ordem.update({
    where: { id },
    data: {
      status: "PRONTO_RETIRADA",
      dataRetirada: null,
      observacaoRetirada: null,
      cpfRetirada: null,
      nomeRetirada: null,
      emailRetirada: null,
    },
  });
  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
  revalidatePath("/");
}

export async function excluirOrdem(id: string) {
  await requireAdmin();

  await prisma.ordem.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/ordens");
  revalidatePath(`/ordens/${id}`);
  revalidatePath("/");
}

export type FiltroOrdens = {
  termo?: string;
  status?: StatusOrdem | "TODAS";
  de?: string;
  ate?: string;
  apenasAbertas?: boolean;
  tipoItem?: TipoItem | "TODOS";
  lojaId?: string;
};

export async function listarOrdens(filtro: FiltroOrdens = {}) {
  const session = await verifySession();
  const where: Prisma.OrdemWhereInput = { deletedAt: null };

  const lojaId = filtroLoja(session, filtro.lojaId);
  if (lojaId) {
    where.lojaId = lojaId;
  }

  if (filtro.status && filtro.status !== "TODAS") {
    where.status = filtro.status;
  } else if (filtro.apenasAbertas) {
    where.dataRetirada = null;
  }

  if (filtro.tipoItem && filtro.tipoItem !== "TODOS") {
    where.tipoItem = filtro.tipoItem;
  }

  if (filtro.termo && filtro.termo.trim()) {
    const q = filtro.termo.trim();
    const numeroBusca = /^\d+$/.test(q) ? Number(q) : null;
    where.OR = [
      ...(numeroBusca !== null ? [{ numeroOS: numeroBusca }] : []),
      { descricaoItem: { contains: q } },
      { cliente: { nome: { contains: q } } },
      { cliente: { telefone: { contains: q } } },
    ];
  }

  if (filtro.de || filtro.ate) {
    where.dataPrevista = {
      ...(filtro.de ? { gte: new Date(filtro.de) } : {}),
      ...(filtro.ate ? { lte: new Date(filtro.ate) } : {}),
    };
  }

  return prisma.ordem.findMany({
    where,
    include: { cliente: true, loja: true },
    orderBy: { dataEntrada: "desc" },
  });
}

export async function obterOrdemComCliente(id: string) {
  const session = await verifySession();
  const ordem = await prisma.ordem.findUnique({
    where: { id },
    include: { cliente: true, loja: true },
  });
  if (!ordem || ordem.deletedAt || !temAcesso(session, ordem.lojaId)) return null;
  return ordem;
}

export async function ordensProximasDoPrazo(
  dias: number,
  tipoItem?: TipoItem,
  lojaIdFiltro?: string
) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(hoje);
  limite.setDate(limite.getDate() + dias);

  return prisma.ordem.findMany({
    where: {
      deletedAt: null,
      dataRetirada: null,
      dataPrevista: { lte: limite },
      ...(tipoItem ? { tipoItem } : {}),
      ...(lojaId ? { lojaId } : {}),
    },
    include: { cliente: true, loja: true },
    orderBy: { dataPrevista: "asc" },
  });
}

export async function contarRelogiosPorOficina(lojaIdFiltro?: string) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);

  const grupos = await prisma.ordem.groupBy({
    by: ["oficina"],
    where: {
      deletedAt: null,
      tipoItem: "RELOGIO",
      ...(lojaId ? { lojaId } : {}),
    },
    _count: { _all: true },
  });

  const opcoes = [{ value: "", label: "Selecione..." }, ...OFICINA_OPTIONS];

  return opcoes.map((opt) => ({
    value: opt.value,
    label: opt.label,
    total: grupos.find((g) => (g.oficina ?? "") === opt.value)?._count._all ?? 0,
  }));
}

export async function estatisticasDashboard(lojaIdFiltro?: string) {
  const session = await verifySession();
  const lojaId = filtroLoja(session, lojaIdFiltro);
  const lojaWhere: Prisma.OrdemWhereInput = lojaId ? { lojaId } : {};

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const fimSemana = new Date(hoje);
  fimSemana.setDate(fimSemana.getDate() + 7);

  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

  const [
    todas,
    emAberto,
    atrasadas,
    previstasSemana,
    encerradasMes,
    semConsertoMes,
    osEsteMes,
    ordensParaStatus,
  ] = await Promise.all([
    prisma.ordem.count({ where: { deletedAt: null, ...lojaWhere } }),
    // Em aberto = ainda não passou pela baixa formal, independente do status
    // atual (inclui "Sem conserto" ainda não retirado).
    prisma.ordem.count({
      where: { deletedAt: null, ...lojaWhere, dataRetirada: null },
    }),
    // Atrasadas continua por status: "Sem conserto" nunca conta como
    // atrasada (mesmo critério de estaAtrasada), aberta ou não. "Pronto para
    // retirada" também fica de fora: se já chegou nesse status, o problema
    // deixou de ser o prazo de execução e passou a ser o cliente não ter
    // retirado — essa OS conta/aparece como "Pronto para retirada", não
    // como atrasada (ver PAINEL_STATUS_EXCLUIDOS_ATRASADA).
    prisma.ordem.count({
      where: {
        deletedAt: null,
        ...lojaWhere,
        status: { notIn: ["ENTREGUE", "SEM_CONSERTO", ...PAINEL_STATUS_EXCLUIDOS_ATRASADA] },
        dataPrevista: { lt: hoje },
      },
    }),
    prisma.ordem.count({
      where: {
        deletedAt: null,
        ...lojaWhere,
        dataRetirada: null,
        dataPrevista: { gte: hoje, lte: fimSemana },
      },
    }),
    prisma.ordem.count({
      where: {
        deletedAt: null,
        ...lojaWhere,
        status: "ENTREGUE",
        dataRetirada: { gte: inicioMes, lt: fimMes },
      },
    }),
    // Sem conserto (mês) conta por quando entrou em "Sem conserto"
    // (dataMarcadoSemConserto), não por quando foi retirado — assim inclui
    // as que ainda estão abertas (sem dataRetirada).
    prisma.ordem.count({
      where: {
        deletedAt: null,
        ...lojaWhere,
        status: "SEM_CONSERTO",
        dataMarcadoSemConserto: { gte: inicioMes, lt: fimMes },
      },
    }),
    prisma.ordem.count({
      where: {
        deletedAt: null,
        ...lojaWhere,
        dataEntrada: { gte: inicioMes, lt: fimMes },
      },
    }),
    // "Por status" não deve acumular histórico indefinidamente: entra aqui
    // qualquer OS ainda aberta (dataRetirada nula, qualquer status — inclui
    // Sem conserto ainda aguardando retirada), OU Entregue/Encerrado dentro
    // do mês corrente (mesmo critério do KPI "Encerradas no Mês"). Sem
    // conserto já finalizada fica de fora, sem precisar de fatia própria.
    prisma.ordem.findMany({
      where: {
        deletedAt: null,
        ...lojaWhere,
        OR: [
          { dataRetirada: null },
          { status: "ENTREGUE", dataRetirada: { gte: inicioMes, lt: fimMes } },
        ],
      },
      select: { status: true, dataPrevista: true, tipoItem: true },
    }),
  ]);

  // Ordens atrasadas contam só na fatia "Atrasadas", não também no seu
  // status original (ver estaAtrasada — nunca é true para ordens finalizadas).
  // "Em conserto" tem cor diferente por tipo de item (relógio/joia), então
  // vira duas fatias próprias no gráfico (EM_CONSERTO_RELOGIO/_JOIA) em vez
  // de uma só — ver StatusChart.
  const contagemPorStatus = new Map<string, number>();
  for (const o of ordensParaStatus) {
    const chave = estaAtrasada(o.dataPrevista, o.status, PAINEL_STATUS_EXCLUIDOS_ATRASADA)
      ? "ATRASADAS"
      : o.status === "EM_CONSERTO"
        ? `EM_CONSERTO_${o.tipoItem}`
        : o.status;
    contagemPorStatus.set(chave, (contagemPorStatus.get(chave) ?? 0) + 1);
  }
  const porStatus = Array.from(contagemPorStatus, ([status, total]) => ({ status, total }));

  return {
    todas,
    emAberto,
    atrasadas,
    previstasSemana,
    encerradasMes,
    semConsertoMes,
    osEsteMes,
    porStatus,
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
