import {
  labelTipoRelogio,
  labelPulseira,
  labelEstadoPeca,
  ESTADO_PECA_COLOR_HEX,
  type RelogioDetalhe,
} from "@/lib/format";
import { CaixaIcon, PulseiraIcon, VidroIcon, MostradorIcon } from "@/components/icons/peca-icons";

const PECAS_ESTADO = [
  { campo: "estadoCaixa" as const, label: "Caixa", Icone: CaixaIcon },
  { campo: "estadoPulseira" as const, label: "Pulseira", Icone: PulseiraIcon },
  { campo: "estadoVidro" as const, label: "Vidro", Icone: VidroIcon },
  { campo: "estadoMostrador" as const, label: "Mostrador", Icone: MostradorIcon },
];

function EstadoBadge({ estado }: { estado?: string | null }) {
  if (!estado) {
    return <span className="text-xs text-gray-light">Não avaliado</span>;
  }
  const cor = ESTADO_PECA_COLOR_HEX[estado];
  return (
    <span
      className="text-xs font-medium text-white rounded-full px-3 py-1"
      style={{ backgroundColor: cor }}
    >
      {labelEstadoPeca(estado)}
    </span>
  );
}

export function RelogioDetalheCard({
  relogio,
  indice,
}: {
  relogio: RelogioDetalhe;
  indice: number;
}) {
  const tipo = labelTipoRelogio(relogio.tipo);
  const pulseira = labelPulseira(relogio.pulseira);

  return (
    <div className="rounded-xl border border-gold-light/40 bg-gold-light/10 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-gold uppercase tracking-wide">
          Relógio {indice}
        </span>
        <div className="flex gap-2 text-xs text-gray">
          {tipo && (
            <span className="bg-white border border-gray-light/40 rounded-full px-2.5 py-1">
              {tipo}
            </span>
          )}
          {pulseira && (
            <span className="bg-white border border-gray-light/40 rounded-full px-2.5 py-1">
              Pulseira: {pulseira}
            </span>
          )}
        </div>
      </div>

      <div className="text-sm font-medium text-ink">{relogio.modelo}</div>
      {relogio.descricao && (
        <div className="text-sm text-ink whitespace-pre-wrap">{relogio.descricao}</div>
      )}

      <div className="flex flex-col gap-2 pt-2 border-t border-gold-light/30">
        <span className="text-xs text-gray-light">Estado das peças na entrada</span>
        {PECAS_ESTADO.map(({ campo, label, Icone }) => (
          <div key={campo} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm text-ink">
              <Icone className="h-4 w-4 text-gold shrink-0" />
              {label}
            </span>
            <EstadoBadge estado={relogio[campo]} />
          </div>
        ))}
      </div>
    </div>
  );
}
