"use client";

import type { ProductMetricsOut } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatEUR } from "@/lib/utils";
import { formatRelativeTimePt } from "@/lib/product-insights";

type Props = {
  product: Product;
  metrics?: ProductMetricsOut | null;
};

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold tabular-nums text-slate-900">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p> : null}
    </div>
  );
}

export function ProductKpis({ product, metrics }: Props) {
  const storeCount = metrics?.storeCount ?? product.offers.length;
  const lastHist = product.history.length
    ? product.history[product.history.length - 1]?.date
    : null;
  const updated = formatRelativeTimePt(lastHist) || "—";
  const coupons = product.storeCouponsAvailable
    ? "Sim"
    : product.offers.some((o) => o.couponCode || o.couponLabel)
      ? "Sim"
      : "Não";

  return (
    <section aria-label="Indicadores de preço" className="space-y-3">
      <h2 className="font-display text-lg font-bold text-slate-900">Indicadores</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Preço atual" value={formatEUR(product.currentPrice)} />
        <Kpi
          label="Preço médio (30d)"
          value={formatEUR(metrics?.avg30d ?? product.avg30d)}
        />
        <Kpi label="Mínimo" value={formatEUR(product.historicalMin)} />
        <Kpi label="Máximo" value={formatEUR(product.historicalMax)} />
        <Kpi label="Última atualização" value={updated} />
        <Kpi
          label="Lojas"
          value={String(storeCount)}
          hint="ofertas observadas"
        />
        <Kpi label="Cupões" value={coupons} />
        <Kpi
          label="Índice Limiar"
          value={`${product.decision.limiarIndex.value}/100`}
        />
      </div>
    </section>
  );
}
