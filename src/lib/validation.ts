import { z } from "zod";

// Aceita telefones brasileiros com ou sem máscara: exige entre 8 e 13 dígitos.
const telefoneRegex = /^[\d\s()+-]+$/;

export const clienteSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe o nome completo do cliente"),
  telefone: z
    .string()
    .trim()
    .min(1, "Informe o telefone do cliente")
    .regex(telefoneRegex, "Telefone contém caracteres inválidos")
    .refine((v) => v.replace(/\D/g, "").length >= 8, {
      message: "Telefone deve ter ao menos 8 dígitos",
    }),
  email: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "E-mail inválido",
    }),
});

export const TIPO_ITEM_OPTIONS = [
  { value: "RELOGIO", label: "Relógio" },
  { value: "JOIA", label: "Joia" },
] as const;

export const STATUS_ORDEM_OPTIONS = [
  { value: "EM_ANALISE", label: "Em orçamento" },
  { value: "EM_CONSERTO", label: "Em conserto" },
  { value: "PRONTO_RETIRADA", label: "Pronto para retirada" },
  { value: "SEM_CONSERTO", label: "Sem conserto" },
  { value: "ENTREGUE", label: "Entregue / Encerrado" },
] as const;

// Status só alcançável via a ação formal de dar baixa (coleta CPF/nome/e-mail
// de quem retirou) — não aparece no seletor rápido de status. "Sem conserto"
// NÃO entra aqui: é selecionável direto no seletor rápido, e a ordem
// continua aberta até a baixa formal (ver campo dataRetirada).
export const STATUS_SOMENTE_VIA_BAIXA = ["ENTREGUE"] as const;

export const MAX_RELOGIOS_POR_ORDEM = 6;

export const TIPOS_CONSERTO_JOIA_OPTIONS = [
  { value: "SOLDA", label: "Solda" },
  { value: "POLIMENTO", label: "Polimento" },
  { value: "TROCA_PEDRA", label: "Troca de pedra" },
  { value: "BANHO", label: "Folheação" },
  { value: "AJUSTE_TAMANHO", label: "Ajuste de tamanho" },
  { value: "TROCA_FECHO", label: "Troca de fecho" },
  { value: "CONSERTO_CORRENTE", label: "Conserto de corrente/elo" },
  { value: "LIMPEZA", label: "Limpeza" },
  { value: "CONFECCAO", label: "Confecção" },
  { value: "OUTRO", label: "Outro" },
] as const;

// Tipo de conserto que exige informar o texto livre descrevendo o serviço.
export const TIPO_CONSERTO_OUTRO = "OUTRO";

// Tipo de conserto que exige perguntar se a cliente deixou ouro (e o peso, se sim).
export const TIPO_CONSERTO_CONFECCAO = "CONFECCAO";

// Tipo de conserto que exige informar a cor do ouro da folheação.
export const TIPO_CONSERTO_FOLHEACAO = "BANHO";

export const DEIXOU_OURO_OPTIONS = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
] as const;

export const COR_FOLHEACAO_OPTIONS = [
  { value: "AMARELO", label: "Ouro Amarelo" },
  { value: "BRANCO", label: "Ouro Branco" },
] as const;

export const TIPO_RELOGIO_OPTIONS = [
  { value: "QUARTZ", label: "Quartz" },
  { value: "AUTOMATICO", label: "Automático" },
  { value: "CORDA", label: "Corda" },
  { value: "ANA_DIGI", label: "Ana-digi" },
] as const;

export const PULSEIRA_OPTIONS = [
  { value: "COURO", label: "Couro" },
  { value: "METAL", label: "Metal" },
  { value: "BORRACHA", label: "Borracha" },
] as const;

export const ESTADO_PECA_OPTIONS = [
  { value: "BOM", label: "Bom" },
  { value: "REGULAR", label: "Regular" },
  { value: "RUIM", label: "Ruim" },
] as const;

export const OFICINA_OPTIONS = [
  { value: "MUELLER", label: "Mueller" },
  { value: "JOCKEY", label: "Jockey" },
  { value: "LEANDRO", label: "Leandro" },
  { value: "JORGE", label: "Jorge" },
] as const;

