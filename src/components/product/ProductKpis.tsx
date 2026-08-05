"use client";

import type { ProductMetricsOut } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatEUR } from "@/lib/utils";
import { formatRelativeTimePt } from "@/lib/product-insights";

type Props = {
  product: Product;
  metrics?: ProductMetricsOut | null;
};

export function ProductKpis({ product, metrics }: Props) {
  const storeCount = metrics?.storeCount ?? product.offers.length;
  const lastHist = product.history.length
    ? product.history[product.history.length - 1]?.date
    : null;
  const updated = formatRelativeTimePt(lastHist) || "—";

  const items = [
    { label: "Actual", value: formatEUR(product.currentPrice) },
    {
      label: "Média 30d",
      value: formatEUR(metrics?.avg30d ?? product.avg30d),
    },
    { label: "Mín.", value: formatEUR(product.historicalMin) },
    { label: "Máx.", value: formatEUR(product.historicalMax) },
    { label: "Lojas", value: String(storeCount) },
    {
      label: "Índice",
      value: `${product.decision.lymiarIndex.value}`,
    },
    { label: "Actualizado", value: updated },
  ];

  return (
    <section
      aria-label="Indicadores de preço"
      className="overflow-x-auto rounded-xl border border-slate-200/80 bg-white"
    >
      <ul className="flex min-w-max divide-x divide-slate-100 sm:grid sm:min-w-0 sm:grid-cols-7 sm:divide-x">
        {items.map((item) => (
          <li key={item.label} className="min-w-[5.5rem] px-3 py-2.5 sm:min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {item.label}
            </p>
            <p className="mt-0.5 font-display text-sm font-bold tabular-nums text-slate-900 sm:text-base">
              {item.value}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
