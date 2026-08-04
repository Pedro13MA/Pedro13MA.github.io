"use client";

import { useEffect, useState } from "react";
import {
  fetchPriceHistory,
  type HistoryGranularity,
  type PriceHistoryOut,
} from "@/lib/api";
import type { PricePoint } from "@/lib/types";
import { PriceHistoryChart as Chart } from "@/components/charts/PriceHistoryChart";
import { cn, formatEUR } from "@/lib/utils";

const PERIODS = [
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
  { days: 365, label: "1 ano" },
  { days: 1825, label: "Tudo" },
] as const;

type PeriodDays = (typeof PERIODS)[number]["days"];

type Props = {
  productId: string;
  currentPrice: number;
  fallbackHistory?: PricePoint[];
  fallbackMin?: number;
  fallbackMax?: number;
};

function ChartSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-96 w-full animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function autoGranularity(days: number): HistoryGranularity {
  return days >= 180 ? "weekly" : "daily";
}

function SummaryCard({
  tone,
  label,
  value,
}: {
  tone: "current" | "min" | "max";
  label: string;
  value: number;
}) {
  const dot =
    tone === "current"
      ? "bg-sky-600"
      : tone === "min"
        ? "bg-emerald-600"
        : "bg-rose-600";

  return (
    <li className="rounded-2xl border border-slate-200/70 bg-white px-3.5 py-3">
      <p className="flex items-center gap-2 text-xs font-medium text-slate-600">
        <span className={cn("h-2.5 w-2.5 rounded-full", dot)} aria-hidden />
        {label}
      </p>
      <p className="mt-1.5 font-display text-lg font-bold tabular-nums text-slate-900">
        {formatEUR(value)}
      </p>
    </li>
  );
}

export function PriceHistoryChart({
  productId,
  currentPrice,
  fallbackHistory = [],
  fallbackMin,
  fallbackMax,
}: Props) {
  const [days, setDays] = useState<PeriodDays>(30);
  const [data, setData] = useState<PriceHistoryOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const granularity = autoGranularity(days);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPriceHistory(productId, days, granularity)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Erro ao carregar histórico");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [productId, days, granularity]);

  const points: PricePoint[] =
    data?.points?.map((p) => ({ date: p.date, price: p.price })) ??
    (error && fallbackHistory.length > 1 ? fallbackHistory : []);

  const histMin =
    data?.historicalMin ??
    fallbackMin ??
    (points.length ? Math.min(...points.map((p) => p.price)) : 0);
  const histMax =
    data?.historicalMax ??
    fallbackMax ??
    (points.length ? Math.max(...points.map((p) => p.price)) : 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="font-display text-xl font-bold text-slate-900">
          Histórico de preço
        </h2>
        <div
          className="flex flex-wrap gap-1 rounded-xl bg-slate-100/80 p-1"
          role="group"
          aria-label="Período do gráfico"
        >
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-xs font-medium transition-colors",
                days === p.days
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <ChartSkeleton /> : null}

      {!loading && points.length > 1 ? (
        <>
          <Chart history={points} currentPrice={currentPrice} />
          <ul className="grid gap-3 sm:grid-cols-3">
            <SummaryCard tone="current" label="Preço atual" value={currentPrice} />
            <SummaryCard tone="min" label="Mínimo observado" value={histMin} />
            <SummaryCard tone="max" label="Máximo observado" value={histMax} />
          </ul>
        </>
      ) : null}

      {!loading && points.length <= 1 ? (
        <p className="py-12 text-center text-sm text-slate-500">
          {error
            ? "Não foi possível carregar o histórico para este período."
            : "Histórico insuficiente para o gráfico."}
        </p>
      ) : null}
    </div>
  );
}
