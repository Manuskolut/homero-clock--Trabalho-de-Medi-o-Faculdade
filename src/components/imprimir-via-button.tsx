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
//
// As duas vias vão numa ÚNICA imagem/chamada rawbt: (não duas separadas):
// o Chrome consome o "user activation" do clique na primeira navegação para
// um esquema externo — uma segunda chamada logo em seguida, mesmo com
// atraso via setTimeout, não tem gesto novo associado e é bloqueada
// silenciosamente (sem erro visível, só um aviso no console). Não é uma
// questão de tempo: nenhuma pausa resolve isso de forma confiável.
async function imprimirViaRawBT(node: HTMLDivElement) {
  const { default: html2canvas } = await import("html2canvas-pro");
  // scale 2 sobre os 76mm (~287px a 96dpi) dá ~574px de largura, já bem
  // próximo dos 576 pontos configurados no driver do RawBT — a impressora
  // recebe a imagem quase no tamanho final, sem precisar reamostrar quase
  // nada (e o payload base64 fica menor, com as duas vias juntas).
  const canvas = await html2canvas(node, {
    backgroundColor: "#ffffff",
    scale: 2,
  });
  const dataUrl = canvas.toDataURL("image/png");
  window.location.href = `rawbt:${dataUrl}`;
}

// `dados` é opcional: sem ele (ex: etiqueta de peça) o botão só faz
// window.print() de sempre. Com ele (vias de OS), Android usa o bypass do
// RawBT descrito acima.
export function ImprimirViaButton({ dados }: { dados?: DadosVia }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gerando, setGerando] = useState(false);

  function handleClick() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid || !dados || !containerRef.current) {
      window.print();
      return;
    }

    setGerando(true);
    imprimirViaRawBT(containerRef.current)
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
          <div ref={containerRef}>
            <ViaCliente {...dados} captura />
            <div className="w-[76mm] max-w-[76mm] mx-auto border-t-2 border-dashed border-ink/50 my-3" />
            <ViaLoja {...dados} captura />
          </div>
        </div>
      )}
    </>
  );
}
