"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-dialog";
import { excluirOrdem } from "@/lib/actions/ordens";
import { formatarNumeroOS } from "@/lib/format";

export function ExcluirOrdemButton({
  id,
  numeroOS,
  lojaNome,
}: {
  id: string;
  numeroOS: number;
  lojaNome: string;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Excluir OS"
      variant="danger"
      title={`Excluir ordem ${lojaNome} nº ${formatarNumeroOS(numeroOS)}?`}
      description="A ordem será removida das listagens de todas as lojas, mas os dados permanecem no banco para auditoria. Esta ação só pode ser desfeita por suporte técnico."
      onConfirm={async () => {
        await excluirOrdem(id);
        router.push("/ordens");
      }}
    />
  );
}
