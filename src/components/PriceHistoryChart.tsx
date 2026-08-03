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
  { days: 1825, label: "Tudo" },
] as const;

type PeriodDays = (typeof PERIODS)[number]["days"];

type Props = {
  productId: string;
  fallbackHistory?: PricePoint[];
  fallbackMin?: number;
  fallbackMax?: number;
  referencePrice?: number | null;
  referenceSource?: string | null;
  pvpr?: number | null;
  /** FASE 7.8 — eventos informativos (dados já existentes). */
  highlightNewMin?: boolean;
  hasPromotions?: boolean;
  hasCoupons?: boolean;
};

function ChartSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-100" />
      <div className="h-72 w-full animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function autoGranularity(days: number): HistoryGranularity {
  return days >= 180 ? "weekly" : "daily";
}

export function PriceHistoryChart({
  productId,
  fallbackHistory = [],
  fallbackMin,
  fallbackMax,
  referencePrice,
  referenceSource,
  pvpr,
  highlightNewMin,
  hasPromotions,
  hasCoupons,
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

  const points =
    data?.points?.map((p) => ({
      date: p.date,
      price: p.price,
      avg: p.avgPrice ?? null,
    })) ??
    (error && fallbackHistory.length > 1
      ? fallbackHistory.map((p) => ({ ...p, avg: null as number | null }))
      : []);

  const histMin =
    data?.historicalMin ??
    fallbackMin ??
    (points.length ? Math.min(...points.map((p) => p.price)) : 0);
  const histMax =
    data?.historicalMax ??
    fallbackMax ??
    (points.length ? Math.max(...points.map((p) => p.price)) : 0);

  const refPrice = data?.referencePrice ?? referencePrice;
  const refSource = data?.referenceSource ?? referenceSource;

  return (
    <Card>
      <CardHeader className="gap-4">
        <CardTitle>Histórico de preço</CardTitle>
        <div
          className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1"
          role="group"
          aria-label="Período do gráfico"
        >
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => setDays(p.days)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                days === p.days
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? <ChartSkeleton /> : null}

        {!loading && points.length > 1 ? (
          <Chart
            history={points}
            historicalMin={histMin}
            historicalMax={histMax}
            referencePrice={refPrice}
            referenceSource={refSource}
            pvpr={pvpr}
          />
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
            A mostrar histórico embutido (série temporal indisponível para este período).
          </p>
        ) : null}

        {!loading ? (
          <ul className="mt-4 flex flex-wrap gap-2 text-xs">
            {highlightNewMin ? (
              <li className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                Novo mínimo observado
              </li>
            ) : null}
            {hasPromotions ? (
              <li className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-medium text-amber-900">
                Promoções activas
              </li>
            ) : null}
            {hasCoupons ? (
              <li className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 font-medium text-sky-800">
                Cupões disponíveis
              </li>
            ) : null}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
