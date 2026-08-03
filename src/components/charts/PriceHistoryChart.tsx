"use client";

import {
  Area,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PricePoint } from "@/lib/types";
import { formatEUR } from "@/lib/utils";

type ChartRow = PricePoint & { avg?: number | null };

type Props = {
  history: ChartRow[];
  historicalMin: number;
  historicalMax: number;
  referencePrice?: number | null;
  referenceSource?: string | null;
  pvpr?: number | null;
  /** Eventos informativos (FASE 7.10). */
  highlightNewMin?: boolean;
  hasPromotions?: boolean;
  hasCoupons?: boolean;
};

const PRICE_STROKE = "#0284c7";
const AVG_STROKE = "#64748b";
const PVPR_STROKE = "#94a3b8";

function CustomTooltip({
  active,
  payload,
  label,
  avgFallback,
  pvpr,
  historicalMin,
  historicalMax,
  hasCoupons,
  hasPromotions,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; dataKey?: string; payload?: ChartRow }>;
  label?: string;
  avgFallback?: number | null;
  pvpr?: number | null;
  historicalMin?: number;
  historicalMax?: number;
  hasCoupons?: boolean;
  hasPromotions?: boolean;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const price = row?.price ?? Number(payload.find((p) => p.dataKey === "price")?.value);
  if (!(price > 0)) return null;
  const avg = row?.avg ?? avgFallback ?? null;
  const dateLabel = label
    ? new Date(String(label)).toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const nearMin =
    historicalMin != null &&
    historicalMin > 0 &&
    Math.abs(price - historicalMin) / historicalMin < 0.01;
  const nearMax =
    historicalMax != null &&
    historicalMax > 0 &&
    Math.abs(price - historicalMax) / historicalMax < 0.01;

  return (
    <div className="max-w-[14rem] rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs shadow-lg">
      <p className="font-medium text-slate-500">{dateLabel}</p>
      <p className="mt-1.5 font-display text-sm font-bold tabular-nums text-slate-900">
        {formatEUR(price)}
      </p>
      {avg != null && avg > 0 ? (
        <p className="mt-1 text-slate-600">
          vs média:{" "}
          <span className="font-semibold tabular-nums">
            {price <= avg
              ? `−${formatEUR(avg - price)}`
              : `+${formatEUR(price - avg)}`}
          </span>
        </p>
      ) : null}
      {pvpr != null && pvpr > 0 ? (
        <p className="mt-0.5 text-slate-600">
          vs PVPR:{" "}
          <span className="font-semibold tabular-nums">
            {price <= pvpr
              ? `−${formatEUR(pvpr - price)}`
              : `+${formatEUR(price - pvpr)}`}
          </span>
        </p>
      ) : null}
      {nearMin ? (
        <p className="mt-1 font-medium text-emerald-700">Mínimo no período</p>
      ) : null}
      {nearMax ? (
        <p className="mt-1 font-medium text-rose-700">Máximo no período</p>
      ) : null}
      {hasCoupons ? (
        <p className="mt-1 text-sky-700">Cupões informativos activos</p>
      ) : null}
      {hasPromotions ? (
        <p className="mt-0.5 text-amber-800">Promoções de loja activas</p>
      ) : null}
    </div>
  );
}

export function PriceHistoryChart({
  history,
  historicalMin,
  historicalMax,
  referencePrice,
  pvpr,
  highlightNewMin,
  hasPromotions,
  hasCoupons,
}: Props) {
  const minPoint = history.reduce((best, p) => (p.price < best.price ? p : best), history[0]);
  const maxPoint = history.reduce((best, p) => (p.price > best.price ? p : best), history[0]);

  const hasAvgSeries = history.some((p) => p.avg != null && p.avg > 0);
  const avgFallback =
    referencePrice != null && referencePrice > 0
      ? referencePrice
      : history.length
        ? history.reduce((s, p) => s + p.price, 0) / history.length
        : null;

  const data = history.map((p) => ({
    ...p,
    avg: p.avg != null && p.avg > 0 ? p.avg : hasAvgSeries ? null : avgFallback,
  }));

  const showPvpr = pvpr != null && pvpr > 0;
  const yMin = Math.floor(
    Math.min(historicalMin, avgFallback ?? historicalMin, showPvpr ? pvpr! : historicalMin) *
      0.95,
  );
  const yMax = Math.ceil(
    Math.max(historicalMax, avgFallback ?? historicalMax, showPvpr ? pvpr! : historicalMax) *
      1.02,
  );

  const showBrush = history.length >= 14;

  return (
    <div className="h-72 w-full sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: showBrush ? 8 : 0 }}>
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
              new Date(v).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })
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
          <Tooltip
            content={
              <CustomTooltip
                avgFallback={avgFallback}
                pvpr={showPvpr ? pvpr : null}
                historicalMin={historicalMin}
                historicalMax={historicalMax}
                hasCoupons={hasCoupons}
                hasPromotions={hasPromotions}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={PRICE_STROKE}
            strokeWidth={2.5}
            fill="url(#priceFill)"
            dot={false}
            activeDot={{ r: 5, fill: PRICE_STROKE, stroke: "#fff", strokeWidth: 2 }}
            name="Preço"
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke={AVG_STROKE}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            connectNulls
            name="Média"
          />
          {showPvpr ? (
            <ReferenceLine
              y={pvpr!}
              stroke={PVPR_STROKE}
              strokeDasharray="2 4"
              strokeWidth={1.25}
              label={{
                value: "PVPR",
                position: "insideTopLeft",
                fill: "#94a3b8",
                fontSize: 10,
              }}
            />
          ) : null}
          <ReferenceLine
            y={historicalMin}
            stroke="#059669"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: "Mín.",
              position: "insideBottomLeft",
              fill: "#059669",
              fontSize: 10,
            }}
          />
          <ReferenceLine
            y={historicalMax}
            stroke="#e11d48"
            strokeDasharray="4 4"
            strokeWidth={1}
            label={{
              value: "Máx.",
              position: "insideTopRight",
              fill: "#e11d48",
              fontSize: 10,
            }}
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
      <div className="mt-2 flex flex-wrap gap-3 text-[10px] font-medium uppercase tracking-wide text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-sky-600" /> Preço
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t border-dashed border-slate-500" /> Média
        </span>
        {showPvpr ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t border-dotted border-slate-400" /> PVPR
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1.5 text-emerald-700">● Mín. histórico</span>
        <span className="inline-flex items-center gap-1.5 text-rose-600">● Máx. histórico</span>
        {highlightNewMin ? (
          <span className="inline-flex items-center gap-1.5 text-emerald-800">
            Novo mínimo
          </span>
        ) : null}
        {showBrush ? (
          <span className="text-slate-400 normal-case">Arraste a barra para zoom</span>
        ) : null}
      </div>
    </div>
  );
}
