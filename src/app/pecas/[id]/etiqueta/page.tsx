import { obterPeca } from "@/lib/actions/pecas";
import { LinkButton } from "@/components/ui/button";
import { BackButton } from "@/components/ui/back-button";
import { ImprimirViaButton } from "@/components/imprimir-via-button";
import { EtiquetaPeca } from "@/components/etiqueta-peca";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EtiquetaPecaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const peca = await obterPeca(id);
  if (!peca) notFound();

  return (
    <div className="flex flex-col gap-6">
      {/* Etiqueta física é 60x15mm — bem menor que o @page padrão (A4) usado
          pelas vias de OS. Escopado a esta página via <style> normal (não
          styled-jsx): o elemento some do DOM ao navegar, então não vaza
          para as outras rotas de impressão. */}
      <style>{`
        @page {
          size: 60mm 15mm;
          margin: 0;
        }
        @media print {
          body { margin: 0 !important; }
          header, footer { display: none !important; }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: none !important;
          }
        }
      `}</style>

      <div className="flex items-center justify-between gap-4 flex-wrap print:hidden">
        <div className="flex items-center gap-3">
          <BackButton />
          <h1 className="text-2xl sm:text-3xl font-heading tracking-wide uppercase font-semibold text-gold">
            Etiqueta — {peca.nome}
          </h1>
        </div>
        <div className="flex gap-3">
          <LinkButton href="/pecas" variant="secondary">
            Voltar para Peças
          </LinkButton>
          <ImprimirViaButton />
        </div>
      </div>

      <EtiquetaPeca preco={peca.preco} codigoBarras={peca.codigoBarras} />
    </div>
  );
}
