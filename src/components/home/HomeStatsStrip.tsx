"use client";

import { useEffect, useState } from "react";
import { getCoupons, searchProducts } from "@/lib/api";
import { MONITORED_STORES } from "@/lib/coupon-stores";
import { formatRelativeTimePt } from "@/lib/product-insights";

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
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);

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
        const storeCount = Math.max(
          facetStores,
          couponStores,
          MONITORED_STORES.length,
        );
        const campaigns = coupons?.coupons?.length ?? 0;
        const nowIso = new Date().toISOString();
        setFetchedAt(nowIso);

        const next: Stat[] = [];

        next.push({
          icon: "📦",
          label: "Produtos monitorizados",
          value: products > 0 ? formatCount(products) : "Em crescimento",
        });

        next.push({
          icon: "🏪",
          label: "Lojas monitorizadas",
          value: storeCount > 0 ? String(storeCount) : "Em crescimento",
        });

        next.push({
          icon: "📈",
          label: "Histórico máximo",
          value: products > 0 ? "Até 5 anos" : "Em crescimento",
        });

        next.push({
          icon: "🔄",
          label: "Última actualização",
          value: formatRelativeTimePt(nowIso) || "há pouco",
        });

        if (campaigns > 0) {
          next.push({
            icon: "🎟️",
            label: "Campanhas activas",
            value: String(campaigns),
          });
        }

        setStats(next);
      } catch {
        if (!cancelled) {
          setStats([
            {
              icon: "📦",
              label: "Produtos monitorizados",
              value: "Em crescimento",
            },
            {
              icon: "🏪",
              label: "Lojas monitorizadas",
              value: String(MONITORED_STORES.length),
            },
            {
              icon: "📈",
              label: "Histórico máximo",
              value: "Em crescimento",
            },
            {
              icon: "🔄",
              label: "Última actualização",
              value: "Actualização diária",
            },
          ]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!fetchedAt) return;
    const id = window.setInterval(() => {
      setStats((prev) => {
        if (!prev) return prev;
        return prev.map((s) =>
          s.label === "Última actualização"
            ? { ...s, value: formatRelativeTimePt(fetchedAt) || "há pouco" }
            : s,
        );
      });
    }, 60_000);
    return () => window.clearInterval(id);
  }, [fetchedAt]);

  const gridClass =
    stats && stats.length >= 5
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      : "grid-cols-2 sm:grid-cols-4";

  if (!stats) {
    return (
      <section className="border-b border-slate-200/60 bg-white">
        <div className={`mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:px-6 ${gridClass}`}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[4.5rem] animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="border-b border-slate-200/60 bg-white">
      <div className={`mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:gap-4 sm:px-6 ${gridClass}`}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex min-h-[4.5rem] flex-col justify-center rounded-2xl border border-slate-200/70 bg-[#FAFAFA] px-3.5 py-3 sm:px-4"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm leading-none" aria-hidden>
                {stat.icon}
              </span>
              <p className="font-display text-lg font-bold tabular-nums tracking-tight text-slate-900 sm:text-xl">
                {stat.value}
              </p>
            </div>
            <p className="mt-1 text-xs font-medium leading-snug text-slate-500">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
