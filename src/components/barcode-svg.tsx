"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

export function BarcodeSvg({
  value,
  className,
  height = 50,
  fontSize = 14,
  margin = 4,
  barWidth = 2,
  letterSpacing,
}: {
  value: string;
  className?: string;
  height?: number;
  fontSize?: number;
  margin?: number;
  barWidth?: number;
  // JsBarcode não tem opção nativa de letter-spacing no texto abaixo das
  // barras — aplicada direto no <text> gerado depois do render.
  letterSpacing?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    JsBarcode(ref.current, value, {
      format: "CODE128",
      displayValue: true,
      fontSize,
      height,
      margin,
      width: barWidth,
    });
    if (letterSpacing) {
      const text = ref.current.querySelector("text");
      if (text) text.style.letterSpacing = letterSpacing;
    }
  }, [value, height, fontSize, margin, barWidth, letterSpacing]);

  return <svg ref={ref} className={className} />;
}
