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

export function PriceHistoryChart({ history, historicalMin, historicalMax }: Props) {
  const minPoint = history.reduce((best, p) => (p.price < best.price ? p : best), history[0]);
  const maxPoint = history.reduce((best, p) => (p.price > best.price ? p : best), history[0]);

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={history} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
            }
            tick={{ fill: "#71717a", fontSize: 11 }}
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
            tick={{ fill: "#71717a", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip
            contentStyle={{
              background: "#111113",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 10,
              color: "#fafafa",
            }}
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
            stroke="#2dd4bf"
            strokeWidth={2}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{ r: 4, fill: "#2dd4bf" }}
          />
          {minPoint ? (
            <ReferenceDot
              x={minPoint.date}
              y={minPoint.price}
              r={5}
              fill="#34d399"
              stroke="#052e1a"
              strokeWidth={2}
            />
          ) : null}
          {maxPoint ? (
            <ReferenceDot
              x={maxPoint.date}
              y={maxPoint.price}
              r={5}
              fill="#fb7185"
              stroke="#4c0519"
              strokeWidth={2}
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
