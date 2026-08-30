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
        "bg-white/70 border border-gold-light/40 rounded-xl shadow-md shadow-ink/5 transition-shadow",
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
  icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card className="p-5 flex flex-col gap-1 !border-gold relative overflow-hidden">
      {icon && (
        <span className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-gold-light/25 text-gold">
          {icon}
        </span>
      )}
      <span className="text-xs font-medium uppercase tracking-wide text-gray pr-9 min-h-8 flex items-start">
        {label}
      </span>
      <span className="font-numeric font-normal text-3xl text-ink text-center block w-full">
        {value}
      </span>
      {hint && <span className="text-xs text-gray-light">{hint}</span>}
    </Card>
  );
}
