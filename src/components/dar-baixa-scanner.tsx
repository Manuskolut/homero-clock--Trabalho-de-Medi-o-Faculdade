"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buscarPecaParaVenda, darBaixaPeca, type PecaParaVenda } from "@/lib/actions/pecas";
import { formatarMoeda } from "@/lib/format";
import { SelectField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
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
  const [pecaPendente, setPecaPendente] = useState<PecaParaVenda | null>(null);
  const contador = useRef(0);

  const bloqueadoPorLoja = isAdmin && !lojaId;

  function registrarErro(mensagem: string) {
    contador.current += 1;
    setHistorico((h) => [{ key: contador.current, ok: false, mensagem }, ...h]);
  }

  function processarScan() {
    const valor = codigo.trim();
    setCodigo("");
    if (!valor || bloqueadoPorLoja) return;

    startTransition(async () => {
      const resultado = await buscarPecaParaVenda(valor);
      if (resultado.ok && resultado.peca) {
        // Lê outra peça enquanto uma confirmação estava pendente: a
        // anterior é descartada sem ter sido vendida.
        setPecaPendente(resultado.peca);
      } else {
        setPecaPendente(null);
        registrarErro(resultado.error ?? "Erro ao buscar a peça.");
      }
      inputRef.current?.focus();
    });
  }

  function confirmarVenda() {
    if (!pecaPendente) return;
    const peca = pecaPendente;

    startTransition(async () => {
      const resultado = await darBaixaPeca(peca.codigoBarras, isAdmin ? lojaId : undefined);
      setPecaPendente(null);
      contador.current += 1;
      if (resultado.ok && resultado.peca) {
        setHistorico((h) => [{ key: contador.current, ok: true, ...resultado.peca! }, ...h]);
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

  function cancelarPendente() {
    setPecaPendente(null);
    inputRef.current?.focus();
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
          Campo fica sempre em foco — ler outro código a qualquer momento substitui a peça em
          confirmação, sem vendê-la.
        </p>
      </div>

      {isPending && !pecaPendente && <p className="text-xs text-gray-light">Buscando…</p>}

      {pecaPendente && (
        <div className="rounded-lg border border-gold-light/60 bg-gold-light/10 p-4 flex flex-col sm:flex-row gap-4">
          {pecaPendente.fotoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pecaPendente.fotoUrl}
              alt={pecaPendente.nome}
              className="w-full sm:w-32 h-32 object-contain rounded-lg border border-gold-light/30 bg-cream shrink-0"
            />
          )}
          <div className="flex-1 flex flex-col gap-1">
            <div className="font-medium text-ink text-lg">{pecaPendente.nome}</div>
            <div className="text-xs text-gray-light font-mono">{pecaPendente.codigoBarras}</div>
            <div className="text-ink font-medium mt-1">{formatarMoeda(pecaPendente.preco)}</div>
          </div>
          <div className="flex sm:flex-col gap-2 justify-end">
            <Button type="button" variant="secondary" disabled={isPending} onClick={cancelarPendente}>
              Cancelar
            </Button>
            <Button type="button" disabled={isPending} onClick={confirmarVenda}>
              {isPending ? "Confirmando…" : "Confirmar venda"}
            </Button>
          </div>
        </div>
      )}

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
    </div>
  );
}
