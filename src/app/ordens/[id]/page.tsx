import { obterOrdemComCliente } from "@/lib/actions/ordens";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { StatusBadge, AtrasadaBadge } from "@/components/ui/badge";
import { StatusSelect } from "@/components/status-select";
import { OrdemEncerramento } from "@/components/ordem-encerramento";
import { ExcluirOrdemButton } from "@/components/excluir-ordem-button";
import { RelogioDetalheCard } from "@/components/relogio-detalhe-card";
import { JoiaPecaCard } from "@/components/joia-peca-card";
import { BackButton } from "@/components/ui/back-button";
import { getOptionalSession } from "@/lib/dal";
import {
  formatarData,
  formatarDataHora,
  formatarMoeda,
  formatarNumeroOS,
  formatarCpf,
  labelTipoItem,
  labelOficina,
  estaAtrasada,
  corStatus,
  parseRelogiosDetalhes,
  parsePecasJoia,
  paraInputDate,
} from "@/lib/format";
import { notFound } from "next/navigation";
import Link from "next/link";
import { clsx } from "clsx";

export const dynamic = "force-dynamic";

export default async function OrdemDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ordem = await obterOrdemComCliente(id);
  if (!ordem) notFound();

  const session = await getOptionalSession();
  const isAdmin = session?.tipo === "ADMIN";
  const atrasada = estaAtrasada(ordem.dataPrevista, ordem.status);
  const somenteLeitura = ordem.dataRetirada != null;
  const relogios = parseRelogiosDetalhes(ordem.relogiosDetalhes);
  const pecasJoia = parsePecasJoia(ordem.pecasJoia);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <BackButton />
            <h1 className="text-3xl sm:text-4xl font-heading tracking-wide uppercase font-semibold text-gold">
              {ordem.loja.nome} nº {formatarNumeroOS(ordem.numeroOS)}
            </h1>
            {atrasada ? <AtrasadaBadge /> : <StatusBadge status={ordem.status} />}
          </div>
          <p className="text-sm text-gray mt-1">
            Cliente:{" "}
            <Link href={`/clientes/${ordem.clienteId}`} className="text-gold hover:underline">
              {ordem.cliente.nome}
            </Link>{" "}
            · {ordem.cliente.telefone}
            {ordem.cliente.email && <> · {ordem.cliente.email}</>}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {!somenteLeitura && (
            <LinkButton href={`/ordens/${ordem.id}/editar`} variant="secondary">
              Editar
            </LinkButton>
          )}
          <LinkButton href={`/ordens/${ordem.id}/vias`} variant="secondary">
            Ver vias
          </LinkButton>
          <OrdemEncerramento
            id={ordem.id}
            finalizada={somenteLeitura}
            statusAtual={ordem.status}
            tipoItem={ordem.tipoItem}
            valorOrcado={ordem.valorOrcado}
            dataPrevista={paraInputDate(ordem.dataPrevista)}
            numeroOS={ordem.numeroOS}
            lojaNome={ordem.loja.nome}
            clienteNome={ordem.cliente.nome}
            clienteTelefone={ordem.cliente.telefone}
            relogios={relogios}
            pecasJoia={pecasJoia}
          />
          {isAdmin && (
            <ExcluirOrdemButton id={ordem.id} numeroOS={ordem.numeroOS} lojaNome={ordem.loja.nome} />
          )}
        </div>
      </div>

      {somenteLeitura && (
        <div className="rounded-lg border border-gray-light/50 bg-gray-light/10 px-4 py-3 text-sm text-gray flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-gray shrink-0" />
          {ordem.status === "SEM_CONSERTO"
            ? "Esta ordem foi marcada como sem conserto e está em modo somente leitura."
            : "Esta ordem foi entregue e está em modo somente leitura."}{" "}
          Para alterar dados, reabra a ordem primeiro.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="p-5 lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
            Detalhes do item
          </h2>
          <dl className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Tipo</dt>
              <dd className="text-ink mt-0.5">{labelTipoItem(ordem.tipoItem)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Valor orçado</dt>
              <dd className="text-ink mt-0.5">{formatarMoeda(ordem.valorOrcado)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Data de entrada</dt>
              <dd className="text-ink mt-0.5">{formatarData(ordem.dataEntrada)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Previsão de entrega</dt>
              <dd className={atrasada ? "text-[#E31717] font-medium mt-0.5" : "text-ink mt-0.5"}>
                {formatarData(ordem.dataPrevista)}
              </dd>
            </div>
            {ordem.dataRetirada && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray">Data de retirada</dt>
                <dd className="text-ink mt-0.5">{formatarData(ordem.dataRetirada)}</dd>
              </div>
            )}
            {ordem.tipoItem === "RELOGIO" && ordem.oficina && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray">Oficina destinada</dt>
                <dd className="text-ink mt-0.5">{labelOficina(ordem.oficina)}</dd>
              </div>
            )}
            {ordem.tipoItem === "JOIA" && ordem.custoOurives != null && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-gray">Custo do ourives</dt>
                <dd className="text-ink mt-0.5">{formatarMoeda(ordem.custoOurives)}</dd>
              </div>
            )}
          </dl>

          {ordem.tipoItem === "RELOGIO" && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray mb-1.5">
                Relógios ({relogios.length})
              </dt>
              <dd className="flex flex-col gap-3">
                {relogios.map((relogio, i) => (
                  <RelogioDetalheCard key={i} relogio={relogio} indice={i + 1} />
                ))}
              </dd>
            </div>
          )}

          {ordem.tipoItem === "JOIA" && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray mb-1.5">
                Peças ({pecasJoia.length})
              </dt>
              <dd className="flex flex-col gap-3">
                {pecasJoia.map((peca, i) => (
                  <JoiaPecaCard key={i} peca={peca} indice={i + 1} />
                ))}
              </dd>
            </div>
          )}

          {ordem.observacoes && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Observações</dt>
              <dd className="text-ink mt-1 whitespace-pre-wrap">{ordem.observacoes}</dd>
            </div>
          )}
          {ordem.observacaoRetirada && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">
                Observação da retirada
              </dt>
              <dd className="text-ink mt-1 whitespace-pre-wrap">
                {ordem.observacaoRetirada}
              </dd>
            </div>
          )}
          {ordem.nomeRetirada && (
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray">Retirado por</dt>
              <dd className="text-ink mt-1">
                {ordem.nomeRetirada} · CPF {formatarCpf(ordem.cpfRetirada)}
                {ordem.emailRetirada && <> · {ordem.emailRetirada}</>}
              </dd>
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden p-5 flex flex-col gap-4">
          <span
            className={clsx(
              "absolute inset-x-0 top-0 h-1.5",
              atrasada ? "bg-[#E31717]" : corStatus(ordem.status).bg
            )}
          />
          <h2 className="text-sm font-heading tracking-wide font-semibold text-ink">
            Status da ordem
          </h2>
          {atrasada ? (
            <AtrasadaBadge size="lg" />
          ) : (
            <StatusBadge status={ordem.status} size="lg" />
          )}
          <StatusSelect id={ordem.id} status={ordem.status} somenteLeitura={somenteLeitura} />
          <div className="text-xs text-gray-light border-t border-gold-light/30 pt-3 mt-1">
            <div>Cadastrada em {formatarDataHora(ordem.createdAt)}</div>
            {somenteLeitura ? (
              <div>Baixa registrada em {formatarDataHora(ordem.updatedAt)}</div>
            ) : (
              <div>Última atualização em {formatarDataHora(ordem.updatedAt)}</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
