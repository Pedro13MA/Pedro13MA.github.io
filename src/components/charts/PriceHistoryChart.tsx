"use client";

import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/lib/types";
import { formatEUR } from "@/lib/utils";

type ChartRow = PricePoint;

type Props = {
  history: ChartRow[];
};

const PRICE_STROKE = "#0284c7";

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; dataKey?: string; payload?: ChartRow }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const price = row?.price ?? Number(payload.find((p) => p.dataKey === "price")?.value);
  if (!(price > 0)) return null;

  const dateLabel = label
    ? new Date(String(label)).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="max-w-[14rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-slate-500">{dateLabel}</p>
      <p className="mt-1.5 font-display text-sm font-bold tabular-nums text-slate-900">
        {formatEUR(price)}
      </p>
    </div>
  );
}

export function PriceHistoryChart({ history }: Props) {
  const points = history.filter((p) => p.price > 0);
  const safe = points.length ? points : history;
  const minVal = Math.min(...safe.map((p) => p.price));
  const maxVal = Math.max(...safe.map((p) => p.price));

  const yMin = Math.floor(minVal * 0.95);
  const yMax = Math.ceil(maxVal * 1.02);

  const showBrush = history.length >= 14;

  return (
    <div className="h-96 w-full sm:h-[28rem]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={history}
          margin={{ top: 12, right: 12, left: 0, bottom: showBrush ? 8 : 0 }}
        >
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRICE_STROKE} stopOpacity={0.2} />
              <stop offset="100%" stopColor={PRICE_STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e2e8f0" vertical={false} />

          <XAxis
            dataKey="date"
            tickFormatter={(v: string) =>
              new Date(v).toLocaleDateString("pt-PT", {
                day: "2-digit",
                month: "short",
              })
            }
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={28}
          />

          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v: number) => `€${v}`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="price"
            stroke={PRICE_STROKE}
            strokeWidth={2.5}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{
              r: 5,
              fill: PRICE_STROKE,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            name="Preço"
          />

          {showBrush ? (
            <Brush
              dataKey="date"
              height={22}
              stroke="#94a3b8"
              travellerWidth={8}
              tickFormatter={(v: string) =>
                new Date(v).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                })
              }
            />
          ) : null}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

