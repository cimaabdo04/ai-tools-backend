"use client";

import { cn } from "@lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  type TooltipProps,
} from "recharts";

type ChartType = "bar" | "line" | "area" | "pie";

interface ChartProps {
  type: ChartType;
  data: Record<string, unknown>[];
  xKey: string;
  yKey?: string;
  series?: { key: string; color: string; name?: string }[];
  height?: number;
  className?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
}

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#10b981",
];

export function Chart({
  type,
  data,
  xKey,
  yKey,
  series,
  height = 350,
  className,
  showGrid = true,
  showTooltip = true,
}: ChartProps) {
  const defaultSeries = series ?? [
    { key: yKey ?? "value", color: CHART_COLORS[0] },
  ];

  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            {showTooltip && <Tooltip />}
            {defaultSeries.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                radius={[4, 4, 0, 0]}
                name={s.name}
              />
            ))}
          </BarChart>
        );

      case "line":
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            {showTooltip && <Tooltip />}
            {defaultSeries.map((s, i) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                name={s.name}
              />
            ))}
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
            <XAxis
              dataKey={xKey}
              tick={{ fontSize: 12 }}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
            {showTooltip && <Tooltip />}
            {defaultSeries.map((s, i) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                fill={s.color ?? CHART_COLORS[i % CHART_COLORS.length]}
                fillOpacity={0.2}
                strokeWidth={2}
                name={s.name}
              />
            ))}
          </AreaChart>
        );

      case "pie":
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey ?? "value"}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            {showTooltip && <Tooltip />}
          </PieChart>
        );
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
}
