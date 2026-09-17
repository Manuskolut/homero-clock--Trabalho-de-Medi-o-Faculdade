"use client";

import { useRef, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { RelogioDetalheCard } from "@/components/relogio-detalhe-card";
import { JoiaPecaCard } from "@/components/joia-peca-card";
import {
  formatarMoeda,
  formatarData,
  formatarCpf,
  formatarNumeroOS,
  type RelogioDetalhe,
  type JoiaPeca,
} from "@/lib/format";
import type { EncerrarOrdemInput } from "@/lib/validation";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 6L18 18M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ConfirmButton({
  label,
  title,
  description,
  variant = "danger",
  onConfirm,
}: {
  label: string;
  title: string;
  description: string;
  variant?: "danger" | "primary" | "secondary";
  onConfirm: () => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button type="button" variant={variant} onClick={() => dialogRef.current?.showModal()}>
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 rounded-xl border border-gold-light/50 shadow-xl p-0 backdrop:bg-black/40 w-[90vw] max-w-md"
      >
        <div className="p-6 flex flex-col gap-4 relative">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-gray-light hover:text-ink transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-heading tracking-wide font-semibold text-ink pr-6">{title}</h2>
          <p className="text-sm text-gray">{description}</p>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => dialogRef.current?.close()}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant={variant}
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  await onConfirm();
                  dialogRef.current?.close();
                });
              }}
            >
              {isPending ? "Confirmando…" : "Confirmar"}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function EncerrarOrdemDialog({
  label,
  variant = "primary",
  titulo = "Dar baixa / Entregar item",
  descricao,
  textoConfirmacao,
  labelBotaoConfirmar = "Confirmar baixa",
  labelBotaoConfirmando = "Confirmando baixa…",
  valorAtual,
  dataPrevistaAtual,
  mostrarCustoOurives = false,
  ordemId,
  numeroOS,
  lojaNome,
  clienteNome,
  clienteTelefone,
  clienteEmail,
  tipoItem,
  relogios,
  pecasJoia,
  onConfirm,
}: {
  label: string;
  variant?: "primary" | "secondary";
  titulo?: string;
  descricao?: ReactNode;
  textoConfirmacao?: ReactNode;
  labelBotaoConfirmar?: string;
  labelBotaoConfirmando?: string;
  valorAtual: number | null;
  dataPrevistaAtual: string;
  mostrarCustoOurives?: boolean;
  ordemId: string;
  numeroOS: number;
  lojaNome: string;
  clienteNome: string;
  clienteTelefone: string;
  clienteEmail: string | null;
  tipoItem: "RELOGIO" | "JOIA";
  relogios: RelogioDetalhe[];
  pecasJoia: JoiaPeca[];
  onConfirm: (dados: EncerrarOrdemInput) => Promise<{ ok: boolean; error?: string }>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPending, startTransition] = useTransition();
  const [etapa, setEtapa] = useState<"form" | "revisao">("form");
  const [dataRetirada, setDataRetirada] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [observacaoRetirada, setObservacaoRetirada] = useState("");
  const [valorOrcado, setValorOrcado] = useState(
    valorAtual != null ? String(valorAtual) : ""
  );
  const [dataPrevista, setDataPrevista] = useState(dataPrevistaAtual);
  const [custoOurives, setCustoOurives] = useState("");
  const [nomeRetirada, setNomeRetirada] = useState("");
  const [cpfRetirada, setCpfRetirada] = useState("");
  const [emailRetirada, setEmailRetirada] = useState(clienteEmail ?? "");
  const [confirmado, setConfirmado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [erroCpf, setErroCpf] = useState<string | null>(null);

  function fechar() {
    dialogRef.current?.close();
    setEtapa("form");
    setConfirmado(false);
    setErro(null);
    setErroCpf(null);
  }

  const podeAvancar =
    !!valorOrcado.trim() &&
    !!nomeRetirada.trim() &&
    !!cpfRetirada.trim();

  function tentarAvancar() {
    const digitosCpf = cpfRetirada.replace(/\D/g, "");
    if (digitosCpf.length !== 11) {
      setErroCpf("CPF deve ter exatamente 11 dígitos.");
      return;
    }
    setErroCpf(null);
    setEtapa("revisao");
  }

  return (
    <>
      <Button type="button" variant={variant} onClick={() => dialogRef.current?.showModal()}>
        {label}
      </Button>
      <dialog
        ref={dialogRef}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-0 rounded-xl border border-gold-light/50 shadow-xl p-0 backdrop:bg-black/40 w-[90vw] max-w-lg"
      >
        <div className="p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto relative">
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="absolute top-4 right-4 text-gray-light hover:text-ink transition-colors"
          >
            <XIcon className="h-5 w-5" />
          </button>
          {etapa === "form" ? (
            <>
              <h2 className="text-lg font-heading tracking-wide font-semibold text-ink pr-6">
                {titulo}
              </h2>
              <p className="text-sm text-gray">
                {descricao ?? (
                  <>
                    O cliente está retirando o item da loja. Ao confirmar, a ordem será
                    marcada como <strong>Entregue</strong> e passará a ser somente leitura —
                    os dados do item e as datas não poderão mais ser editados.
                  </>
                )}
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="valorOrcadoBaixa" className="text-sm font-medium text-ink">
                    Valor
                    <span className="text-gold ml-0.5">*</span>
                  </label>
                  <input
                    id="valorOrcadoBaixa"
                    type="number"
                    step="0.01"
                    min="0"
                    value={valorOrcado}
                    onChange={(e) => setValorOrcado(e.target.value)}
                    placeholder="Ex: 350.00"
                    className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dataPrevistaBaixa" className="text-sm font-medium text-ink">
                    Data prometida (opcional)
                  </label>
                  <input
                    id="dataPrevistaBaixa"
                    type="date"
                    value={dataPrevista}
                    onChange={(e) => setDataPrevista(e.target.value)}
                    className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>
              </div>

              {mostrarCustoOurives && (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="custoOurivesBaixa" className="text-sm font-medium text-ink">
                    Custo do ourives (opcional)
                  </label>
                  <input
                    id="custoOurivesBaixa"
                    type="number"
                    step="0.01"
                    min="0"
                    value={custoOurives}
                    onChange={(e) => setCustoOurives(e.target.value)}
                    placeholder="Ex: 80.00"
                    className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                  <span className="text-xs text-gray-light">
                    Valor pago ao ourives pelo conserto — não aparece para o cliente,
                    usado apenas para controle interno de margem.
                  </span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="dataRetirada" className="text-sm font-medium text-ink">
                  Data de retirada
                </label>
                <input
                  id="dataRetirada"
                  type="date"
                  value={dataRetirada}
                  onChange={(e) => setDataRetirada(e.target.value)}
                  className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="observacaoRetirada" className="text-sm font-medium text-ink">
                  Observação da retirada (opcional)
                </label>
                <textarea
                  id="observacaoRetirada"
                  value={observacaoRetirada}
                  onChange={(e) => setObservacaoRetirada(e.target.value)}
                  placeholder='Ex: "Retirado pelo próprio titular", "Retirado por terceiro autorizado"…'
                  className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light min-h-20 resize-y focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="nomeRetirada" className="text-sm font-medium text-ink">
                    Nome de quem retirou
                    <span className="text-gold ml-0.5">*</span>
                  </label>
                  <input
                    id="nomeRetirada"
                    type="text"
                    value={nomeRetirada}
                    onChange={(e) => setNomeRetirada(e.target.value)}
                    placeholder="Ex: Maria da Silva"
                    className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="cpfRetirada" className="text-sm font-medium text-ink">
                    CPF de quem retirou
                    <span className="text-gold ml-0.5">*</span>
                  </label>
                  <input
                    id="cpfRetirada"
                    type="text"
                    value={cpfRetirada}
                    onChange={(e) => {
                      setCpfRetirada(e.target.value);
                      if (erroCpf) setErroCpf(null);
                    }}
                    placeholder="000.000.000-00"
                    className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold ${erroCpf ? "border-red-400" : "border-gray-light/50"}`}
                  />
                  {erroCpf && <span className="text-xs text-red-600">{erroCpf}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="emailRetirada" className="text-sm font-medium text-ink">
                  E-mail do cliente (opcional)
                </label>
                <input
                  id="emailRetirada"
                  type="email"
                  value={emailRetirada}
                  onChange={(e) => setEmailRetirada(e.target.value)}
                  placeholder="Ex: cliente@email.com"
                  className="w-full rounded-lg border border-gray-light/50 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-gray-light focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={fechar}>
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant={variant}
                  disabled={!podeAvancar}
                  onClick={tentarAvancar}
                >
                  Revisar e confirmar
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-heading tracking-wide font-semibold text-ink pr-6">
                Revisão — {titulo}
              </h2>
              <p className="text-sm text-gray">
                Confira os dados abaixo antes de confirmar definitivamente.
              </p>

              <div className="rounded-lg border border-gold-light/50 bg-gold-light/10 px-4 py-3">
                <span className="text-lg font-heading tracking-wide uppercase font-semibold text-gold">
                  {lojaNome} nº {formatarNumeroOS(numeroOS)}
                </span>
              </div>

              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray">Cliente</dt>
                  <dd className="text-ink mt-0.5">
                    {clienteNome} · {clienteTelefone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray">Valor</dt>
                  <dd className="text-ink mt-0.5">{formatarMoeda(Number(valorOrcado))}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray">Data prometida</dt>
                  <dd className="text-ink mt-0.5">{formatarData(dataPrevista)}</dd>
                </div>
                {mostrarCustoOurives && custoOurives && (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray">
                      Custo do ourives
                    </dt>
                    <dd className="text-ink mt-0.5">{formatarMoeda(Number(custoOurives))}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray">Data de retirada</dt>
                  <dd className="text-ink mt-0.5">{formatarData(dataRetirada)}</dd>
                </div>
              </dl>

              {observacaoRetirada && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray">
                    Observação da retirada
                  </dt>
                  <dd className="text-ink mt-1 whitespace-pre-wrap text-sm">
                    {observacaoRetirada}
                  </dd>
                </div>
              )}

              {tipoItem === "RELOGIO" && relogios.length > 0 && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray mb-1.5">
                    Relógios ({relogios.length})
                  </dt>
                  <dd className="flex flex-col gap-3">
                    {relogios.map((relogio, i) => (
                      <RelogioDetalheCard key={i} relogio={relogio} indice={i + 1} />
                    ))}
                  </dd>
                </div>
              )}

              {tipoItem === "JOIA" && pecasJoia.length > 0 && (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-gray mb-1.5">
                    Peças ({pecasJoia.length})
                  </dt>
                  <dd className="flex flex-col gap-3">
                    {pecasJoia.map((peca, i) => (
                      <JoiaPecaCard key={i} peca={peca} indice={i + 1} />
                    ))}
                  </dd>
                </div>
              )}

              <a
                href={`/ordens/${ordemId}/editar`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gold hover:underline self-start"
              >
                Notou algo errado nos dados da OS? Editar em nova aba →
              </a>

              <div>
                <dt className="text-xs uppercase tracking-wide text-gray">Retirado por</dt>
                <dd className="text-ink mt-0.5 text-sm">
                  {nomeRetirada} · CPF {formatarCpf(cpfRetirada)}
                  {emailRetirada && <> · {emailRetirada}</>}
                </dd>
              </div>

              <label className="flex items-start gap-2 text-sm text-ink bg-gold-light/15 border border-gold-light/50 rounded-lg px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={confirmado}
                  onChange={(e) => setConfirmado(e.target.checked)}
                  className="mt-0.5 accent-gold"
                />
                <span>
                  {textoConfirmacao ?? (
                    <>
                      Confirmo que o item está sendo retirado e que desejo marcar esta
                      ordem como <strong>entregue</strong>. Esta ação não poderá ser
                      desfeita facilmente.
                    </>
                  )}
                </span>
              </label>

              {erro && <p className="text-sm text-red-600">{erro}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="secondary" onClick={() => setEtapa("form")}>
                  Editar
                </Button>
                <Button
                  type="button"
                  variant={variant}
                  disabled={isPending || !confirmado}
                  onClick={() => {
                    startTransition(async () => {
                      const resultado = await onConfirm({
                        dataRetirada,
                        observacaoRetirada,
                        valorOrcado,
                        dataPrevista,
                        custoOurives,
                        nomeRetirada,
                        cpfRetirada,
                        emailRetirada,
                      });
                      if (!resultado.ok) {
                        setErro(resultado.error ?? "Não foi possível concluir a baixa.");
                        return;
                      }
                      fechar();
                    });
                  }}
                >
                  {isPending ? labelBotaoConfirmando : labelBotaoConfirmar}
                </Button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
