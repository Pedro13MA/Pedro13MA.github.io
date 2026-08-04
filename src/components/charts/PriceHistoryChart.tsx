"use client";

import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
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
  currentPrice?: number | null;
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
  const price =
    row?.price ?? Number(payload.find((p) => p.dataKey === "price")?.value);
  if (!(price > 0)) return null;

  const dateLabel = label
    ? new Date(String(label)).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-medium text-slate-500">{dateLabel}</p>
      <p className="mt-1 font-display text-base font-bold tabular-nums text-slate-900">
        {formatEUR(price)}
      </p>
    </div>
  );
}

export function PriceHistoryChart({ history, currentPrice }: Props) {
  const points = history.filter((p) => p.price > 0);
  const safe = points.length ? points : history;
  const minVal = Math.min(...safe.map((p) => p.price));
  const maxVal = Math.max(...safe.map((p) => p.price));

  const yMin = Math.floor(minVal * 0.94);
  const yMax = Math.ceil(maxVal * 1.04);

  const showBrush = history.length >= 14;
  const showCurrent =
    currentPrice != null &&
    currentPrice > 0 &&
    currentPrice >= yMin &&
    currentPrice <= yMax;

  return (
    <div className="h-[26rem] w-full sm:h-[30rem]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={history}
          margin={{ top: 16, right: 16, left: 4, bottom: showBrush ? 8 : 4 }}
        >
          <defs>
            <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRICE_STROKE} stopOpacity={0.18} />
              <stop offset="100%" stopColor={PRICE_STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 6" />

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
            minTickGap={32}
          />

          <YAxis
            domain={[yMin, yMax]}
            tickFormatter={(v: number) => `€${v}`}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={54}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="price"
            stroke={PRICE_STROKE}
            strokeWidth={2.75}
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

          {showCurrent ? (
            <ReferenceLine
              y={currentPrice!}
              stroke="#0f172a"
              strokeOpacity={0.35}
              strokeDasharray="4 6"
              strokeWidth={1}
            />
          ) : null}

          {showBrush ? (
            <Brush
              dataKey="date"
              height={20}
              stroke="#cbd5e1"
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