export const MAX_PECAS_JOIA = 10;

// Aro de anel/aliança — numeração de 10 a 35.
export const TAMANHO_ARO_OPTIONS = Array.from({ length: 26 }, (_, i) => {
  const valor = String(10 + i);
  return { value: valor, label: valor };
});

// Tipo de conserto que exige informar o tamanho do aro da peça.
export const TIPO_CONSERTO_COM_ARO = "AJUSTE_TAMANHO";

export const relogioDetalheSchema = z.object({
  modelo: z.string().trim().min(1, "Informe o modelo do relógio"),
  descricao: z.string().trim().min(3, "Descreva o serviço deste relógio"),
  tipo: z.string().trim().optional(),
  pulseira: z.string().trim().optional(),
  estadoCaixa: z.string().trim().optional(),
  estadoPulseira: z.string().trim().optional(),
  estadoVidro: z.string().trim().optional(),
  estadoMostrador: z.string().trim().optional(),
});

export const joiaPecaSchema = z.object({
  descricao: z.string().trim().min(1, "Descreva a peça"),
  tiposConserto: z
    .array(z.string().trim().min(1))
    .min(1, "Selecione ao menos um tipo de conserto"),
  tamanhoAro: z.string().trim().optional(),
  peso: z.string().trim().optional(),
  outroConserto: z.string().trim().optional(),
  deixouOuro: z.enum(["SIM", "NAO"]).optional(),
  pesoOuro: z.string().trim().optional(),
  corFolheacao: z.enum(["AMARELO", "BRANCO"]).optional(),
});

const camposComuns = {
  nomeCliente: z.string().trim().min(3, "Informe o nome completo do cliente"),
  telefoneCliente: z
    .string()
    .trim()
    .min(1, "Informe o telefone do cliente")
    .regex(telefoneRegex, "Telefone contém caracteres inválidos")
    .refine((v) => v.replace(/\D/g, "").length >= 8, {
      message: "Telefone deve ter ao menos 8 dígitos",
    }),
  emailCliente: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "E-mail inválido",
    }),
  dataEntrada: z.string().trim().min(1, "Informe a data de entrada"),
  // Opcionais no cadastro — exigidos apenas na hora de dar baixa na ordem.
  dataPrevista: z.string().trim().optional(),
  valorOrcado: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Informe um valor válido",
    }),
  // Independente de valorOrcado — pode estar preenchido mesmo com o valor
  // vazio (e vice-versa). Único por OS inteira, não por item.
  sinal: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Informe um sinal válido",
    }),
  observacoes: z.string().trim().optional(),
  // Imutável após a criação — no formulário de edição vem como campo
  // oculto com o valor já salvo, só pra satisfazer este schema compartilhado.
  nomeAtendente: z.string().trim().min(1, "Informe o nome do atendente"),
};

export const ordemRelogioSchema = z.object({
  ...camposComuns,
  tipoItem: z.literal("RELOGIO"),
  relogios: z
    .array(relogioDetalheSchema)
    .min(1, "Informe ao menos um modelo de relógio")
    .max(MAX_RELOGIOS_POR_ORDEM, `Limite máximo de ${MAX_RELOGIOS_POR_ORDEM} relógios por ordem`),
  oficina: z.string().trim().optional(),
});

export const ordemJoiaSchema = z.object({
  ...camposComuns,
  tipoItem: z.literal("JOIA"),
  pecas: z
    .array(joiaPecaSchema)
    .min(1, "Informe ao menos uma peça")
    .max(MAX_PECAS_JOIA, `Limite máximo de ${MAX_PECAS_JOIA} peças por ordem`),
});

export const ordemSchema = z
  .discriminatedUnion("tipoItem", [ordemRelogioSchema, ordemJoiaSchema])
  .refine((data) => !data.dataPrevista || data.dataPrevista >= data.dataEntrada, {
    message: "A data prevista não pode ser anterior à data de entrada",
    path: ["dataPrevista"],
  });

