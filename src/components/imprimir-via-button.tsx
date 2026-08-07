"use client";

import { Button } from "@/components/ui/button";

export function ImprimirViaButton() {
  return (
    <Button type="button" onClick={() => window.print()}>
      Imprimir
    </Button>
  );
}
