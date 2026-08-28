"use client";

import { useActionState, useState, type ChangeEvent } from "react";
import { TextField, TextAreaField, SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import {
  CATEGORIA_PECA_OPTIONS,
  CATEGORIAS_COM_REFERENCIA,
  CATEGORIAS_COM_NOME_NA_ETIQUETA,
  NOME_PECA_ETIQUETA_MAX,
  FOTO_PECA_TAMANHO_MAX,
} from "@/lib/validation";
import { comprimirFotoPeca } from "@/lib/image-compress";
import type { ActionState } from "@/lib/actions/clientes";
import { clsx } from "clsx";

const initialState: ActionState = { ok: true };

const ERRO_ENVIO_GENERICO =
  "Não foi possível salvar a peça. Verifique sua conexão e tente novamente, ou escolha uma foto menor.";

function ehErroDeRedirecionamento(erro: unknown): boolean {
  return (
    typeof erro === "object" &&
    erro !== null &&
    "digest" in erro &&
    typeof (erro as { digest?: unknown }).digest === "string" &&
    (erro as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

type LojaOption = { id: string; nome: string };
type Categoria = "JOIA" | "FOLHEADO" | "RELOGIO";

export function PecaForm({
  action,
  lojas,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  lojas: LojaOption[];
}) {
  const [fotoErro, setFotoErro] = useState<string | null>(null);
  const [fotoNome, setFotoNome] = useState<string | null>(null);
  const [fotoProcessando, setFotoProcessando] = useState(false);

  async function acaoComTratamentoDeErro(prev: ActionState, formData: FormData) {
    try {
      return await action(prev, formData);
    } catch (erro) {
      if (ehErroDeRedirecionamento(erro)) throw erro;
      return { ok: false, errors: { _form: ERRO_ENVIO_GENERICO } };
    }
  }

  async function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const arquivo = input.files?.[0];
    setFotoErro(null);
    if (!arquivo) {
      setFotoNome(null);
      return;
    }

    setFotoProcessando(true);
    try {
      const comprimida = await comprimirFotoPeca(arquivo);
      if (comprimida.size > FOTO_PECA_TAMANHO_MAX) {
        setFotoErro("A foto é muito grande mesmo após compressão. Escolha uma imagem menor.");
        setFotoNome(null);
        input.value = "";
        return;
      }
      const dt = new DataTransfer();
      dt.items.add(comprimida);
      input.files = dt.files;
      setFotoNome(comprimida.name);
    } catch {
      setFotoErro("Não foi possível processar a foto. Tente novamente ou escolha outra imagem.");
      setFotoNome(null);
      input.value = "";
    } finally {
      setFotoProcessando(false);
    }
  }

  const [state, formAction, isPending] = useActionState(acaoComTratamentoDeErro, initialState);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [nome, setNome] = useState("");
  const mostrarReferencia = categoria
    ? (CATEGORIAS_COM_REFERENCIA as readonly string[]).includes(categoria)
    : false;
  const limitarNome = categoria
    ? (CATEGORIAS_COM_NOME_NA_ETIQUETA as readonly string[]).includes(categoria)
    : false;

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">
          Categoria
          <span className="text-gold ml-0.5">*</span>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIA_PECA_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategoria(opt.value)}
              className={clsx(
                "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                categoria === opt.value
                  ? "bg-gold text-white border-gold shadow-sm"
                  : "bg-white text-ink border-gray-light/50 hover:border-gold-light"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <input type="hidden" name="categoria" value={categoria ?? ""} />
        {state.errors?.categoria && (
          <span className="text-xs text-red-600">{state.errors.categoria}</span>
        )}
      </div>

      {categoria && (
        <>
          <TextField
            label="Nome da peça"
            name="nome"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={limitarNome ? NOME_PECA_ETIQUETA_MAX : undefined}
            hint={limitarNome ? `${nome.length}/${NOME_PECA_ETIQUETA_MAX}` : undefined}
            error={state.errors?.nome}
            placeholder="Ex: Pulseira de couro marrom"
          />
          <TextAreaField
            label="Descrição (opcional)"
            name="descricao"
            error={state.errors?.descricao}
            placeholder="Detalhes adicionais da peça…"
          />
          <TextField
            label={categoria === "JOIA" ? "Preço (opcional)" : "Preço"}
            name="preco"
            type="number"
            step="0.01"
            min="0"
            required={categoria !== "JOIA"}
            error={state.errors?.preco}
            placeholder="Ex: 89.90"
          />
          {mostrarReferencia && (
            <TextField
              label="Referência (opcional)"
              name="referencia"
              inputMode="numeric"
              pattern="[0-9]*"
              error={state.errors?.referencia}
              placeholder="Ex: 12345"
            />
          )}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="foto" className="text-sm font-medium text-ink">
              Foto (opcional)
            </label>
            <div className="flex items-center gap-3">
              <label
                htmlFor="foto"
                className="cursor-pointer rounded-md bg-gold px-3 py-1.5 text-sm font-medium text-white transition-colors"
              >
                <span className="sm:hidden">Abrir câmera</span>
                <span className="hidden sm:inline">Escolher arquivo</span>
              </label>
              <span className="text-sm text-gray truncate">
                {fotoProcessando
                  ? "Otimizando foto…"
                  : (fotoNome ?? "Nenhum arquivo selecionado")}
              </span>
            </div>
            <input
              id="foto"
              name="foto"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              disabled={fotoProcessando}
              onChange={handleFotoChange}
              className="sr-only"
            />
            {(fotoErro ?? state.errors?.foto) && (
              <span className="text-xs text-red-600">{fotoErro ?? state.errors?.foto}</span>
            )}
          </div>
          <SelectField
            label="Loja destino"
            name="lojaDestinoId"
            error={state.errors?.lojaDestinoId}
            defaultValue=""
          >
            <option value="">Mueller</option>
            {lojas
              .filter((loja) => loja.id !== "mueller")
              .map((loja) => (
                <option key={loja.id} value={loja.id}>
                  {loja.nome}
                </option>
              ))}
          </SelectField>

          {state.errors?._form && <p className="text-sm text-red-600">{state.errors._form}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando…" : "Cadastrar peça"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
