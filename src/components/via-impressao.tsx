import {
  formatarData,
  formatarMoeda,
  formatarNumeroOS,
  labelOficina,
  labelEstadoPeca,
  linhasRelogio,
  linhasPeca,
  calcularValorSinal,
  type RelogioDetalhe,
  type JoiaPeca,
} from "@/lib/format";

export type DadosVia = {
  numeroOS: number;
  lojaNome: string;
  lojaTelefone: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string | null;
  tipoItem: "RELOGIO" | "JOIA";
  dataEntrada: Date | string;
  dataPrevista: Date | string | null;
  valorOrcado: number | null;
  sinal: number | null;
  custoOurives: number | null;
  observacoes: string | null;
  oficina: string | null;
  nomeAtendente: string;
  dataPrometidaManual: boolean;
  relogios: RelogioDetalhe[];
  pecasJoia: JoiaPeca[];
};

function Separador() {
  return <div className="border-t border-dashed border-ink/40 my-2.5" />;
}

function Linha({
  label,
  valor,
  captura = false,
  fontClassName = "",
}: {
  label: string;
  valor: string;
  captura?: boolean;
  /** Sobrescreve o tamanho de fonte padrão da via (15.625px) pro rótulo e valor desta linha. */
  fontClassName?: string;
}) {
  return (
    <div className={`flex justify-between gap-3 ${fontClassName}`}>
      <span className="text-ink/70 shrink-0 whitespace-nowrap">{label}</span>
      <span
        className={
          captura
            ? "text-ink font-bold text-right"
            : "text-ink font-medium text-right print:font-bold"
        }
      >
        {valor}
      </span>
    </div>
  );
}

// Espaço em branco fixo para preenchimento manual à caneta (ex: data de
// urgência, valor não lançado no sistema) — sem ligação com dado nenhum.
function EspacoManual({ className = "w-20 h-8" }: { className?: string }) {
  return <div className={`border-2 border-ink rounded print:border-2 ${className}`} />;
}

