import { formatarMoeda } from "@/lib/format";
import { BarcodeSvg } from "@/components/barcode-svg";
import type { CategoriaPeca } from "@prisma/client";

// Etiqueta física 60x15mm (bandeirinha), dobrada ao meio pelo usuário: cada
// metade de 30x15mm funciona como face independente. Frente = código de
// barras + número de fallback (caso o leitor não consiga ler); verso = valor
// e, só para relógios com referência preenchida, a referência logo abaixo.
// Sem nome/categoria/peso — a etiqueta não é um resumo da peça.
export function EtiquetaPeca({
  preco,
  codigoBarras,
  categoria,
  referencia,
}: {
  preco: number;
  codigoBarras: string;
  categoria: CategoriaPeca;
  referencia?: string | null;
}) {
  const mostrarReferencia = categoria === "RELOGIO" && !!referencia;

  return (
    <div className="mx-auto flex w-[60mm] h-[15mm] bg-white text-ink overflow-hidden print:shadow-none">
      <div className="flex w-[30mm] h-[15mm] items-center justify-center overflow-hidden">
        <BarcodeSvg
          value={codigoBarras}
          height={34}
          fontSize={6.9}
          margin={4}
          barWidth={1.4}
          letterSpacing="1.5px"
          className="h-[11mm] w-auto max-w-full"
        />
      </div>
      <div className="flex flex-col w-[30mm] h-[15mm] items-center justify-center gap-0.5 border-l border-dashed border-ink/30">
        <span className="font-mono font-bold text-[13px]">{formatarMoeda(preco)}</span>
        {mostrarReferencia && (
          <span className="font-mono text-[10px]">REF: {referencia}</span>
        )}
      </div>
    </div>
  );
}
