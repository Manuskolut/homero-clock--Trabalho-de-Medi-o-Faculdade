import { formatarMoeda } from "@/lib/format";
import { BarcodeSvg } from "@/components/barcode-svg";

// Etiqueta física 60x15mm (bandeirinha), dobrada ao meio pelo usuário: cada
// metade de 30x15mm funciona como face independente. Frente = código de
// barras + número de fallback (caso o leitor não consiga ler); verso = só o
// valor. Sem nome/categoria/peso/referência — a etiqueta é só um identificador
// físico, não um resumo da peça.
export function EtiquetaPeca({
  preco,
  codigoBarras,
}: {
  preco: number;
  codigoBarras: string;
}) {
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
      <div className="flex w-[30mm] h-[15mm] items-center justify-center border-l border-dashed border-ink/30">
        <span className="font-mono font-bold text-[13px]">{formatarMoeda(preco)}</span>
      </div>
    </div>
  );
}
