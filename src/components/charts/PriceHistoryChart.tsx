"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/lib/types";
import { formatEUR } from "@/lib/utils";

type Props = {
  history: PricePoint[];
  historicalMin: number;
  historicalMax: number;
};

const CHART_STROKE = "#0284c7";

export function PriceHistoryChart({ history, historicalMin, historicalMax }: Props) {
  const minPoint = history.reduce((best, p) => (p.price < best.price ? p : best), history[0]);
  const maxPoint = history.reduce((best, p) => (p.price > best.price ? p : best), history[0]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_STROKE} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CHART_STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
            }
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={[
              Math.floor(historicalMin * 0.95),
              Math.ceil(historicalMax * 1.02),
            ]}
            tickFormatter={(v: number) => `€${v}`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              color: "#0f172a",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
            }}
            labelStyle={{ color: "#64748b" }}
            labelFormatter={(label) =>
              new Date(String(label)).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })
            }
            formatter={(value) => [formatEUR(Number(value)), "Preço"]}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={CHART_STROKE}
            strokeWidth={2.5}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{ r: 4, fill: CHART_STROKE }}
          />
          {minPoint ? (
            <ReferenceDot
              x={minPoint.date}
              y={minPoint.price}
              r={5}
              fill="#059669"
              stroke="#ffffff"
              strokeWidth={2}
            />
          ) : null}
          {maxPoint ? (
            <ReferenceDot
              x={maxPoint.date}
              y={maxPoint.price}
              r={5}
              fill="#e11d48"
              stroke="#ffffff"
              strokeWidth={2}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
