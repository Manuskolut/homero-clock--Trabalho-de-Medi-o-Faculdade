"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { Button, LinkButton } from "@/components/ui/button";
import { RelogiosFieldArray } from "@/components/relogios-field-array";
import { JoiasFieldArray } from "@/components/joias-field-array";
import { OFICINA_OPTIONS } from "@/lib/validation";
import { formatarNumeroOS } from "@/lib/format";
import { buscarClientePorTelefone, type ActionState } from "@/lib/actions/clientes";
import { previewProximoNumeroOS } from "@/lib/actions/ordens";
import { clsx } from "clsx";
import type { RelogioDetalhe, JoiaPeca } from "@/lib/format";

const initialState: ActionState = { ok: true };

type LojaOption = { id: string; nome: string };
type TipoOrdem = "RELOGIO" | "JOIA";

export function OrdemForm({
  action,
  lojas,
  numeroPreviewInicial,
  lojaNomeSessao,
  defaultValues,
  cancelHref,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  /** Presente só quando a sessão é Admin — permite escolher a loja da ordem. */
  lojas?: LojaOption[];
  /** Prévia do próximo número (sessão de Loja) — Admin busca dinamicamente ao escolher a loja. */
  numeroPreviewInicial?: number | null;
  /** Nome da loja quando a sessão é de Loja (Admin usa o nome escolhido no seletor). */
  lojaNomeSessao?: string;
  defaultValues?: {
    lojaId?: string;
    tipoItem?: string;
    dataEntrada?: string;
    dataPrevista?: string;
    valorOrcado?: number;
    sinal?: number;
    observacoes?: string | null;
    relogios?: RelogioDetalhe[];
    oficina?: string | null;
    pecasJoia?: JoiaPeca[];
    /** Preenche nome/telefone ao entrar já sabendo o cliente (ex: vindo de /clientes/[id]). */
    clienteNomePrefill?: string;
    clienteTelefonePrefill?: string;
    /** Modo edição: cliente vira somente leitura, mostrado a partir destes valores. */
    clienteNomeAtual?: string;
    clienteTelefoneAtual?: string;
    /** Modo edição: nome do atendente já salvo (imutável, vai como campo oculto). */
    nomeAtendenteAtual?: string;
  };
  cancelHref: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const tipoTravado = !!defaultValues?.tipoItem;
  const isEdicao = tipoTravado;
  const [tipo, setTipo] = useState<TipoOrdem | null>(
    defaultValues?.tipoItem === "RELOGIO" || defaultValues?.tipoItem === "JOIA"
      ? defaultValues.tipoItem
      : null
  );
  const [lojaId, setLojaId] = useState(defaultValues?.lojaId ?? "");
  const [numeroPreview, setNumeroPreview] = useState<number | null>(numeroPreviewInicial ?? null);

  const [nomeCliente, setNomeCliente] = useState(defaultValues?.clienteNomePrefill ?? "");
  const [telefoneCliente, setTelefoneCliente] = useState(
    defaultValues?.clienteTelefonePrefill ?? ""
  );
  // Nunca pré-preenchido, mesmo quando o telefone bate com um cliente
  // existente — em branco significa "não alterar o e-mail já salvo".
  const [emailCliente, setEmailCliente] = useState("");
  const [verificandoTelefone, setVerificandoTelefone] = useState(false);
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const jaVerificouPrefill = useRef(false);

  useEffect(() => {
    if (!lojas) return; // sessão de loja: número já veio pronto do server
    let cancelado = false;
    previewProximoNumeroOS(lojaId || undefined).then((valor) => {
      if (!cancelado) setNumeroPreview(valor);
    });
    return () => {
      cancelado = true;
    };
  }, [lojaId, lojas]);

  async function verificarTelefone(telefoneAtual: string) {
    if (isEdicao) return;
    const digitos = telefoneAtual.replace(/\D/g, "");
    if (digitos.length < 8) {
      setClienteEncontrado(false);
      return;
    }
    if (lojas && !lojaId) return; // admin sem loja escolhida ainda

    setVerificandoTelefone(true);
    const encontrado = await buscarClientePorTelefone(telefoneAtual, lojas ? lojaId : undefined);
    setVerificandoTelefone(false);
    if (encontrado) {
      setClienteEncontrado(true);
      setNomeCliente(encontrado.nome);
    } else {
      setClienteEncontrado(false);
    }
  }

  useEffect(() => {
    if (isEdicao || jaVerificouPrefill.current) return;
    const telefonePrefill = defaultValues?.clienteTelefonePrefill;
    if (!telefonePrefill) return;
    if (lojas && !lojaId) return;
    jaVerificouPrefill.current = true;
    Promise.resolve().then(() => verificarTelefone(telefonePrefill));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lojaId]);

  const lojaNomeAtual = lojas ? lojas.find((l) => l.id === lojaId)?.nome : lojaNomeSessao;
  const semLojaEscolhida = lojas !== undefined && !lojaId;

  return (
    <form action={formAction} className="flex flex-col gap-5 w-full">
      {lojas && (
        <SelectField
          label="Loja"
          name="lojaId"
          required
          disabled={isEdicao}
          value={lojaId}
          onChange={(e) => setLojaId(e.target.value)}
          error={state.errors?.lojaId}
        >
          <option value="">Selecione a loja…</option>
          {lojas.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nome}
            </option>
          ))}
        </SelectField>
      )}

      {lojaNomeAtual && (
        <div className="rounded-lg border border-gold-light/50 bg-gold-light/10 px-4 py-3">
          <span className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            {lojaNomeAtual} nº {formatarNumeroOS(numeroPreview ?? 1)}
          </span>
        </div>
      )}

      {isEdicao ? (
        <div className="rounded-lg border border-gray-light/50 bg-gray-light/10 px-4 py-3">
          <div className="text-xs uppercase tracking-wide text-gray">Cliente</div>
          <div className="text-ink text-sm mt-0.5">
            {defaultValues?.clienteNomeAtual} · {defaultValues?.clienteTelefoneAtual}
          </div>
          <p className="text-xs text-gray-light mt-1">
            O cliente não pode ser alterado após a criação da ordem.
          </p>
          <input type="hidden" name="nomeCliente" value={defaultValues?.clienteNomeAtual ?? ""} />
          <input
            type="hidden"
            name="telefoneCliente"
            value={defaultValues?.clienteTelefoneAtual ?? ""}
          />
        </div>
      ) : (
        <>
          <TextField
            label="Telefone"
            name="telefoneCliente"
            required
            disabled={semLojaEscolhida}
            value={telefoneCliente}
            onChange={(e) => {
              setTelefoneCliente(e.target.value);
              setClienteEncontrado(false);
            }}
            onBlur={(e) => verificarTelefone(e.target.value)}
            error={state.errors?.telefoneCliente}
            placeholder={semLojaEscolhida ? "Selecione a loja primeiro…" : "Ex: (11) 91234-5678"}
          />
          {verificandoTelefone && (
            <p className="text-xs text-gray-light -mt-3">Verificando…</p>
          )}
          {clienteEncontrado && !verificandoTelefone && (
            <p className="text-xs text-gold bg-gold-light/15 border border-gold-light/50 rounded-lg px-3 py-2 -mt-1">
              Cliente já cadastrado nesta loja — confira ou corrija o nome abaixo.
            </p>
          )}
          <TextField
            label="Nome do cliente"
            name="nomeCliente"
            required
            disabled={semLojaEscolhida}
            value={nomeCliente}
            onChange={(e) => setNomeCliente(e.target.value)}
            error={state.errors?.nomeCliente}
            placeholder="Ex: Maria da Silva"
          />
          <TextField
            label="E-mail"
            name="emailCliente"
            disabled={semLojaEscolhida}
            value={emailCliente}
            onChange={(e) => setEmailCliente(e.target.value)}
            error={state.errors?.emailCliente}
            placeholder="Opcional — deixe em branco para não alterar o e-mail já salvo"
          />
        </>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">
          Tipo de serviço
          <span className="text-gold ml-0.5">*</span>
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={tipoTravado}
            onClick={() => setTipo("RELOGIO")}
            className={clsx(
              "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              tipo === "RELOGIO"
                ? "bg-gold text-white border-gold shadow-sm"
                : "bg-white text-ink border-gray-light/50 hover:border-gold-light"
            )}
          >
            Serviço de Relógio
          </button>
          <button
            type="button"
            disabled={tipoTravado}
            onClick={() => setTipo("JOIA")}
            className={clsx(
              "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
              tipo === "JOIA"
                ? "bg-gold text-white border-gold shadow-sm"
                : "bg-white text-ink border-gray-light/50 hover:border-gold-light"
            )}
          >
            Serviço de Joia
          </button>
        </div>
        <input type="hidden" name="tipoItem" value={tipo ?? ""} />
        {state.errors?.tipoItem && (
          <span className="text-xs text-red-600">{state.errors.tipoItem}</span>
        )}
      </div>

      {tipo && (
        <>
          {tipo === "RELOGIO" ? (
            <>
              <RelogiosFieldArray
                defaultRelogios={defaultValues?.relogios ?? []}
                error={state.errors?.relogios}
              />
              <SelectField
                label="Oficina destinada"
                name="oficina"
                defaultValue={defaultValues?.oficina ?? ""}
                error={state.errors?.oficina}
              >
                <option value="">Selecione…</option>
                {OFICINA_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </SelectField>
            </>
          ) : (
            <JoiasFieldArray
              defaultPecas={defaultValues?.pecasJoia ?? []}
              error={state.errors?.pecas}
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label={
                (tipo === "RELOGIO" ? "Valor" : "Valor total") + " (opcional)"
              }
              name="valorOrcado"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultValues?.valorOrcado}
              error={state.errors?.valorOrcado}
              placeholder="Ex: 350.00"
            />
            <TextField
              label="Sinal (opcional)"
              name="sinal"
              type="number"
              step="0.01"
              min="0"
              defaultValue={defaultValues?.sinal}
              error={state.errors?.sinal}
              placeholder="Ex: 100.00"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Data de entrada"
              name="dataEntrada"
              type="date"
              required
              defaultValue={defaultValues?.dataEntrada}
              error={state.errors?.dataEntrada}
            />
            <TextField
              label="Data prometida (opcional)"
              name="dataPrevista"
              type="date"
              defaultValue={defaultValues?.dataPrevista}
              error={state.errors?.dataPrevista}
            />
          </div>
          <p className="text-xs text-gray-light -mt-3">
            Valor e data prometida podem ficar em branco por enquanto — serão exigidos
            ao dar baixa na ordem.
          </p>

          <TextAreaField
            label="Observações"
            name="observacoes"
            defaultValue={defaultValues?.observacoes ?? ""}
            error={state.errors?.observacoes}
            placeholder="Observações adicionais (opcional)…"
          />

          {isEdicao ? (
            <input
              type="hidden"
              name="nomeAtendente"
              value={defaultValues?.nomeAtendenteAtual ?? ""}
            />
          ) : (
            <TextField
              label="Nome do atendente (primeiro nome)"
              name="nomeAtendente"
              required
              error={state.errors?.nomeAtendente}
              placeholder="Ex: João"
            />
          )}
        </>
      )}

      {state.errors?._form && (
        <p className="text-sm text-red-600">{state.errors._form}</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending || !tipo}>
          {isPending ? "Salvando…" : "Salvar ordem de serviço"}
        </Button>
        <LinkButton href={cancelHref} variant="secondary">
          Cancelar
        </LinkButton>
      </div>
    </form>
  );
}
