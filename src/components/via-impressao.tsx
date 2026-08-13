import {
  formatarData,
  formatarMoeda,
  formatarNumeroOS,
  labelOficina,
  labelEstadoPeca,
  linhasRelogio,
  linhasPeca,
  type RelogioDetalhe,
  type JoiaPeca,
} from "@/lib/format";

type DadosVia = {
  numeroOS: number;
  lojaNome: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string | null;
  tipoItem: "RELOGIO" | "JOIA";
  dataEntrada: Date | string;
  dataPrevista: Date | string | null;
  valorOrcado: number | null;
  custoOurives: number | null;
  observacoes: string | null;
  oficina: string | null;
  relogios: RelogioDetalhe[];
  pecasJoia: JoiaPeca[];
};

function Separador() {
  return <div className="border-t border-dashed border-ink/40 my-2.5" />;
}

function Linha({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink/70 shrink-0 whitespace-nowrap">{label}</span>
      <span className="text-ink font-medium text-right print:font-bold">{valor}</span>
    </div>
  );
}

// Espaço em branco fixo para preenchimento manual à caneta (ex: data de
// urgência, valor não lançado no sistema) — sem ligação com dado nenhum.
function EspacoManual({ className = "w-20 h-8" }: { className?: string }) {
  return <div className={`border-2 border-ink rounded print:border-2 ${className}`} />;
}

// Considera o valor "não definido" tanto quando está ausente quanto quando
// ficou zerado (nenhum orçamento real de conserto é R$0,00 — na prática
// significa que ainda não foi lançado no sistema).
function valorIndefinido(valor: number | null | undefined): boolean {
  return valor == null || valor === 0;
}

function Papel({ children }: { children: React.ReactNode }) {
  return (
    <div className="via-print mx-auto w-full max-w-[302px] bg-white border border-ink/20 rounded-md shadow-sm px-4 pt-0 pb-5 font-mono text-[15.625px] leading-relaxed text-ink break-words print:shadow-none print:border-0 print:rounded-none print:w-[76mm] print:max-w-[76mm] print:px-0 print:pt-0 print:pb-2 break-after-page">
      {children}
    </div>
  );
}

// Cabeçalho compartilhado pelas duas vias: logo da loja centralizada, depois
// nome da loja (esquerda) e número da OS (direita) na mesma linha. A via da
// loja ainda soma o aviso "URGENTE" com espaço em branco pra anotação manual
// de data quando o caso exigir urgência (sem ligação com dados do sistema).
function CabecalhoVia({
  numeroOS,
  lojaNome,
  rotulo,
  mostrarUrgente = false,
}: {
  numeroOS: number;
  lojaNome: string;
  rotulo: string;
  mostrarUrgente?: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logovia.png"
        alt="Homero Clock Relojóias"
        className="via-logo h-[54px] w-auto object-contain"
      />
      <div className="w-full flex items-baseline justify-between mt-3">
        <span className="text-sm font-bold uppercase">{lojaNome}</span>
        <span className="text-[20.8px] font-bold">OS Nº {formatarNumeroOS(numeroOS)}</span>
      </div>
      {mostrarUrgente && (
        <div className="w-full flex justify-end mt-2">
          <div className="flex flex-col items-end gap-1">
            <span className="text-[15px] font-bold uppercase">Urgente</span>
            <EspacoManual />
          </div>
        </div>
      )}
      <div className="text-[13.75px] uppercase tracking-wide text-ink/60 mt-1">{rotulo}</div>
    </div>
  );
}

// Linha-resumo do estado das peças do relógio na entrada (ex: "Caixa: Bom |
// Pulseira: Regular | Vidro: Ruim | Mostrador: Bom") — mantida no tamanho de
// fonte original (menor que o resto da via), pra não competir visualmente
// com o restante do conteúdo. Espelha a mesma lógica de linhasRelogio() em
// @/lib/format, mas calculada à parte pra poder receber esse estilo próprio
// sem alterar a função compartilhada com o e-mail automático.
function estadoRelogioLinha(relogio: RelogioDetalhe): string | null {
  const estados = [
    ["Caixa", labelEstadoPeca(relogio.estadoCaixa)],
    ["Pulseira", labelEstadoPeca(relogio.estadoPulseira)],
    ["Vidro", labelEstadoPeca(relogio.estadoVidro)],
    ["Mostrador", labelEstadoPeca(relogio.estadoMostrador)],
  ]
    .filter(([, valor]) => valor)
    .map(([campo, valor]) => `${campo}: ${valor}`)
    .join(" | ");
  return estados || null;
}

