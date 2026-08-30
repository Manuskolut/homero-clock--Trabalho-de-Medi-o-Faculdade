"use client";

import { useRouter } from "next/navigation";
import { ConfirmButton } from "@/components/confirm-dialog";
import { excluirCliente } from "@/lib/actions/clientes";

export function ExcluirClienteButton({
  id,
  nome,
  totalOrdens,
}: {
  id: string;
  nome: string;
  totalOrdens: number;
}) {
  const router = useRouter();

  return (
    <ConfirmButton
      label="Excluir cliente"
      variant="danger"
      title={`Excluir "${nome}"?`}
      description={
        totalOrdens > 0
          ? `Este cliente tem ${totalOrdens} ordem(ns) de serviço registrada(s). Excluir vai apagar o cliente E todas essas ordens permanentemente. Esta ação não pode ser desfeita.`
          : "O cliente será removido permanentemente do sistema. Esta ação não pode ser desfeita."
      }
      onConfirm={async () => {
        await excluirCliente(id);
        router.push("/clientes");
        router.refresh();
      }}
    />
  );
}
