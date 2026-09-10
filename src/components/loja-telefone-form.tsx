"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { atualizarTelefoneLoja } from "@/lib/actions/lojas";

export function LojaTelefoneForm({
  lojaId,
  lojaNome,
  telefoneAtual,
}: {
  lojaId: string;
  lojaNome: string;
  telefoneAtual: string;
}) {
  const router = useRouter();
  const [telefone, setTelefone] = useState(telefoneAtual);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="flex-1">
        <TextField
          label={lojaNome}
          name={`telefone-${lojaId}`}
          value={telefone}
          onChange={(e) => {
            setTelefone(e.target.value);
            setSucesso(false);
          }}
          error={erro ?? undefined}
          placeholder="Ex: (41) 99999-9999"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={isPending || telefone.trim() === telefoneAtual}
          onClick={() => {
            setErro(null);
            startTransition(async () => {
              const resultado = await atualizarTelefoneLoja(lojaId, telefone);
              if (!resultado.ok) {
                setErro(resultado.error ?? "Não foi possível salvar o telefone.");
                return;
              }
              setSucesso(true);
              router.refresh();
            });
          }}
        >
          {isPending ? "Salvando…" : "Salvar"}
        </Button>
        {sucesso && <span className="text-sm text-[#3D6647]">Salvo!</span>}
      </div>
    </div>
  );
}
