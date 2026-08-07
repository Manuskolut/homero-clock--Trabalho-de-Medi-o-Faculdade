"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-dialog";
import { confirmarRecebimentoPeca } from "@/lib/actions/pecas";

export function ConfirmarRecebimentoButton({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Confirmar recebimento"
      variant="primary"
      title={`Confirmar recebimento de "${nome}"?`}
      description="A peça passa a constar como disponível para venda nesta loja."
      onConfirm={async () => {
        await confirmarRecebimentoPeca(id);
        router.refresh();
      }}
    />
  );
}
