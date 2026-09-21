"use client";

import { useEffect } from "react";

// Sem isso, o scroll do mouse/touchpad sobre um input numérico focado altera
// o valor sozinho (comportamento padrão do navegador) — bloqueia esse evento
// em todo o sistema, sem impedir a digitação normal.
export function NumericWheelGuard() {
  useEffect(() => {
    function bloquearScrollEmInputNumerico(e: WheelEvent) {
      const alvo = e.target;
      if (
        alvo instanceof HTMLInputElement &&
        alvo.type === "number" &&
        document.activeElement === alvo
      ) {
        e.preventDefault();
      }
    }

    window.addEventListener("wheel", bloquearScrollEmInputNumerico, { passive: false });
    return () => window.removeEventListener("wheel", bloquearScrollEmInputNumerico);
  }, []);

  return null;
}