function Papel({
  children,
  captura = false,
}: {
  children: React.ReactNode;
  captura?: boolean;
}) {
  return (
    <div
      className={
        captura
          ? "via-print via-forcar-preto mx-auto w-[76mm] max-w-[76mm] bg-white px-0 pt-0 pb-2 font-mono text-[15.625px] leading-relaxed text-ink break-words shadow-none border-0 rounded-none"
          : "via-print mx-auto w-full max-w-[302px] bg-white border border-ink/20 rounded-md shadow-sm px-4 pt-0 pb-5 font-mono text-[15.625px] leading-relaxed text-ink break-words print:shadow-none print:border-0 print:rounded-none print:w-[76mm] print:max-w-[76mm] print:px-0 print:pt-0 print:pb-2 break-after-page"
      }
    >
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
  lojaNomeClassName = "text-sm",
}: {
  numeroOS: number;
  lojaNome: string;
  rotulo: string;
  mostrarUrgente?: boolean;
  /** Via da Loja usa uma fonte 18% maior no nome da loja do que a Via do Cliente. */
  lojaNomeClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logovia.png"
        alt="Homero Clock Relojóias"
        className="via-logo h-[70px] w-auto object-contain"
      />
      <div className="w-full flex items-baseline justify-between mt-3">
        <span className={`${lojaNomeClassName} font-bold uppercase`}>{lojaNome}</span>
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

// Estado das peças do relógio na entrada, em duas linhas fixas (Caixa/
// Pulseira em cima, Vidro/Mostrador embaixo — ex: "Caixa: Bom | Pulseira:
// Regular" / "Vidro: Ruim | Mostrador: Bom") — mantidas no tamanho de fonte
// original (menor que o resto da via), pra não competir visualmente com o
// restante do conteúdo. Espelha a mesma lógica de linhasRelogio() em
// @/lib/format, mas calculada à parte pra poder receber esse estilo próprio
// sem alterar a função compartilhada com o e-mail automático.
function montarLinhaEstado(campos: [string, string | null][]): string | null {
  return (
    campos
      .filter(([, valor]) => valor)
      .map(([campo, valor]) => `${campo}: ${valor}`)
      .join(" | ") || null
  );
}

function estadoRelogioLinhas(relogio: RelogioDetalhe): [string | null, string | null] {
  const linhaCima = montarLinhaEstado([
    ["Caixa", labelEstadoPeca(relogio.estadoCaixa)],
    ["Pulseira", labelEstadoPeca(relogio.estadoPulseira)],
  ]);
  const linhaBaixo = montarLinhaEstado([
    ["Vidro", labelEstadoPeca(relogio.estadoVidro)],
    ["Mostrador", labelEstadoPeca(relogio.estadoMostrador)],
  ]);
  return [linhaCima, linhaBaixo];
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
        const [estadoCima, estadoBaixo] = mostrarEstados
          ? estadoRelogioLinhas(relogio)
          : [null, null];
        return (
          <div key={i}>
            <div className="font-bold">{titulo}</div>
            {linhas.map((linha, j) => (
              <div key={j}>{linha}</div>
            ))}
            {estadoCima && <div className="text-[12.5px]">{estadoCima}</div>}
            {estadoBaixo && <div className="text-[12.5px]">{estadoBaixo}</div>}
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

export function ViaCliente(dados: DadosVia & { captura?: boolean }) {
  const { captura = false } = dados;
  const vs = calcularValorSinal(dados.valorOrcado, dados.sinal);
  return (
    <Papel captura={captura}>
      <CabecalhoVia numeroOS={dados.numeroOS} lojaNome={dados.lojaNome} rotulo="Via do Cliente" />
      <Separador />
      <Linha label="Cliente" valor={dados.clienteNome} captura={captura} />
      <Linha label="Telefone" valor={dados.clienteTelefone} captura={captura} />
      <Separador />
      {dados.tipoItem === "RELOGIO" && dados.relogios.length > 0 && (
        <BlocoRelogios relogios={dados.relogios} />
      )}
      {dados.tipoItem === "JOIA" && <BlocoPecasJoia pecas={dados.pecasJoia} />}
      <Separador />
      {(vs.temValor || !vs.temSinal) && (
        <Linha
          label={vs.labelValor}
          valor={vs.temValor ? vs.valorFormatado : "—"}
          captura={captura}
        />
      )}
      {vs.temSinal && <Linha label="Sinal" valor={vs.sinalFormatado} captura={captura} />}
      <Linha label="Data de entrada" valor={formatarData(dados.dataEntrada)} captura={captura} />
      {dados.observacoes && (
        <>
          <Separador />
          <div>
            <div className="text-ink/70 mb-1">Observações</div>
            <div className="whitespace-pre-wrap">{dados.observacoes}</div>
          </div>
        </>
      )}
      <Separador />
      {dados.lojaTelefone && (
        <Linha
          label="Contato da loja"
          valor={dados.lojaTelefone}
          captura={captura}
          fontClassName="text-[12.5px]"
        />
      )}
      <div className="border border-ink rounded px-2.5 py-2 text-center text-[13.75px] font-bold uppercase leading-snug mt-2.5">
        Este documento NÃO é nota fiscal
        <br />e não tem valor fiscal
      </div>
    </Papel>
  );
}

export function ViaLoja(dados: DadosVia & { captura?: boolean }) {
  const { captura = false } = dados;
  const vs = calcularValorSinal(dados.valorOrcado, dados.sinal);
  return (
    <Papel captura={captura}>
      <CabecalhoVia
        numeroOS={dados.numeroOS}
        lojaNome={dados.lojaNome}
        rotulo="Via Loja"
        mostrarUrgente={!dados.dataPrometidaManual}
        lojaNomeClassName="text-[16.52px]"
      />
      <Separador />
      <Linha label="Cliente" valor={dados.clienteNome} captura={captura} />
      <Linha label="Telefone" valor={dados.clienteTelefone} captura={captura} />
      {dados.clienteEmail && (
        <Linha label="E-mail" valor={dados.clienteEmail} captura={captura} />
      )}
      <Separador />
      {dados.tipoItem === "RELOGIO" && dados.relogios.length > 0 && (
        <BlocoRelogios relogios={dados.relogios} mostrarEstados={false} />
      )}
      {dados.tipoItem === "JOIA" && <BlocoPecasJoia pecas={dados.pecasJoia} />}
      <Separador />
      {dados.tipoItem === "RELOGIO" && dados.oficina && (
        <Linha
          label="Oficina destinada"
          valor={labelOficina(dados.oficina) ?? dados.oficina}
          captura={captura}
        />
      )}
      <div className="flex justify-between items-center gap-3">
        <span className="text-ink/70 shrink-0 whitespace-nowrap">{vs.labelValor}</span>
        {vs.temValor ? (
          <span
            className={
              captura
                ? "text-ink font-bold text-right"
                : "text-ink font-medium text-right print:font-bold"
            }
          >
            {vs.valorFormatado}
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <span className="text-ink font-bold">R$</span>
            <EspacoManual className="w-[120px] h-[38px]" />
          </span>
        )}
      </div>
      {vs.temSinal && <Linha label="Sinal" valor={vs.sinalFormatado} captura={captura} />}
      {dados.tipoItem === "JOIA" && dados.custoOurives != null && (
        <Linha
          label="Custo do ourives"
          valor={formatarMoeda(dados.custoOurives)}
          captura={captura}
        />
      )}
      <Linha label="Data de entrada" valor={formatarData(dados.dataEntrada)} captura={captura} />
      <Linha
        label="Data prometida"
        valor={formatarData(dados.dataPrevista)}
        captura={captura}
      />
      {dados.nomeAtendente && (
        <Linha
          label="Atendente"
          valor={dados.nomeAtendente}
          captura={captura}
          fontClassName="text-[13.453125px]"
        />
      )}
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
