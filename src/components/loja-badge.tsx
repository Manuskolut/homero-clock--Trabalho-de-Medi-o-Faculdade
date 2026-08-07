export function LojaBadge({ nome }: { nome: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gold-light/30 text-ink/70 whitespace-nowrap">
      {nome}
    </span>
  );
}
