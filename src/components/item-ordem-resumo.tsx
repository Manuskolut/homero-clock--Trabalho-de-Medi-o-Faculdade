import { labelTipoItem, parseRelogiosDetalhes, parsePecasJoia } from "@/lib/format";
import type { Prisma } from "@prisma/client";

export function ItemOrdemResumo({
  ordem,
}: {
  ordem: {
    tipoItem: string;
    relogiosDetalhes: Prisma.JsonValue;
    pecasJoia: Prisma.JsonValue;
  };
}) {
  const itens: string[] =
    ordem.tipoItem === "RELOGIO"
      ? parseRelogiosDetalhes(ordem.relogiosDetalhes).map((r) => r.modelo)
      : parsePecasJoia(ordem.pecasJoia).map((p) => p.descricao);

  return (
    <>
      <span className="text-ink text-xs font-medium uppercase tracking-wide">
        {labelTipoItem(ordem.tipoItem)}
      </span>
      <ol className="mt-1 flex flex-col gap-0.5">
        {itens.map((item, i) => (
          <li key={i} className="text-xs text-gray">
            {i + 1}. {item}
          </li>
        ))}
      </ol>
    </>
  );
}
