"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-dialog";
import { excluirPeca } from "@/lib/actions/pecas";

export function ExcluirPecaButton({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Excluir"
      variant="danger"
      title={`Excluir "${nome}"?`}
      description="A peça será removida permanentemente do sistema. Esta ação não pode ser desfeita."
      onConfirm={async () => {
        await excluirPeca(id);
        router.refresh();
      }}
    />
  );
}
