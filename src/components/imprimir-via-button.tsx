"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ViaCliente, ViaLoja, type DadosVia } from "@/components/via-impressao";

// No Android, window.print() passa pelo Android Print Framework, que gera a
// página em A4 ignorando o @page 80mm da nossa CSS — o RawBT então reamostra
// essa página inteira pro rolo térmico, o que leva minutos. Pra evitar isso,
// no Android capturamos as vias já no tamanho final (76mm) via html2canvas e
// mandamos a imagem pronta direto pro RawBT pelo esquema de URL "rawbt:",
// pulando o Print Framework por completo. No desktop e em outros navegadores
// o fluxo continua sendo o window.print() de sempre.
async function imprimirViaRawBT(nodes: HTMLDivElement[]) {
  const { default: html2canvas } = await import("html2canvas-pro");
  for (const node of nodes) {
    const canvas = await html2canvas(node, {
      backgroundColor: "#ffffff",
      scale: 3,
    });
    const dataUrl = canvas.toDataURL("image/png");
    window.location.href = `rawbt:${dataUrl}`;
    // pausa entre os dois jobs (via cliente / via loja) para o RawBT
    // processar cada intent antes do próximo chegar
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
}

// `dados` é opcional: sem ele (ex: etiqueta de peça) o botão só faz
// window.print() de sempre. Com ele (vias de OS), Android usa o bypass do
// RawBT descrito acima.
export function ImprimirViaButton({ dados }: { dados?: DadosVia }) {
  const refCliente = useRef<HTMLDivElement>(null);
  const refLoja = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);

  function handleClick() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const nodes = [refCliente.current, refLoja.current].filter(
      (n): n is HTMLDivElement => n !== null,
    );
    if (!isAndroid || !dados || nodes.length === 0) {
      window.print();
      return;
    }

    setGerando(true);
    imprimirViaRawBT(nodes)
      .catch(() => {
        window.print();
      })
      .finally(() => setGerando(false));
  }

  return (
    <>
      <Button type="button" onClick={handleClick} disabled={gerando}>
        {gerando ? "Gerando..." : "Imprimir"}
      </Button>
      {dados && (
        // Renderizado fora da tela (não display:none) para o html2canvas
        // conseguir capturar o layout já no visual final de impressão.
        <div style={{ position: "fixed", left: "-10000px", top: 0 }} aria-hidden="true">
          <div ref={refCliente}>
            <ViaCliente {...dados} captura />
          </div>
          <div ref={refLoja}>
            <ViaLoja {...dados} captura />
          </div>
        </div>
      )}
    </>
  );
}
