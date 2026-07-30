"use client";

import { useEffect, useState } from "react";
import { fetchProductMetrics, type ProductMetricsOut } from "@/lib/api";
import {
  formatRelativeTimePt,
  volatilityLabelPt,
} from "@/lib/product-insights";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEUR } from "@/lib/utils";

type Props = {
  ean: string;
  currentPrice?: number;
  avg30d?: number | null;
  lastUpdatedAt?: string | null;
  /** Se já carregado no parent, evita segundo pedido. */
  metrics?: ProductMetricsOut | null;
};

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

export function MarketSummaryPanel({
  ean,
  currentPrice,
  avg30d,
  lastUpdatedAt,
  metrics: metricsProp,
}: Props) {
  const [metricsLocal, setMetricsLocal] = useState<ProductMetricsOut | null>(null);
  const [loading, setLoading] = useState(metricsProp == null);

  useEffect(() => {
    if (metricsProp != null) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchProductMetrics(ean)
      .then((res) => {
        if (!cancelled) setMetricsLocal(res);
      })
      .catch(() => {
        if (!cancelled) setMetricsLocal(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ean, metricsProp]);

  const metrics = metricsProp ?? metricsLocal;
  const marketAvg = metrics?.avg30d ?? avg30d ?? currentPrice ?? null;
  const storeCount = metrics?.storeCount ?? 0;
  const spread = metrics?.storeSpreadEur ?? null;
  const volLabel = volatilityLabelPt(metrics?.volatilityPct ?? null);
  const updated =
    formatRelativeTimePt(lastUpdatedAt) || (metrics ? "há pouco" : null);

  const cells = [
    {
      icon: "💰",
      label: "Preço médio do mercado",
      value: marketAvg != null ? formatEUR(marketAvg) : "—",
      hint: "Média 30 dias",
    },
    {
      icon: "🏪",
      label: "Lojas monitorizadas",
      value: storeCount > 0 ? String(storeCount) : "—",
      hint: storeCount === 1 ? "loja" : "lojas",
    },
    {
      icon: "📉",
      label: "Maior diferença entre lojas",
      value: spread != null ? formatEUR(spread) : "—",
      hint: "Do mais barato ao mais caro",
    },
    {
      icon: "📈",
      label: "Volatilidade",
      value: volLabel,
      hint:
        metrics?.volatilityPct != null
          ? `${metrics.volatilityPct.toFixed(1).replace(".", ",")}%`
          : "Com base no histórico",
    },
    {
      icon: "🔄",
      label: "Última actualização",
      value: updated ?? "—",
      hint: "Preços observados",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo do mercado</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? <Skeleton /> : null}
        {!loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {cells.map((cell) => (
              <div
                key={cell.label}
                className="flex flex-col rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 px-3.5 py-3.5 shadow-sm"
              >
                <span className="text-lg" aria-hidden>
                  {cell.icon}
                </span>
                <p className="mt-2 text-[11px] font-medium leading-snug text-slate-500">
                  {cell.label}
                </p>
                <p className="mt-1.5 font-display text-lg font-semibold tabular-nums text-slate-900">
                  {cell.value}
                </p>
                <p className="mt-auto pt-1 text-[11px] text-slate-400">{cell.hint}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
