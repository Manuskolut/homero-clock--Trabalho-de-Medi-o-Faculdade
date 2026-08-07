"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { darBaixaPeca } from "@/lib/actions/pecas";
import { formatarMoeda } from "@/lib/format";
import { SelectField } from "@/components/ui/field";
import { clsx } from "clsx";

type LojaOption = { id: string; nome: string };

type ItemVendido = {
  key: number;
  nome: string;
  codigoBarras: string;
  preco: number;
  ok: true;
};

type ItemErro = {
  key: number;
  mensagem: string;
  ok: false;
};

export function DarBaixaScanner({
  isAdmin,
  lojas,
}: {
  isAdmin: boolean;
  lojas?: LojaOption[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [codigo, setCodigo] = useState("");
  const [lojaId, setLojaId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [historico, setHistorico] = useState<(ItemVendido | ItemErro)[]>([]);
  const contador = useRef(0);

  const bloqueadoPorLoja = isAdmin && !lojaId;

  function processarScan() {
    const valor = codigo.trim();
    setCodigo("");
    if (!valor || bloqueadoPorLoja) return;

    startTransition(async () => {
      const resultado = await darBaixaPeca(valor, isAdmin ? lojaId : undefined);
      contador.current += 1;
      if (resultado.ok && resultado.peca) {
        setHistorico((h) => [
          { key: contador.current, ok: true, ...resultado.peca! },
          ...h,
        ]);
      } else {
        setHistorico((h) => [
          { key: contador.current, ok: false, mensagem: resultado.error ?? "Erro ao dar baixa." },
          ...h,
        ]);
      }
      router.refresh();
      inputRef.current?.focus();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {isAdmin && lojas && (
        <div className="max-w-xs">
          <SelectField
            label="Loja que está vendendo"
            name="lojaId"
            value={lojaId}
            onChange={(e) => setLojaId(e.target.value)}
          >
            <option value="">Selecione a loja…</option>
            {lojas.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nome}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="codigoBarras" className="text-sm font-medium text-ink">
          Código de barras
        </label>
        <input
          id="codigoBarras"
          ref={inputRef}
          type="text"
          autoFocus
          disabled={bloqueadoPorLoja}
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              processarScan();
            }
          }}
          placeholder={
            bloqueadoPorLoja ? "Selecione a loja para começar a ler…" : "Aponte o leitor para o código…"
          }
          className="w-full rounded-lg border border-gray-light/50 bg-white px-4 py-4 text-lg font-mono text-ink placeholder:text-gray-light placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold disabled:opacity-60"
        />
        <p className="text-xs text-gray-light">
          Campo fica sempre em foco — basta ler o código com o leitor USB, ele confirma
          automaticamente ao pressionar Enter.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {historico.length === 0 ? (
          <p className="text-sm text-gray-light text-center py-8">
            Nenhuma peça lida ainda nesta sessão.
          </p>
        ) : (
          historico.map((item) => (
            <div
              key={item.key}
              className={clsx(
                "rounded-lg border px-4 py-3 text-sm flex items-center justify-between gap-3",
                item.ok
                  ? "border-[#00b05b]/40 bg-[#00b05b]/10"
                  : "border-red-400/50 bg-red-50"
              )}
            >
              {item.ok ? (
                <>
                  <div>
                    <div className="font-medium text-ink">{item.nome}</div>
                    <div className="text-xs text-gray-light font-mono">{item.codigoBarras}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-ink">{formatarMoeda(item.preco)}</div>
                    <div className="text-xs text-[#00934a]">Vendida</div>
                  </div>
                </>
              ) : (
                <span className="text-red-700">{item.mensagem}</span>
              )}
            </div>
          ))
        )}
      </div>

      {isPending && <p className="text-xs text-gray-light">Processando…</p>}
    </div>
  );
}
