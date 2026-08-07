"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/confirm-dialog";
import {
  resetarSenhaUsuario,
  alternarAtivoUsuario,
  atualizarEmailUsuario,
  excluirUsuario,
} from "@/lib/actions/usuarios";

export function ContaDetalhe({
  id,
  email,
  ativo,
  isPropriaConta,
}: {
  id: string;
  email: string;
  ativo: boolean;
  isPropriaConta: boolean;
}) {
  const router = useRouter();

  const [novoEmail, setNovoEmail] = useState(email);
  const [erroEmail, setErroEmail] = useState<string | null>(null);
  const [sucessoEmail, setSucessoEmail] = useState(false);
  const [isPendingEmail, startTransitionEmail] = useTransition();

  const [novaSenha, setNovaSenha] = useState("");
  const [erroSenha, setErroSenha] = useState<string | null>(null);
  const [sucessoSenha, setSucessoSenha] = useState(false);
  const [isPendingSenha, startTransitionSenha] = useTransition();

  const [erroAtivo, setErroAtivo] = useState<string | null>(null);
  const [isPendingAtivo, startTransitionAtivo] = useTransition();

  return (
    <div className="flex flex-col gap-8 max-w-lg">
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
          E-mail de login
        </h2>
        <TextField
          label="E-mail"
          name="novoEmail"
          type="email"
          value={novoEmail}
          onChange={(e) => {
            setNovoEmail(e.target.value);
            setSucessoEmail(false);
          }}
          error={erroEmail ?? undefined}
        />
        {sucessoEmail && (
          <p className="text-sm text-[#3D6647]">E-mail atualizado com sucesso.</p>
        )}
        <div>
          <Button
            type="button"
            disabled={isPendingEmail || !novoEmail.trim() || novoEmail.trim() === email}
            onClick={() => {
              setErroEmail(null);
              startTransitionEmail(async () => {
                const resultado = await atualizarEmailUsuario(id, novoEmail);
                if (!resultado.ok) {
                  setErroEmail(resultado.error ?? "Não foi possível atualizar o e-mail.");
                  return;
                }
                setSucessoEmail(true);
                router.refresh();
              });
            }}
          >
            {isPendingEmail ? "Salvando…" : "Salvar novo e-mail"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
          Redefinir senha
        </h2>
        <TextField
          label="Nova senha"
          name="novaSenha"
          type="password"
          value={novaSenha}
          onChange={(e) => {
            setNovaSenha(e.target.value);
            setSucessoSenha(false);
          }}
          error={erroSenha ?? undefined}
          placeholder="Mínimo 8 caracteres"
        />
        {sucessoSenha && (
          <p className="text-sm text-[#3D6647]">Senha atualizada com sucesso.</p>
        )}
        <div>
          <Button
            type="button"
            disabled={isPendingSenha || !novaSenha}
            onClick={() => {
              setErroSenha(null);
              startTransitionSenha(async () => {
                const resultado = await resetarSenhaUsuario(id, novaSenha);
                if (!resultado.ok) {
                  setErroSenha(resultado.error ?? "Não foi possível atualizar a senha.");
                  return;
                }
                setNovaSenha("");
                setSucessoSenha(true);
              });
            }}
          >
            {isPendingSenha ? "Salvando…" : "Salvar nova senha"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
          Status da conta
        </h2>
        <p className="text-sm text-gray">
          {ativo
            ? "Esta conta está ativa e pode fazer login normalmente."
            : "Esta conta está desativada — o login será recusado até ser reativada."}
        </p>
        {isPropriaConta && ativo ? (
          <p className="text-xs text-gray-light">
            Você não pode desativar a própria conta.
          </p>
        ) : (
          <div className="flex flex-col gap-2 items-start">
            {erroAtivo && <p className="text-sm text-red-600">{erroAtivo}</p>}
            <Button
              type="button"
              variant={ativo ? "danger" : "primary"}
              disabled={isPendingAtivo}
              onClick={() => {
                setErroAtivo(null);
                startTransitionAtivo(async () => {
                  const resultado = await alternarAtivoUsuario(id, !ativo);
                  if (!resultado.ok) {
                    setErroAtivo(resultado.error ?? "Não foi possível alterar o status.");
                    return;
                  }
                  router.refresh();
                });
              }}
            >
              {isPendingAtivo ? "Aplicando…" : ativo ? "Desativar conta" : "Reativar conta"}
            </Button>
          </div>
        )}
      </div>

      {!ativo && !isPropriaConta && (
        <div className="flex flex-col gap-3 border-t border-gold-light/30 pt-6">
          <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
            Excluir conta
          </h2>
          <p className="text-sm text-gray">
            Remove esta conta permanentemente do sistema. Só é possível excluir
            contas já desativadas, e a ação não pode ser desfeita.
          </p>
          <div>
            <ConfirmButton
              label="Excluir conta"
              variant="danger"
              title="Excluir conta definitivamente?"
              description="A conta será removida do sistema e o e-mail poderá ser reutilizado em uma nova conta. Esta ação não pode ser desfeita."
              onConfirm={async () => {
                await excluirUsuario(id);
                router.push("/admin/contas");
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
