import {
  labelTipoConsertoJoia,
  labelCorFolheacao,
  labelDeixouOuro,
  type JoiaPeca,
} from "@/lib/format";

export function JoiaPecaCard({ peca, indice }: { peca: JoiaPeca; indice: number }) {
  return (
    <div className="rounded-xl border border-gold-light/40 bg-gold-light/10 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-gold uppercase tracking-wide">
          Peça {indice}
        </span>
        <div className="flex gap-2">
          {peca.peso && (
            <span className="bg-white border border-gray-light/40 rounded-full px-2.5 py-1 text-xs text-gray">
              {peca.peso}
            </span>
          )}
          {peca.tamanhoAro && (
            <span className="bg-white border border-gray-light/40 rounded-full px-2.5 py-1 text-xs text-gray">
              Aro {peca.tamanhoAro}
            </span>
          )}
        </div>
      </div>

      <div className="text-sm font-medium text-ink">{peca.descricao}</div>

      <div className="flex flex-wrap gap-2">
        {peca.tiposConserto.map((tipo) => (
          <span
            key={tipo}
            className="text-xs font-medium text-ink bg-white border border-gray-light/40 rounded-full px-3 py-1"
          >
            {labelTipoConsertoJoia(tipo)}
          </span>
        ))}
      </div>
      {peca.outroConserto && (
        <div className="text-sm text-ink">{peca.outroConserto}</div>
      )}
      {peca.deixouOuro && (
        <div className="text-sm text-ink">
          Deixou o ouro? {labelDeixouOuro(peca.deixouOuro)}
          {peca.deixouOuro === "SIM" && peca.pesoOuro && <> · Peso do ouro: {peca.pesoOuro}</>}
        </div>
      )}
      {peca.corFolheacao && (
        <div className="text-sm text-ink">Cor da folheação: {labelCorFolheacao(peca.corFolheacao)}</div>
      )}
    </div>
  );
}
