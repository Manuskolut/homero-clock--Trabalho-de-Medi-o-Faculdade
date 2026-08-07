"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { OFICINA_COLOR_HEX } from "@/lib/format";
import type { OficinaDatum } from "@/components/oficina-chart";

export function OficinaBarChart({
  dados,
  height = 260,
}: {
  dados: OficinaDatum[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={dados} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5ddc4" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "#838486" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: "#838486" }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "#d2c48e", fontSize: 13 }}
          cursor={{ fill: "rgba(212,175,55,0.08)" }}
        />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={56}>
          {dados.map((entry) => (
            <Cell key={entry.value} fill={OFICINA_COLOR_HEX[entry.value]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
