import {
  formatarData,
  formatarMoeda,
  formatarNumeroOS,
  labelOficina,
  calcularAngulosRelogio,
  linhasRelogio,
  linhasPeca,
  type RelogioDetalhe,
  type JoiaPeca,
} from "@/lib/format";
import { ClockLogoIcon } from "@/components/icons/clock-logo";

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
      <span className="text-ink/70">{label}</span>
      <span className="text-ink font-medium text-right">{valor}</span>
    </div>
  );
}

// Espaço em branco fixo para preenchimento manual à caneta (ex: data de
// urgência, valor não lançado no sistema) — sem ligação com dado nenhum.
function EspacoManual({ className = "w-20 h-8" }: { className?: string }) {
  return <div className={`border border-ink/40 rounded ${className}`} />;
}

function Papel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[302px] bg-white border border-ink/20 rounded-md shadow-sm px-4 py-5 font-mono text-[12.5px] leading-relaxed text-ink print:shadow-none print:border-0 print:rounded-none break-after-page">
      {children}
    </div>
  );
}

function Cabecalho({ numeroOS, lojaNome, rotulo }: { numeroOS: number; lojaNome: string; rotulo: string }) {
  const { hourDeg, minuteDeg } = calcularAngulosRelogio();
  return (
    <div className="text-center">
      <div className="text-xs tracking-widest uppercase text-ink/60">Homero Clock Relojoarias</div>
      <div className="flex items-center justify-center gap-2 mt-1">
        <ClockLogoIcon className="h-[19px] w-[19px] text-ink shrink-0" hourDeg={hourDeg} minuteDeg={minuteDeg} />
        <span className="text-sm font-bold uppercase">{lojaNome}</span>
      </div>
      <div className="text-base font-bold mt-0.5">OS Nº {formatarNumeroOS(numeroOS)}</div>
      <div className="text-[11px] uppercase tracking-wide text-ink/60 mt-1">{rotulo}</div>
    </div>
  );
}

// Cabeçalho exclusivo da Via da Loja — duas colunas: identificação da OS à
// esquerda, e à direita um aviso "URGENTE" com um espaço em branco fixo
// (sem ligação com dados do sistema) para anotação manual de data quando o
// caso exigir urgência.
function CabecalhoLoja({ numeroOS, lojaNome }: { numeroOS: number; lojaNome: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-bold uppercase">{lojaNome}</div>
        <div className="text-base font-bold mt-0.5">OS Nº {formatarNumeroOS(numeroOS)}</div>
        <div className="text-[11px] uppercase tracking-wide text-ink/60 mt-1">Via Loja</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <div className="text-xs font-bold uppercase">Urgente</div>
        <EspacoManual />
      </div>
    </div>
  );
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
        const { titulo, linhas } = linhasRelogio(relogio, i, mostrarEstados);
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
      <Cabecalho numeroOS={dados.numeroOS} lojaNome={dados.lojaNome} rotulo="Via do Cliente" />
      <Separador />
      <Linha label="Cliente" valor={dados.clienteNome} />
      <Linha label="Telefone" valor={dados.clienteTelefone} />
      <Separador />
      {dados.tipoItem === "RELOGIO" && dados.relogios.length > 0 && (
        <BlocoRelogios relogios={dados.relogios} />
      )}
      {dados.tipoItem === "JOIA" && <BlocoPecasJoia pecas={dados.pecasJoia} />}
      <Separador />
      <Linha label="Valor" valor={formatarMoeda(dados.valorOrcado)} />
      <Linha label="Data de entrada" valor={formatarData(dados.dataEntrada)} />
      <Separador />
      <div className="border border-ink rounded px-2.5 py-2 text-center text-[11px] font-bold uppercase leading-snug">
        Este documento NÃO é nota fiscal
        <br />e não tem valor fiscal
      </div>
    </Papel>
  );
}

export function ViaLoja(dados: DadosVia) {
  return (
    <Papel>
      <CabecalhoLoja numeroOS={dados.numeroOS} lojaNome={dados.lojaNome} />
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
        <span className="text-ink/70">Valor</span>
        {dados.valorOrcado != null ? (
          <span className="text-ink font-medium text-right">
            {formatarMoeda(dados.valorOrcado)}
          </span>
        ) : (
          <EspacoManual className="w-16 h-5" />
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
