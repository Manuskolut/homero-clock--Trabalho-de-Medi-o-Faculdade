import {
  STATUS_ORDEM_OPTIONS,
  STATUS_PECA_OPTIONS,
  CATEGORIA_PECA_OPTIONS,
  TIPO_ITEM_OPTIONS,
  TIPOS_CONSERTO_JOIA_OPTIONS,
  TIPO_RELOGIO_OPTIONS,
  PULSEIRA_OPTIONS,
  ESTADO_PECA_OPTIONS,
  OFICINA_OPTIONS,
  COR_FOLHEACAO_OPTIONS,
  DEIXOU_OURO_OPTIONS,
} from "@/lib/validation";

export type RelogioDetalhe = {
  modelo: string;
  descricao?: string;
  tipo?: string | null;
  pulseira?: string | null;
  estadoCaixa?: string | null;
  estadoPulseira?: string | null;
  estadoVidro?: string | null;
  estadoMostrador?: string | null;
};

export type JoiaPeca = {
  descricao: string;
  tiposConserto: string[];
  tamanhoAro?: string | null;
  peso?: string | null;
  outroConserto?: string | null;
  deixouOuro?: string | null;
  pesoOuro?: string | null;
  corFolheacao?: string | null;
};

export function formatarData(data: Date | string | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function formatarDataHora(data: Date | string | null | undefined): string {
  if (!data) return "—";
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toLocaleString("pt-BR");
}

export function formatarMoeda(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return "—";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Considera o valor "não definido" tanto quando está ausente quanto quando
// ficou zerado (nenhum orçamento/sinal real é R$0,00 — na prática significa
// que ainda não foi lançado no sistema).
export function valorIndefinido(valor: number | null | undefined): boolean {
  return valor == null || valor === 0;
}

export type ValorSinalInfo = {
  temValor: boolean;
  temSinal: boolean;
  /** "{labelValorBase} total" quando valor e sinal coexistem, senão labelValorBase. */
  labelValor: string;
  valorFormatado: string;
  sinalFormatado: string;
};

// Lógica de exibição condicional de Valor/Sinal, compartilhada entre vias de
// impressão, e-mails automáticos e a tela de detalhe da OS: quando só o
// sinal está preenchido, o valor não deve ser exibido (nem "—" nem R$0,00);
// nos demais casos, o comportamento de Valor permanece o de antes do Sinal
// existir.
export function calcularValorSinal(
  valorOrcado: number | null | undefined,
  sinal: number | null | undefined,
  labelValorBase: string = "Valor"
): ValorSinalInfo {
  const temValor = !valorIndefinido(valorOrcado);
  const temSinal = !valorIndefinido(sinal);
  return {
    temValor,
    temSinal,
    labelValor: temValor && temSinal ? `${labelValorBase} total` : labelValorBase,
    valorFormatado: formatarMoeda(valorOrcado),
    sinalFormatado: formatarMoeda(sinal),
  };
}

export function formatarCpf(cpf: string | null | undefined): string {
  if (!cpf) return "—";
  const digitos = cpf.replace(/\D/g, "");
  if (digitos.length !== 11) return cpf;
  return `${digitos.slice(0, 3)}.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-${digitos.slice(9, 11)}`;
}

// Zero à esquerda até o mínimo de 3 dígitos — 1 → "001", 110 → "110",
// 1000 → "1000" (nunca trunca, só garante o mínimo).
export function formatarNumeroOS(numeroOS: number): string {
  return String(numeroOS).padStart(3, "0");
}

export function paraInputDate(data: Date | string | null | undefined): string {
  if (!data) return "";
  const d = typeof data === "string" ? new Date(data) : data;
  return d.toISOString().slice(0, 10);
}

export function labelStatus(status: string): string {
  return STATUS_ORDEM_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export function labelTipoItem(tipo: string): string {
  return TIPO_ITEM_OPTIONS.find((t) => t.value === tipo)?.label ?? tipo;
}

export function labelTipoConsertoJoia(tipo: string): string {
  return TIPOS_CONSERTO_JOIA_OPTIONS.find((t) => t.value === tipo)?.label ?? tipo;
}

export function labelTipoRelogio(tipo: string | null | undefined): string | null {
  if (!tipo) return null;
  return TIPO_RELOGIO_OPTIONS.find((t) => t.value === tipo)?.label ?? tipo;
}

export function labelPulseira(pulseira: string | null | undefined): string | null {
  if (!pulseira) return null;
  return PULSEIRA_OPTIONS.find((p) => p.value === pulseira)?.label ?? pulseira;
}

export function labelEstadoPeca(estado: string | null | undefined): string | null {
  if (!estado) return null;
  return ESTADO_PECA_OPTIONS.find((e) => e.value === estado)?.label ?? estado;
}

export function labelCorFolheacao(cor: string | null | undefined): string | null {
  if (!cor) return null;
  return COR_FOLHEACAO_OPTIONS.find((c) => c.value === cor)?.label ?? cor;
}

export function labelDeixouOuro(valor: string | null | undefined): string | null {
  if (!valor) return null;
  return DEIXOU_OURO_OPTIONS.find((o) => o.value === valor)?.label ?? valor;
}

export function labelOficina(oficina: string | null | undefined): string | null {
  if (!oficina) return null;
  return OFICINA_OPTIONS.find((o) => o.value === oficina)?.label ?? oficina;
}

// Relógios de uma ordem são guardados como JSON — cada item com seus próprios
// dados técnicos (modelo, tipo, pulseira, estado das peças na entrada).
export function parseRelogiosDetalhes(valor: unknown): RelogioDetalhe[] {
  if (!Array.isArray(valor)) return [];
  return valor as RelogioDetalhe[];
}

// Peças de uma ordem de joia são guardadas como JSON — cada uma com sua
// própria descrição, tipo(s) de conserto e tamanho do aro (se aplicável).
export function parsePecasJoia(valor: unknown): JoiaPeca[] {
  if (!Array.isArray(valor)) return [];
  return valor as JoiaPeca[];
}

// Um item (relógio/peça) formatado como título + linhas de detalhe — fonte
// única usada tanto pela via impressa (renderizada como JSX) quanto pelo
// e-mail automático (juntada como texto), pra não duplicar quais campos
// aparecem e como cada um é formatado.
export type LinhasItem = { titulo: string; linhas: string[] };

export function linhasRelogio(
  relogio: RelogioDetalhe,
  index: number,
  mostrarEstados = true
): LinhasItem {
  const titulo = `Relógio ${index + 1}: ${relogio.modelo}`;
  const linhas: string[] = [];
  if (relogio.descricao) linhas.push(relogio.descricao);
  const tipo = labelTipoRelogio(relogio.tipo);
  if (tipo) linhas.push(`Tipo: ${tipo}`);
  const pulseira = labelPulseira(relogio.pulseira);
  if (pulseira) linhas.push(`Pulseira: ${pulseira}`);
  if (mostrarEstados) {
    const estados = [
      ["Caixa", labelEstadoPeca(relogio.estadoCaixa)],
      ["Pulseira", labelEstadoPeca(relogio.estadoPulseira)],
      ["Vidro", labelEstadoPeca(relogio.estadoVidro)],
      ["Mostrador", labelEstadoPeca(relogio.estadoMostrador)],
    ]
      .filter(([, valor]) => valor)
      .map(([campo, valor]) => `${campo}: ${valor}`)
      .join(" | ");
    if (estados) linhas.push(estados);
  }
  return { titulo, linhas };
}

export function linhasPeca(peca: JoiaPeca, index: number): LinhasItem {
  const titulo = `Peça ${index + 1}: ${peca.descricao}`;
  const linhas: string[] = [
    `Conserto: ${peca.tiposConserto.map(labelTipoConsertoJoia).join(", ")}`,
  ];
  if (peca.outroConserto) linhas.push(peca.outroConserto);
  if (peca.tamanhoAro) linhas.push(`Aro: ${peca.tamanhoAro}`);
  if (peca.peso) linhas.push(`Peso: ${peca.peso}`);
  if (peca.deixouOuro) {
    const sufixo = peca.deixouOuro === "SIM" && peca.pesoOuro ? ` — ${peca.pesoOuro}` : "";
    linhas.push(`Deixou o ouro: ${labelDeixouOuro(peca.deixouOuro)}${sufixo}`);
  }
  if (peca.corFolheacao) linhas.push(`Cor da folheação: ${labelCorFolheacao(peca.corFolheacao)}`);
  return { titulo, linhas };
}

// Cores de status ("vibrante controlada") — usadas em badges, gráficos e
// acentos pontuais em todo o sistema. Sempre acompanhadas do par de texto com
// melhor contraste sobre cada cor.
export const STATUS_COLOR_HEX: Record<string, string> = {
  ATRASADAS: "#e72313",
  RECEBIDO: "#009989",
  EM_ANALISE: "#ce1836",
  EM_CONSERTO: "#e09400",
  PRONTO_RETIRADA: "#00b05b",
  SEM_CONSERTO: "#5e5e5e",
  ENTREGUE: "#141325",
};

// Cores por oficina destinada — tons/opacidades da cor de marca (dourado),
// usadas no gráfico "Por oficina" do painel e na tela de Oficinas.
export const OFICINA_COLOR_HEX: Record<string, string> = {
  "": "#d9d9d9",
  MUELLER: "#63203d",
  JOCKEY: "#4f9732",
  LEANDRO: "#006666",
  JORGE: "#d55c2b",
};

// Cores para avaliação de estado das peças (Bom/Regular/Ruim), reaproveitadas
// em qualquer chip de avaliação de estado no sistema.
export const ESTADO_PECA_COLOR_HEX: Record<string, string> = {
  BOM: "#5C8A66",
  REGULAR: "#C98A2B",
  RUIM: "#B23A3A",
};

export function corStatus(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case "RECEBIDO":
      return { bg: "bg-[#009989]", text: "text-white", dot: "bg-white" };
    case "EM_ANALISE":
      return { bg: "bg-[#ce1836]", text: "text-white", dot: "bg-white" };
    case "EM_CONSERTO":
      return { bg: "bg-[#e09400]", text: "text-white", dot: "bg-white" };
    case "PRONTO_RETIRADA":
      return { bg: "bg-[#00b05b]", text: "text-white", dot: "bg-white" };
    case "SEM_CONSERTO":
      return { bg: "bg-[#5e5e5e]", text: "text-white", dot: "bg-white" };
    case "ENTREGUE":
      return { bg: "bg-[#141325]", text: "text-[#d2c48e]", dot: "bg-[#d2c48e]" };
    default:
      return { bg: "bg-[#009989]", text: "text-white", dot: "bg-white" };
  }
}

// Versão em hex "cru" das mesmas cores de corStatus(), para uso em estilos
// inline (ex: fundo do <select> de status, que não aceita classes dinâmicas).
export function corStatusInline(status: string): { bg: string; text: string } {
  const bg = STATUS_COLOR_HEX[status] ?? STATUS_COLOR_HEX.RECEBIDO;
  if (status === "ENTREGUE") return { bg, text: "#d2c48e" };
  return { bg, text: "#ffffff" };
}

export function estaAtrasada(
  dataPrevista: Date | string | null | undefined,
  status: string
): boolean {
  if (status === "ENTREGUE" || status === "SEM_CONSERTO" || !dataPrevista) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = typeof dataPrevista === "string" ? new Date(dataPrevista) : dataPrevista;
  return d.getTime() < hoje.getTime();
}

export function labelStatusPeca(status: string): string {
  return STATUS_PECA_OPTIONS.find((s) => s.value === status)?.label ?? status;
}

export function labelCategoriaPeca(categoria: string): string {
  return CATEGORIA_PECA_OPTIONS.find((c) => c.value === categoria)?.label ?? categoria;
}

export const STATUS_PECA_COLOR_HEX: Record<string, string> = {
  AGUARDANDO_CONFIRMACAO: "#e09400",
  DISPONIVEL: "#00b05b",
  VENDIDA: "#5e5e5e",
};

export function corStatusPeca(status: string): { bg: string; text: string; dot: string } {
  switch (status) {
    case "AGUARDANDO_CONFIRMACAO":
      return { bg: "bg-[#e09400]", text: "text-white", dot: "bg-white" };
    case "DISPONIVEL":
      return { bg: "bg-[#00b05b]", text: "text-white", dot: "bg-white" };
    case "VENDIDA":
      return { bg: "bg-[#5e5e5e]", text: "text-white", dot: "bg-white" };
    default:
      return { bg: "bg-[#009989]", text: "text-white", dot: "bg-white" };
  }
}

// Peça vendida há mais de 7 dias não pode mais ser reativada (regra de
// negócio 6) — calculado a partir de dataVenda, sempre em dias corridos.
export function diasDesdeVenda(dataVenda: Date | string | null | undefined): number | null {
  if (!dataVenda) return null;
  const d = typeof dataVenda === "string" ? new Date(dataVenda) : dataVenda;
  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

export function podeReativarPeca(dataVenda: Date | string | null | undefined): boolean {
  const dias = diasDesdeVenda(dataVenda);
  return dias !== null && dias <= 7;
}

export function diasParaPrazo(dataPrevista: Date | string | null | undefined): number {
  if (!dataPrevista) return Infinity;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const d = typeof dataPrevista === "string" ? new Date(dataPrevista) : dataPrevista;
  const diffMs = d.getTime() - hoje.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

// Ângulos dos ponteiros do ícone do relógio (ClockLogoIcon) a partir de um
// horário — reaproveitado tanto pelo relógio ao vivo do cabeçalho (recalcula
// a cada minuto) quanto pelas vias de impressão (calculado uma vez, na hora
// da renderização, sem necessidade de atualização contínua).
export function calcularAngulosRelogio(
  data: Date = new Date()
): { hourDeg: number; minuteDeg: number } {
  const minutos = data.getMinutes();
  const horas = data.getHours() % 12;
  return {
    hourDeg: horas * 30 + minutos * 0.5,
    minuteDeg: minutos * 6,
  };
}
