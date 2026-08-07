import { corStatus, labelStatus, corStatusPeca, labelStatusPeca } from "@/lib/format";
import { clsx } from "clsx";

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "lg";
}) {
  const c = corStatus(status);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full font-medium whitespace-nowrap",
        c.bg,
        c.text,
        size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs gap-1.5"
      )}
    >
      <span
        className={clsx("rounded-full", c.dot, size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5")}
      />
      {labelStatus(status)}
    </span>
  );
}

export function PecaStatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "lg";
}) {
  const c = corStatusPeca(status);
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full font-medium whitespace-nowrap",
        c.bg,
        c.text,
        size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs gap-1.5"
      )}
    >
      <span
        className={clsx("rounded-full", c.dot, size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5")}
      />
      {labelStatusPeca(status)}
    </span>
  );
}

export function AtrasadaBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full bg-[#E31717] text-white font-medium whitespace-nowrap",
        size === "lg" ? "px-4 py-2 text-sm" : "px-2.5 py-1 text-xs gap-1.5"
      )}
    >
      <span
        className={clsx("rounded-full bg-white", size === "lg" ? "h-2 w-2" : "h-1.5 w-1.5")}
      />
      Atrasada
    </span>
  );
}
