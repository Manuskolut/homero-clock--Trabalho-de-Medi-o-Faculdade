import { Resend } from "resend";
import type { TipoItem } from "@prisma/client";
import {
  parseRelogiosDetalhes,
  parsePecasJoia,
  linhasRelogio,
  linhasPeca,
  formatarData,
  formatarMoeda,
  formatarNumeroOS,
} from "@/lib/format";

const resend = new Resend(process.env.RESEND_API_KEY);

const REMETENTE = "naoresponder@skolutech.com";

const AVISO_FISCAL = "Este documento não é nota fiscal e não tem valor fiscal.";

// Efeito colateral: nunca deve derrubar o fluxo principal (criação/baixa da
// OS já foi salva antes desta chamada). Falha só vai pro log.
async function enviarEmail(destinatario: string, assunto: string, texto: string) {
  try {
    // A SDK do Resend não lança exceção em erro de API (chave inválida,
    // domínio não verificado, destinatário bloqueado etc.) — ela retorna
    // { data, error }. Precisa checar `error` manualmente.
    const { error } = await resend.emails.send({
      from: REMETENTE,
      to: destinatario,
      subject: assunto,
      text: texto,
    });
    if (error) {
      console.error(`[email] Resend recusou o envio para ${destinatario}:`, error);
    }
  } catch (erro) {
    console.error(`[email] falha ao enviar para ${destinatario}:`, erro);
  }
}

// Mesmos dados/campos exibidos na Via do Cliente (ver via-impressao.tsx) —
// usa as mesmas funções de format.ts pra não duplicar a lógica de formatação.
function descreverServico(tipoItem: TipoItem, relogiosDetalhes: unknown, pecasJoia: unknown): string {
  const itens =
    tipoItem === "RELOGIO"
      ? parseRelogiosDetalhes(relogiosDetalhes).map((r, i) => linhasRelogio(r, i))
      : parsePecasJoia(pecasJoia).map((p, i) => linhasPeca(p, i));
  return itens.map(({ titulo, linhas }) => [titulo, ...linhas].join("\n")).join("\n\n");
}

type DadosServico = {
  destinatario: string;
  lojaNome: string;
  numeroOS: number;
  clienteNome: string;
  clienteTelefone: string;
  tipoItem: TipoItem;
  relogiosDetalhes: unknown;
  pecasJoia: unknown;
  valorOrcado: number | null;
};

export async function enviarEmailEntradaOrdem(dados: DadosServico & { dataEntrada: Date }) {
  const os = formatarNumeroOS(dados.numeroOS);
  const servico = descreverServico(dados.tipoItem, dados.relogiosDetalhes, dados.pecasJoia);
  const texto = [
    `Recebemos seu item na loja ${dados.lojaNome}.`,
    "",
    `OS #${os}`,
    `Cliente: ${dados.clienteNome}`,
    `Telefone: ${dados.clienteTelefone}`,
    "",
    "Serviço(s) a realizar:",
    servico,
    "",
    `Valor orçado: ${formatarMoeda(dados.valorOrcado)}`,
    `Data de entrada: ${formatarData(dados.dataEntrada)}`,
    "",
    AVISO_FISCAL,
  ].join("\n");
  await enviarEmail(dados.destinatario, `OS #${os} — ${dados.lojaNome}`, texto);
}

export async function enviarEmailBaixaOrdem(dados: DadosServico & { dataRetirada: Date }) {
  const os = formatarNumeroOS(dados.numeroOS);
  const servico = descreverServico(dados.tipoItem, dados.relogiosDetalhes, dados.pecasJoia);
  const texto = [
    `Confirmamos a retirada da OS #${os} na loja ${dados.lojaNome}.`,
    "",
    `Cliente: ${dados.clienteNome}`,
    `Telefone: ${dados.clienteTelefone}`,
    "",
    "Serviço realizado:",
    servico,
    "",
    `Valor: ${formatarMoeda(dados.valorOrcado)}`,
    `Data de retirada: ${formatarData(dados.dataRetirada)}`,
    "",
    AVISO_FISCAL,
  ].join("\n");
  await enviarEmail(dados.destinatario, `OS #${os} — Retirada confirmada`, texto);
}
