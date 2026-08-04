"use client";

import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/lib/types";
import { formatEUR } from "@/lib/utils";

type ChartRow = PricePoint;

type MarkerKind = "current" | "min" | "max";

type MarkerPoint = {
  date: string;
  price: number;
  kind: MarkerKind;
};

type Props = {
  history: ChartRow[];
  currentPrice?: number | null;
};

const PRICE_STROKE = "#0284c7";
const CURRENT = "#0284c7";
const MIN = "#059669";
const MAX = "#e11d48";

function formatDatePt(raw: string): string {
  return new Date(String(raw)).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function markerLabel(kind: MarkerKind): string {
  if (kind === "min") return "Mínimo observado";
  if (kind === "max") return "Máximo observado";
  return "Preço atual";
}

function markerColor(kind: MarkerKind): string {
  if (kind === "min") return MIN;
  if (kind === "max") return MAX;
  return CURRENT;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value?: number;
    dataKey?: string;
    payload?: ChartRow & { kind?: MarkerKind };
  }>;
}) {
  if (!active || !payload?.length) return null;

  const marker = payload.find((p) => p.payload?.kind)?.payload;
  const row = marker || payload[0]?.payload;
  const price =
    row?.price ?? Number(payload.find((p) => p.dataKey === "price")?.value);
  if (!(price > 0) || !row?.date) return null;

  const kind = marker?.kind;
  const title = kind ? markerLabel(kind) : "Preço";
  const accent = kind ? markerColor(kind) : PRICE_STROKE;

  return (
    <div className="max-w-[15rem] rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-sm">
      <p className="flex items-center gap-1.5 font-semibold text-slate-800">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        {title}
      </p>
      <p className="mt-1.5 font-display text-base font-bold tabular-nums text-slate-900">
        {formatEUR(price)}
      </p>
      <p className="mt-0.5 text-slate-500">{formatDatePt(row.date)}</p>
    </div>
  );
}

function MarkerShape(props: {
  cx?: number;
  cy?: number;
  payload?: MarkerPoint;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload?.kind) return null;
  const kind = payload.kind;
  const color = markerColor(kind);
  const r = kind === "current" ? 7 : 5.5;

  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 3} fill={color} fillOpacity={0.18} />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        stroke="#ffffff"
        strokeWidth={2.5}
      />
    </g>
  );
}

function pickExtremes(history: ChartRow[]) {
  const valid = history.filter((p) => p.price > 0);
  if (!valid.length) return { min: null as ChartRow | null, max: null as ChartRow | null };
  let min = valid[0];
  let max = valid[0];
  for (const p of valid) {
    if (p.price < min.price) min = p;
    if (p.price > max.price) max = p;
  }
  return { min, max };
}

export function PriceHistoryChart({ history, currentPrice }: Props) {
  const points = history.filter((p) => p.price > 0);
  const safe = points.length ? points : history;
  const minVal = Math.min(...safe.map((p) => p.price));
  const maxVal = Math.max(...safe.map((p) => p.price));

  const yMin = Math.floor(minVal * 0.94);
  const yMax = Math.ceil(maxVal * 1.04);

  const showBrush = history.length >= 14;
  const { min, max } = pickExtremes(history);
  const last = history.length ? history[history.length - 1] : null;

  const markers: MarkerPoint[] = [];
  if (min) markers.push({ date: min.date, price: min.price, kind: "min" });
  if (max && (!min || max.date !== min.date || max.price !== min.price)) {
    markers.push({ date: max.date, price: max.price, kind: "max" });
  }
  if (last && currentPrice != null && currentPrice > 0) {
    markers.push({
      date: last.date,
      price: currentPrice,
      kind: "current",
    });
  }

  return (
    <div className="h-[26rem] w-full touch-pan-y sm:h-[30rem]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={history}
          margin={{ top: 18, right: 16, left: 4, bottom: showBrush ? 8 : 4 }}
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

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
            allowEscapeViewBox={{ x: true, y: true }}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke={PRICE_STROKE}
            strokeWidth={2.75}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{
              r: 4,
              fill: PRICE_STROKE,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            name="Preço"
            isAnimationActive={false}
          />

          {markers.length ? (
            <Scatter
              data={markers}
              dataKey="price"
              shape={<MarkerShape />}
              isAnimationActive={false}
              name="Marcadores"
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
