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
}: {
  value: string;
  className?: string;
  height?: number;
  fontSize?: number;
  margin?: number;
  barWidth?: number;
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
  }, [value, height, fontSize, margin, barWidth]);

  return <svg ref={ref} className={className} />;
}