// Ao dar baixa (entregar o item), valor e data prometida passam a ser
// obrigatórios — mesmo que tenham ficado em branco no cadastro da ordem.
export const encerrarOrdemSchema = z.object({
  dataRetirada: z.string().trim().min(1, "Informe a data de retirada"),
  observacaoRetirada: z.string().trim().optional(),
  valorOrcado: z
    .string()
    .trim()
    .min(1, "Informe o valor para concluir a baixa")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, {
      message: "Informe um valor válido",
    }),
  dataPrevista: z.string().trim().optional(),
  // Custo pago ao ourives (apenas ordens de joia) — opcional, separado do
  // valor cobrado do cliente, usado para controle de margem.
  custoOurives: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || (!isNaN(Number(v)) && Number(v) >= 0), {
      message: "Informe um custo válido",
    }),
  // Quem retirou o item — capturado na baixa, independente do cadastro do cliente.
  cpfRetirada: z
    .string()
    .trim()
    .min(1, "Informe o CPF de quem retirou")
    .refine((v) => v.replace(/\D/g, "").length === 11, {
      message: "CPF deve ter 11 dígitos",
    })
    .transform((v) => v.replace(/\D/g, "")),
  nomeRetirada: z.string().trim().min(1, "Informe o nome de quem retirou"),
  emailRetirada: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || z.string().email().safeParse(v).success, {
      message: "E-mail inválido",
    }),
});

export type EncerrarOrdemInput = z.input<typeof encerrarOrdemSchema>;

export const STATUS_PECA_OPTIONS = [
  { value: "AGUARDANDO_CONFIRMACAO", label: "Aguardando confirmação" },
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "VENDIDA", label: "Vendida" },
] as const;

export const CATEGORIA_PECA_OPTIONS = [
  { value: "JOIA", label: "Joia" },
  { value: "FOLHEADO", label: "Folheado" },
  { value: "RELOGIO", label: "Relógio" },
] as const;

// Categorias que aceitam o campo de referência (só dígitos).
export const CATEGORIAS_COM_REFERENCIA = ["RELOGIO", "FOLHEADO"] as const;

// Categorias cujo nome é impresso na etiqueta (ver EtiquetaPeca) — só essas
// precisam respeitar o limite de caracteres que cabe em 2 linhas sem truncar.
export const CATEGORIAS_COM_NOME_NA_ETIQUETA = ["JOIA", "FOLHEADO"] as const;

// Maior nome testado visualmente na etiqueta (60x15mm, fonte 8px, 2 linhas
// com line-clamp) que ainda coube sem truncar foi ~46 caracteres; nomes de
// 50+ sempre truncaram. 40 dá margem de segurança confortável.
export const NOME_PECA_ETIQUETA_MAX = 40;

export const FOTO_PECA_TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"] as const;
export const FOTO_PECA_TAMANHO_MAX = 5 * 1024 * 1024; // 5MB

export const pecaSchema = z
  .object({
    nome: z.string().trim().min(2, "Informe o nome da peça"),
    descricao: z.string().trim().optional(),
    // Obrigatoriedade depende da categoria (Joia pode ficar sem preço
    // definido ainda) — validado abaixo, no superRefine.
    preco: z
      .string()
      .trim()
      .refine((v) => v === "" || (!isNaN(Number(v)) && Number(v) >= 0), {
        message: "Informe um preço válido",
      }),
    categoria: z.enum(["JOIA", "FOLHEADO", "RELOGIO"], {
      message: "Selecione a categoria da peça",
    }),
    referencia: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^\d+$/.test(v), {
        message: "Referência deve conter apenas números",
      }),
    // Em branco = Mueller (destino padrão), resolvido em criarPeca.
    lojaDestinoId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      (CATEGORIAS_COM_NOME_NA_ETIQUETA as readonly string[]).includes(data.categoria) &&
      data.nome.length > NOME_PECA_ETIQUETA_MAX
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nome"],
        message: `Nome muito longo para a etiqueta (máx. ${NOME_PECA_ETIQUETA_MAX} caracteres)`,
      });
    }
    // Preço é opcional só para Joia — Folheado e Relógio continuam exigindo.
    if (data.categoria !== "JOIA" && data.preco === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["preco"],
        message: "Informe o preço",
      });
    }
  });
