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
  /** ISO da última actualização conhecida (opcional). */
  lastUpdatedAt?: string | null;
};

function Skeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
      ))}
    </div>
  );
}

export function MarketSummaryPanel({
  ean,
  currentPrice,
  avg30d,
  lastUpdatedAt,
}: Props) {
  const [metrics, setMetrics] = useState<ProductMetricsOut | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductMetrics(ean)
      .then((res) => {
        if (!cancelled) setMetrics(res);
      })
      .catch(() => {
        if (!cancelled) setMetrics(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ean]);

  const marketAvg = metrics?.avg30d ?? avg30d ?? currentPrice ?? null;
  const storeCount = metrics?.storeCount ?? 0;
  const spread = metrics?.storeSpreadEur ?? null;
  const volLabel = volatilityLabelPt(metrics?.volatilityPct ?? null);
  const updated =
    formatRelativeTimePt(lastUpdatedAt) ||
    (metrics ? "há pouco" : null);

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
      label: "Diferença entre lojas",
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
                className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-3"
              >
                <p className="text-[11px] font-medium leading-snug text-slate-500">
                  <span aria-hidden className="mr-1">
                    {cell.icon}
                  </span>
                  {cell.label}
                </p>
                <p className="mt-1.5 font-display text-lg font-semibold tabular-nums text-slate-900">
                  {cell.value}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-400">{cell.hint}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