function BlocoRelogios({
  relogios,
  mostrarEstados = true,
}: {
  relogios: RelogioDetalhe[];
  mostrarEstados?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {relogios.map((relogio, i) => {
        const { titulo, linhas } = linhasRelogio(relogio, i, false);
        const estadoLinha = mostrarEstados ? estadoRelogioLinha(relogio) : null;
        return (
          <div key={i}>
            <div className="font-bold">{titulo}</div>
            {linhas.map((linha, j) => (
              <div key={j}>{linha}</div>
            ))}
            {estadoLinha && <div className="text-[12.5px]">{estadoLinha}</div>}
          </div>
        );
      })}
    </div>
  );
}

function BlocoPecasJoia({ pecas }: { pecas: JoiaPeca[] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {pecas.map((peca, i) => {
        const { titulo, linhas } = linhasPeca(peca, i);
        return (
          <div key={i}>
            <div className="font-bold">{titulo}</div>
            {linhas.map((linha, j) => (
              <div key={j}>{linha}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export function ViaCliente(dados: DadosVia) {
  return (
    <Papel>
      <CabecalhoVia numeroOS={dados.numeroOS} lojaNome={dados.lojaNome} rotulo="Via do Cliente" />
      <Separador />
      <Linha label="Cliente" valor={dados.clienteNome} />
      <Linha label="Telefone" valor={dados.clienteTelefone} />
      <Separador />
      {dados.tipoItem === "RELOGIO" && dados.relogios.length > 0 && (
        <BlocoRelogios relogios={dados.relogios} />
      )}
      {dados.tipoItem === "JOIA" && <BlocoPecasJoia pecas={dados.pecasJoia} />}
      <Separador />
      <Linha
        label="Valor"
        valor={valorIndefinido(dados.valorOrcado) ? "—" : formatarMoeda(dados.valorOrcado)}
      />
      <Linha label="Data de entrada" valor={formatarData(dados.dataEntrada)} />
      <Separador />
      <div className="border border-ink rounded px-2.5 py-2 text-center text-[13.75px] font-bold uppercase leading-snug">
        Este documento NÃO é nota fiscal
        <br />e não tem valor fiscal
      </div>
    </Papel>
  );
}

export function ViaLoja(dados: DadosVia) {
  return (
    <Papel>
      <CabecalhoVia
        numeroOS={dados.numeroOS}
        lojaNome={dados.lojaNome}
        rotulo="Via Loja"
        mostrarUrgente
      />
      <Separador />
      <Linha label="Cliente" valor={dados.clienteNome} />
      <Linha label="Telefone" valor={dados.clienteTelefone} />
      {dados.clienteEmail && <Linha label="E-mail" valor={dados.clienteEmail} />}
      <Separador />
      {dados.tipoItem === "RELOGIO" && dados.relogios.length > 0 && (
        <BlocoRelogios relogios={dados.relogios} mostrarEstados={false} />
      )}
      {dados.tipoItem === "JOIA" && <BlocoPecasJoia pecas={dados.pecasJoia} />}
      <Separador />
      {dados.tipoItem === "RELOGIO" && dados.oficina && (
        <Linha label="Oficina destinada" valor={labelOficina(dados.oficina) ?? dados.oficina} />
      )}
      <div className="flex justify-between items-center gap-3">
        <span className="text-ink/70 shrink-0 whitespace-nowrap">Valor</span>
        {!valorIndefinido(dados.valorOrcado) ? (
          <span className="text-ink font-medium text-right print:font-bold">
            {formatarMoeda(dados.valorOrcado)}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="text-ink font-bold">R$</span>
            <EspacoManual className="w-[83px] h-[26px]" />
          </span>
        )}
      </div>
      {dados.tipoItem === "JOIA" && dados.custoOurives != null && (
        <Linha label="Custo do ourives" valor={formatarMoeda(dados.custoOurives)} />
      )}
      <Linha label="Data de entrada" valor={formatarData(dados.dataEntrada)} />
      <Linha label="Data prometida" valor={formatarData(dados.dataPrevista)} />
      {dados.observacoes && (
        <>
          <Separador />
          <div>
            <div className="text-ink/70 mb-1">Observações</div>
            <div className="whitespace-pre-wrap">{dados.observacoes}</div>
          </div>
        </>
      )}
    </Papel>
  );
}
