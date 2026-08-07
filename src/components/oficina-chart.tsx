"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { OFICINA_COLOR_HEX } from "@/lib/format";

export type OficinaDatum = { value: string; label: string; total: number };

export function OficinaChart({
  dados,
  height = 260,
  outerRadius = 80,
}: {
  dados: OficinaDatum[];
  height?: number;
  outerRadius?: number;
}) {
  const chartData = dados.filter((d) => d.total > 0);

  if (chartData.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-gray-light"
        style={{ height }}
      >
        Nenhuma ordem de relógio com oficina registrada.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
        <Pie
          data={chartData}
          dataKey="total"
          nameKey="label"
          cx="50%"
          cy="45%"
          outerRadius={outerRadius}
          label={({ value }) => value}
          labelLine={false}
        >
          {chartData.map((entry) => (
            <Cell key={entry.value} fill={OFICINA_COLOR_HEX[entry.value]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            borderColor: "#d2c48e",
            fontSize: 13,
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: "#838486" }} iconSize={10} />
      </PieChart>
    </ResponsiveContainer>
  );
}
