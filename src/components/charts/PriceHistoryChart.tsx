"use client";

import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatEUR } from "@/lib/utils";
import {
  formatTickDayMonth,
  nicePriceDomain,
  type SeriesPoint,
} from "@/lib/price-history-chart";

export type ChartPoint = SeriesPoint;

type MarkerKind = "current" | "min" | "max";

type Props = {
  history: ChartPoint[];
  currentPrice?: number | null;
  /** Extremos temporais da Melhor Oferta no período (não spread). */
  historicalMin?: number | null;
  historicalMax?: number | null;
  minDate?: string | null;
  maxDate?: string | null;
};

const PRICE_STROKE = "#e2550f";
const CURRENT = "#e2550f";
const MIN = "#059669";
const MAX = "#be123c";
const BAND = "#fed7aa";

type Row = ChartPoint & {
  /** Base da banda = melhor oferta. */
  bandBase: number;
  /** Altura da banda = max(0, maxMarket − price). */
  bandHeight: number;
};

function formatDatePt(raw: string): string {
  const [y, m, d] = String(raw).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return raw;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function markerLabel(kind: MarkerKind): string {
  if (kind === "min") return "Mínimo da melhor oferta";
  if (kind === "max") return "Máximo da melhor oferta";
  return "Preço atual (melhor oferta)";
}

function markerColor(kind: MarkerKind): string {
  if (kind === "min") return MIN;
  if (kind === "max") return MAX;
  return CURRENT;
}

function near(a: number, b: number, eps = 0.05): boolean {
  return Math.abs(a - b) <= eps;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload?: Row }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row?.date || !(row.price > 0)) return null;

  const market =
    row.maxMarketPrice != null && row.maxMarketPrice > row.price + 0.02
      ? row.maxMarketPrice
      : null;

  return (
    <div className="max-w-[16rem] rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-xs shadow-lg backdrop-blur-sm">
      <p className="font-semibold text-slate-800">Melhor oferta do dia</p>
      <p className="mt-1 font-display text-base font-bold tabular-nums text-slate-900">
        {formatEUR(row.price)}
      </p>
      {market != null ? (
        <p className="mt-1 text-slate-500">
          Outras lojas até {formatEUR(market)} (não entra no histórico)
        </p>
      ) : null}
      {row.isImputed ? (
        <p className="mt-1 text-amber-700">
          Sem nova observação neste dia — preço mantido (carry-forward).
        </p>
      ) : null}
      <p className="mt-0.5 text-slate-500">{formatDatePt(row.date)}</p>
    </div>
  );
}

