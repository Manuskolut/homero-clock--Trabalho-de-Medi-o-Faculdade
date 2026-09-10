// Miniatura da foto da peça usada nas colunas/linhas das tabelas de
// listagem desktop — mesmo padrão de proporção (object-cover, sem
// distorcer) do PecaCard mobile, só menor. Sem foto, mostra um placeholder
// discreto (mesmo tom do fallback do PecaCard) em vez de ícone genérico.
export function PecaThumb({ fotoUrl, nome }: { fotoUrl?: string | null; nome: string }) {
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={nome}
        className="h-9 w-9 rounded-md object-cover border border-gold-light/30 bg-cream shrink-0"
      />
    );
  }
  return <div className="h-9 w-9 rounded-md bg-gold-light/15 border border-gold-light/20 shrink-0" />;
}
