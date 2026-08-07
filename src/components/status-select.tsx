"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { alterarStatusOrdem } from "@/lib/actions/ordens";
import { STATUS_ORDEM_OPTIONS, STATUS_SOMENTE_VIA_BAIXA } from "@/lib/validation";
import { corStatusInline } from "@/lib/format";
import type { StatusOrdem } from "@prisma/client";

export function StatusSelect({
  id,
  status,
  somenteLeitura,
}: {
  id: string;
  status: string;
  somenteLeitura: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { bg, text } = corStatusInline(status);

  return (
    <select
      value={status}
      disabled={isPending || somenteLeitura}
      onChange={(e) => {
        const novoStatus = e.target.value as StatusOrdem;
        startTransition(async () => {
          await alterarStatusOrdem(id, novoStatus);
          router.refresh();
        });
      }}
      style={{ backgroundColor: bg, color: text, borderColor: bg }}
      className="rounded-lg border px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gold disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {STATUS_ORDEM_OPTIONS.filter(
        (opt) => !(STATUS_SOMENTE_VIA_BAIXA as readonly string[]).includes(opt.value)
      ).map((opt) => (
        <option key={opt.value} value={opt.value} style={{ color: "#1c1b18", backgroundColor: "#fff" }}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
