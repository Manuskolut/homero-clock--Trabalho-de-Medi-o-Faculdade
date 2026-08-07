import { clsx } from "clsx";
import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "bg-white/70 border border-gold-light/40 rounded-xl shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-5 flex flex-col gap-1 !border-gold">
      <span className="text-xs font-medium uppercase tracking-wide text-gray">
        {label}
      </span>
      <span className="text-3xl font-serif font-semibold text-ink">{value}</span>
      {hint && <span className="text-xs text-gray-light">{hint}</span>}
    </Card>
  );
}
