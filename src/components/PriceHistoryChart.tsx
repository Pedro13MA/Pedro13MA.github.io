"use client";

import { useEffect, useState } from "react";
import {
  fetchPriceHistory,
  type HistoryGranularity,
  type PriceHistoryOut,
} from "@/lib/api";
import type { PricePoint } from "@/lib/types";
import { PriceHistoryChart as Chart } from "@/components/charts/PriceHistoryChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PERIODS = [
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
  { days: 365, label: "1 ano" },
] as const;

const GRANULARITIES: { value: HistoryGranularity; label: string }[] = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
];

type Props = {
  productId: string;
  /** Histórico embutido no detalhe — fallback se o endpoint falhar. */
  fallbackHistory?: PricePoint[];
  fallbackMin?: number;
  fallbackMax?: number;
};

function ChartSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-72 w-full animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

export function PriceHistoryChart({
  productId,
  fallbackHistory = [],
  fallbackMin,
  fallbackMax,
}: Props) {
  const [days, setDays] = useState<(typeof PERIODS)[number]["days"]>(30);
  const [granularity, setGranularity] = useState<HistoryGranularity>("daily");
  const [data, setData] = useState<PriceHistoryOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <Card>
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <CardTitle>Histórico de preço</CardTitle>
        <div className="flex flex-wrap gap-2">
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            role="group"
            aria-label="Período"
          >
            {PERIODS.map((p) => (
              <button
                key={p.days}
                type="button"
                onClick={() => setDays(p.days)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  days === p.days
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            role="group"
            aria-label="Granularidade"
          >
            {GRANULARITIES.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGranularity(g.value)}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                  granularity === g.value
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <ChartSkeleton /> : null}

        {!loading && points.length > 1 ? (
          <Chart history={points} historicalMin={histMin} historicalMax={histMax} />
        ) : null}

        {!loading && points.length <= 1 ? (
          <p className="py-12 text-center text-sm text-slate-500">
            {error
              ? "Não foi possível carregar o histórico para este período."
              : "Histórico insuficiente para o gráfico."}
          </p>
        ) : null}

        {!loading && error && points.length > 1 ? (
          <p className="mt-2 text-xs text-amber-600">
            A mostrar histórico embutido (API de série temporal indisponível).
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
