"use client";

import { useEffect, useState } from "react";
import { TrendingDown, Store, Activity } from "lucide-react";
import { fetchProductMetrics, type ProductMetricsOut } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn, formatEUR } from "@/lib/utils";

type Props = {
  ean: string;
  /** Preço atual da página (fallback se a API omitir currentPrice). */
  currentPrice?: number;
};

function MetricsSkeleton() {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
      </div>
      <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}

function isAtAllTimeLow(current: number | null | undefined, atl: number | null | undefined) {
  if (current == null || atl == null) return false;
  return Math.abs(current - atl) < 0.015;
}

function volatilityTone(pct: number | null | undefined): {
  bar: string;
  label: string;
  width: number;
} {
  if (pct == null || Number.isNaN(pct)) {
    return { bar: "bg-slate-300", label: "Sem dados", width: 0 };
  }
  const width = Math.min(100, Math.max(4, pct));
  if (pct < 5) return { bar: "bg-emerald-500", label: "Baixa", width };
  if (pct < 15) return { bar: "bg-amber-500", label: "Moderada", width };
  return { bar: "bg-rose-500", label: "Alta", width };
}

export function ProductMetricsPanel({ ean, currentPrice }: Props) {
  const [metrics, setMetrics] = useState<ProductMetricsOut | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchProductMetrics(ean)
      .then((res) => {
        if (!cancelled) setMetrics(res);
      })
      .catch((err) => {
        if (!cancelled) {
          setMetrics(null);
          setError(err instanceof Error ? err.message : "Erro ao carregar métricas");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ean]);

  const price = metrics?.currentPrice ?? currentPrice ?? null;
  const atAtl = isAtAllTimeLow(price, metrics?.allTimeLow);
  const vol = volatilityTone(metrics?.volatilityPct ?? null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Métricas de mercado</CardTitle>
        <CardDescription>
          All-time low, médias e dispersão multi-loja a partir do histórico Lymiar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <MetricsSkeleton /> : null}

        {!loading && error ? (
          <p className="py-8 text-center text-sm text-slate-500">
            Não foi possível carregar as métricas deste produto.
          </p>
        ) : null}

        {!loading && !error && metrics ? (
          <div className="space-y-5">
            <div
              className={cn(
                "rounded-xl border p-4 transition-colors",
                atAtl
                  ? "border-emerald-200 bg-emerald-50/80"
                  : "border-slate-100 bg-slate-50/80",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <TrendingDown className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  Mínimo histórico (ATL)
                </div>
                {atAtl ? (
                  <span className="rounded-md border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
                    Preço ATL
                  </span>
                ) : null}
              </div>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums text-slate-900">
                {metrics.allTimeLow != null ? formatEUR(metrics.allTimeLow) : "—"}
              </p>
              {metrics.allTimeHigh != null ? (
                <p className="mt-1 text-xs text-slate-500">
                  Máximo histórico: {formatEUR(metrics.allTimeHigh)}
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <p className="text-xs font-medium text-slate-500">Média 30 dias</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums text-slate-900">
                  {metrics.avg30d != null ? formatEUR(metrics.avg30d) : "—"}
                </p>
                {metrics.samples30d > 0 ? (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {metrics.samples30d} amostras
                  </p>
                ) : null}
              </div>
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <p className="text-xs font-medium text-slate-500">Média 90 dias</p>
                <p className="mt-1 font-display text-lg font-semibold tabular-nums text-slate-900">
                  {metrics.avg90d != null ? formatEUR(metrics.avg90d) : "—"}
                </p>
                {metrics.samples90d > 0 ? (
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {metrics.samples90d} amostras
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Store className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                Dispersão entre lojas
              </div>
              <p className="mt-2 font-display text-lg font-semibold tabular-nums text-slate-900">
                {metrics.storeSpreadEur != null
                  ? formatEUR(metrics.storeSpreadEur)
                  : "—"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {metrics.storeCount > 0
                  ? `Diferença máx. entre ${metrics.storeCount} lojas`
                  : "Sem ofertas multi-loja"}
              </p>
              {metrics.storePrices.length > 1 ? (
                <ul className="mt-3 max-h-28 space-y-1.5 overflow-y-auto border-t border-slate-100 pt-3">
                  {[...metrics.storePrices]
                    .sort((a, b) => a.price - b.price)
                    .map((s) => (
                      <li
                        key={s.store}
                        className="flex items-center justify-between gap-2 text-xs text-slate-600"
                      >
                        <span className="truncate">{s.storeName || s.store}</span>
                        <span className="shrink-0 tabular-nums font-medium text-slate-800">
                          {formatEUR(s.price)}
                        </span>
                      </li>
                    ))}
                </ul>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Activity className="h-4 w-4 shrink-0 text-sky-600" aria-hidden />
                  Volatilidade
                </div>
                <span className="text-xs font-medium text-slate-500">{vol.label}</span>
              </div>
              <p className="mt-2 font-display text-lg font-semibold tabular-nums text-slate-900">
                {metrics.volatilityPct != null
                  ? `${metrics.volatilityPct.toFixed(1).replace(".", ",")}%`
                  : "—"}
              </p>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                role="meter"
                aria-valuenow={metrics.volatilityPct ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Índice de volatilidade"
              >
                <div
                  className={cn("h-full rounded-full transition-all", vol.bar)}
                  style={{ width: `${vol.width}%` }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
