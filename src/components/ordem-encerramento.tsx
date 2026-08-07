"use client";

import { useRouter } from "next/navigation";
import { EncerrarOrdemDialog, ConfirmButton } from "@/components/confirm-dialog";
import { encerrarOrdem, reabrirOrdem } from "@/lib/actions/ordens";
import type { RelogioDetalhe, JoiaPeca } from "@/lib/format";

export function OrdemEncerramento({
  id,
  finalizada,
  statusAtual,
  tipoItem,
  valorOrcado,
  dataPrevista,
  numeroOS,
  lojaNome,
  clienteNome,
  clienteTelefone,
  relogios,
  pecasJoia,
}: {
  id: string;
  /** true quando a ordem já passou pela baixa formal (dataRetirada preenchida). */
  finalizada: boolean;
  /** Status atual — só usado para ajustar o texto do diálogo (Sem conserto x Entregue). */
  statusAtual: string;
  tipoItem: "RELOGIO" | "JOIA";
  valorOrcado: number | null;
  dataPrevista: string;
  numeroOS: number;
  lojaNome: string;
  clienteNome: string;
  clienteTelefone: string;
  relogios: RelogioDetalhe[];
  pecasJoia: JoiaPeca[];
}) {
  const router = useRouter();
  const ehJoia = tipoItem === "JOIA";
  const ehSemConserto = statusAtual === "SEM_CONSERTO";

  if (finalizada) {
    return (
      <ConfirmButton
        label="Reabrir ordem"
        variant="secondary"
        title="Reabrir ordem de serviço"
        description="Isso removerá a data de retirada e voltará a ordem para o status 'Pronto para retirada'. Use apenas em caso de engano."
        onConfirm={async () => {
          await reabrirOrdem(id);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="flex flex-wrap gap-3">
      <EncerrarOrdemDialog
        label="Dar baixa / Entregar item"
        descricao={
          ehSemConserto ? (
            <>
              O cliente está retirando o item da loja. Como esta ordem já está
              marcada como <strong>Sem conserto</strong>, ela permanecerá com esse
              status — só passará a ser somente leitura, e os dados do item e as
              datas não poderão mais ser editados.
            </>
          ) : undefined
        }
        textoConfirmacao={
          ehSemConserto ? (
            <>
              Confirmo que o item está sendo retirado sem conserto e que desejo
              registrar a baixa desta ordem. Esta ação não poderá ser desfeita
              facilmente.
            </>
          ) : undefined
        }
        valorAtual={valorOrcado}
        dataPrevistaAtual={dataPrevista}
        mostrarCustoOurives={ehJoia}
        ordemId={id}
        numeroOS={numeroOS}
        lojaNome={lojaNome}
        clienteNome={clienteNome}
        clienteTelefone={clienteTelefone}
        tipoItem={tipoItem}
        relogios={relogios}
        pecasJoia={pecasJoia}
        onConfirm={async (dados) => {
          const resultado = await encerrarOrdem(id, dados);
          if (resultado.ok) {
            router.push("/");
          }
          return resultado;
        }}
      />
    </div>
  );
}
