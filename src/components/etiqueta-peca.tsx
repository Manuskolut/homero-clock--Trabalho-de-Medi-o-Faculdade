import { formatarMoeda } from "@/lib/format";
import { BarcodeSvg } from "@/components/barcode-svg";

export function EtiquetaPeca({
  nome,
  preco,
  codigoBarras,
}: {
  nome: string;
  preco: number;
  codigoBarras: string;
}) {
  return (
    <div className="mx-auto w-full max-w-[280px] bg-white border border-ink/20 rounded-md shadow-sm px-4 py-4 text-center font-mono text-ink print:shadow-none print:border-0 print:rounded-none break-after-page">
      <div className="text-xs tracking-widest uppercase text-ink/60">Homero Clock</div>
      <div className="text-sm font-bold uppercase mt-1 break-words">{nome}</div>
      <div className="text-xs text-ink/70 mt-0.5">{formatarMoeda(preco)}</div>
      <div className="mt-2 flex justify-center">
        <BarcodeSvg value={codigoBarras} className="w-full h-auto" />
      </div>
    </div>
  );
}