function MarkerDot({
  cx,
  cy,
  kind,
}: {
  cx?: number;
  cy?: number;
  kind: MarkerKind;
}) {
  if (cx == null || cy == null) return null;
  const color = markerColor(kind);
  const r = kind === "current" ? 7 : 6;
  return (
    <g>
      <title>{markerLabel(kind)}</title>
      <circle cx={cx} cy={cy} r={r + 4} fill={color} fillOpacity={0.18} />
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

function buildRows(history: ChartPoint[]): Row[] {
  return history
    .filter((p) => p.price > 0)
    .map((p) => {
      const market =
        p.maxMarketPrice != null && p.maxMarketPrice > 0
          ? p.maxMarketPrice
          : p.price;
      const top = Math.max(market, p.price);
      return {
        ...p,
        bandBase: p.price,
        bandHeight: Math.max(0, top - p.price),
      };
    });
}

export function PriceHistoryChart({
  history,
  currentPrice,
  historicalMin,
  historicalMax,
  minDate,
  maxDate,
}: Props) {
  const rows = buildRows(history);
  if (!rows.length) {
    return (
      <p className="py-12 text-center text-sm text-slate-500">
        Histórico insuficiente para o gráfico.
      </p>
    );
  }

  const last = rows[rows.length - 1];
  const cur =
    currentPrice != null && currentPrice > 0 ? currentPrice : last.price;

  const targetMin =
    historicalMin != null && historicalMin > 0
      ? historicalMin
      : Math.min(...rows.map((r) => r.price));
  const targetMax =
    historicalMax != null && historicalMax > 0
      ? historicalMax
      : Math.max(...rows.map((r) => r.price));

  const minPoint =
    (minDate && rows.find((r) => r.date === minDate)) ||
    rows.find((r) => near(r.price, targetMin)) ||
    rows.reduce((a, b) => (a.price <= b.price ? a : b));

  const maxPoint =
    (maxDate && rows.find((r) => r.date === maxDate)) ||
    rows.find((r) => near(r.price, targetMax)) ||
    rows.reduce((a, b) => (a.price >= b.price ? a : b));

  const hasRealMaxVariation = targetMax > targetMin + 0.05;
  const showMaxMarker =
    hasRealMaxVariation &&
    maxPoint != null &&
    (!near(maxPoint.price, minPoint.price) || maxPoint.date !== minPoint.date);

  const priceVals = rows.map((r) => r.price);
  priceVals.push(cur, targetMin);
  if (showMaxMarker) priceVals.push(targetMax);

  const bandTops = rows
    .filter((r) => r.bandHeight > 0.02)
    .map((r) => r.price + r.bandHeight);
  const includeBand = bandTops.length > 0;
  const domainVals = includeBand ? [...priceVals, ...bandTops] : priceVals;
  const { min: yMin, max: yMax, ticks } = nicePriceDomain(domainVals);

  return (
    <div className="h-[22rem] w-full touch-pan-y sm:h-[28rem]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={rows}
          margin={{ top: 20, right: 16, left: 4, bottom: 4 }}
        >
          <defs>
            <linearGradient id="priceFillStep" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRICE_STROKE} stopOpacity={0.2} />
              <stop offset="100%" stopColor={PRICE_STROKE} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 6" />

          <XAxis
            dataKey="date"
            tickFormatter={formatTickDayMonth}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={24}
            padding={{ left: 8, right: 8 }}
          />

          <YAxis
            domain={[yMin, yMax]}
            ticks={ticks}
            tickFormatter={(v: number) =>
              `€${Number(v).toLocaleString("pt-PT", { maximumFractionDigits: 0 })}`
            }
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={58}
            allowDataOverflow
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
            allowEscapeViewBox={{ x: true, y: true }}
          />

          {includeBand ? (
            <>
              <Area
                type="stepAfter"
                dataKey="bandBase"
                stackId="spread"
                stroke="none"
                fill="transparent"
                isAnimationActive={false}
                legendType="none"
                tooltipType="none"
              />
              <Area
                type="stepAfter"
                dataKey="bandHeight"
                stackId="spread"
                stroke="none"
                fill={BAND}
                fillOpacity={0.3}
                isAnimationActive={false}
                name="Outras lojas (spread)"
              />
            </>
          ) : null}

          <Area
            type="stepAfter"
            dataKey="price"
            stroke="none"
            fill="url(#priceFillStep)"
            isAnimationActive={false}
            legendType="none"
            tooltipType="none"
          />

          <Line
            type="stepAfter"
            dataKey="price"
            stroke={PRICE_STROKE}
            strokeWidth={2.75}
            dot={false}
            activeDot={{
              r: 4,
              fill: PRICE_STROKE,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            name="Melhor oferta"
            isAnimationActive={false}
            connectNulls
          />

          {minPoint ? (
            <ReferenceDot
              x={minPoint.date}
              y={targetMin}
              shape={(props: { cx?: number; cy?: number }) => (
                <MarkerDot cx={props.cx} cy={props.cy} kind="min" />
              )}
            />
          ) : null}

          {showMaxMarker && maxPoint ? (
            <ReferenceDot
              x={maxPoint.date}
              y={targetMax}
              shape={(props: { cx?: number; cy?: number }) => (
                <MarkerDot cx={props.cx} cy={props.cy} kind="max" />
              )}
            />
          ) : null}

          <ReferenceDot
            x={last.date}
            y={cur}
            shape={(props: { cx?: number; cy?: number }) => (
              <MarkerDot cx={props.cx} cy={props.cy} kind="current" />
            )}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
