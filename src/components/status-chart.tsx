"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { STATUS_ORDEM_OPTIONS } from "@/lib/validation";
import { STATUS_COLOR_HEX } from "@/lib/format";

type ChartDatum = { status: string; key: string; total: number };

// "Atrasadas" não é um status real (não existe no enum do banco) — é uma
// categoria derivada (ver estaAtrasada) exibida só neste gráfico, por isso
// não entra em STATUS_ORDEM_OPTIONS.
const CATEGORIAS_GRAFICO = [{ value: "ATRASADAS", label: "Atrasadas" }, ...STATUS_ORDEM_OPTIONS];

function Grafico({
  chartData,
  cx,
  outerRadius,
  legendLayout,
  legendAlign,
  legendVerticalAlign,
  legendFontSize = 11,
}: {
  chartData: ChartDatum[];
  cx: string;
  outerRadius: number;
  legendLayout: "horizontal" | "vertical";
  legendAlign: "center" | "right";
  legendVerticalAlign: "bottom" | "middle";
  legendFontSize?: number;
}) {
  return (
    <PieChart margin={{ top: 8, right: 12, left: 12, bottom: 0 }}>
      <Pie
        data={chartData}
        dataKey="total"
        nameKey="status"
        cx={cx}
        cy="45%"
        outerRadius={outerRadius}
        label={({ value }) => value}
        labelLine={false}
      >
        {chartData.map((entry) => (
          <Cell key={entry.key} fill={STATUS_COLOR_HEX[entry.key]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          borderRadius: 8,
          borderColor: "#d2c48e",
          fontSize: 13,
        }}
      />
      <Legend
        layout={legendLayout}
        align={legendAlign}
        verticalAlign={legendVerticalAlign}
        wrapperStyle={{ fontSize: legendFontSize, color: "#838486" }}
        iconSize={10}
      />
    </PieChart>
  );
}

export function StatusChart({
  dados,
}: {
  dados: { status: string; total: number }[];
}) {
  const chartData: ChartDatum[] = CATEGORIAS_GRAFICO.map((opt) => ({
    status: opt.label,
    key: opt.value,
    total: dados.find((d) => d.status === opt.value)?.total ?? 0,
  })).filter((d) => d.total > 0);

  return (
    <>
      {/* Mobile e desktop: legenda abaixo do gráfico (padrão). Escondido só na
          faixa de tablet (md até antes de lg), onde a versão abaixo assume. */}
      <div className="md:hidden lg:block">
        <ResponsiveContainer width="100%" height={260}>
          <Grafico
            chartData={chartData}
            cx="50%"
            outerRadius={80}
            legendLayout="horizontal"
            legendAlign="center"
            legendVerticalAlign="bottom"
          />
        </ResponsiveContainer>
      </div>

      {/* Tablet (md até antes de lg): pizza maior à esquerda, legenda em
          lista vertical à direita. */}
      <div className="hidden md:block lg:hidden">
        <ResponsiveContainer width="100%" height={260}>
          <Grafico
            chartData={chartData}
            cx="35%"
            outerRadius={95}
            legendLayout="vertical"
            legendAlign="right"
            legendVerticalAlign="middle"
            legendFontSize={14}
          />
        </ResponsiveContainer>
      </div>
    </>
  );
}
