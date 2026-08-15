"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-dialog";
import { excluirPeca } from "@/lib/actions/pecas";

export function ExcluirPecaButton({
  id,
  nome,
  temHistorico = false,
}: {
  id: string;
  nome: string;
  // true quando a peça já teve venda/reativação — só um admin chega aqui
  // com isso true, já que a loja Mueller não pode excluir peça com histórico.
  temHistorico?: boolean;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Excluir"
      variant="danger"
      title={`Excluir "${nome}"?`}
      description={
        temHistorico
          ? "Esta peça já teve venda ou reativação registrada. Excluir vai apagar a peça E todo esse histórico permanentemente. Esta ação não pode ser desfeita."
          : "A peça será removida permanentemente do sistema. Esta ação não pode ser desfeita."
      }
      onConfirm={async () => {
        await excluirPeca(id);
        router.refresh();
      }}
    />
  );
}
