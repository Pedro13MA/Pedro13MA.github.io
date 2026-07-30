"use client";

import { useEffect, useState } from "react";
import { getCoupons, searchProducts } from "@/lib/api";

type Stat = {
  icon: string;
  label: string;
  value: string;
};

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)} mil` : `${k.toFixed(1).replace(".", ",")} mil`;
  }
  return String(n);
}

export function HomeStatsStrip() {
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [search, coupons] = await Promise.all([
          searchProducts("", { limit: 1 }).catch(() => null),
          getCoupons().catch(() => null),
        ]);
        if (cancelled) return;

        const products = search?.total ?? 0;
        const facetStores = search?.facets?.stores?.length ?? 0;
        const couponStores = coupons?.stores?.length ?? 0;
        const storeCount = Math.max(facetStores, couponStores);
        const campaigns = coupons?.coupons?.length ?? 0;

        const next: Stat[] = [
          {
            icon: "📦",
            label: "Produtos monitorizados",
            value: products > 0 ? formatCount(products) : "—",
          },
          {
            icon: "🏪",
            label: "Lojas monitorizadas",
            value: storeCount > 0 ? String(storeCount) : "—",
          },
          {
            icon: "📈",
            label: "Histórico disponível",
            value: products > 0 ? "Activo" : "—",
          },
          {
            icon: "🔄",
            label: "Actualização",
            value: "Diária",
          },
          {
            icon: "🎟️",
            label: "Campanhas activas",
            value: campaigns > 0 ? String(campaigns) : "—",
          },
        ];
        setStats(next);
      } catch {
        if (!cancelled) setStats(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) {
    return (
      <section className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-3 sm:px-6 lg:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-slate-200/90 bg-slate-50/50 px-3 py-3 text-center sm:text-left"
          >
            <p className="text-lg" aria-hidden>
              {stat.icon}
            </p>
            <p className="mt-1 font-display text-xl font-bold tabular-nums text-slate-900">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] font-medium leading-snug text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
