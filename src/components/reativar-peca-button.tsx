"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-dialog";
import { reativarPeca } from "@/lib/actions/pecas";

export function ReativarPecaButton({ id, nome }: { id: string; nome: string }) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Reativar"
      variant="secondary"
      title={`Reativar "${nome}"?`}
      description="A peça volta a ficar disponível para venda. A venda anterior permanece registrada no histórico."
      onConfirm={async () => {
        await reativarPeca(id);
        router.refresh();
      }}
    />
  );
}
