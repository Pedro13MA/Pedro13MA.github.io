"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDealsNow, summaryToProduct } from "@/lib/api";
import { TELEGRAM_CHANNEL } from "@/lib/constants";

export function HomeHeroStats() {
  const [histMins, setHistMins] = useState<number | null>(null);
  const [dealsCount, setDealsCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDealsNow(50)
      .then((res) => {
        if (cancelled) return;
        const products = res.results.map(summaryToProduct);
        setDealsCount(products.length);
        setHistMins(products.filter((p) => p.decision.isHistoricalMin).length);
      })
      .catch(() => {
        if (!cancelled) {
          setHistMins(null);
          setDealsCount(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (histMins == null && dealsCount == null) return null;

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {histMins != null ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-sm font-medium text-sky-800">
          📉 {histMins} Mínimo{histMins === 1 ? "" : "s"} Histórico
          {histMins === 1 ? "" : "s"} Hoje
        </span>
      ) : null}
      {dealsCount != null && dealsCount > 0 ? (
        <Link
          href="/catalog/?section=deals"
          className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-800 transition-colors hover:border-emerald-300"
        >
          🔥 {dealsCount} Super Oportunidade{dealsCount === 1 ? "" : "s"}
        </Link>
      ) : null}
      <a
        href={TELEGRAM_CHANNEL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300"
      >
        📢 Alertas no Telegram
      </a>
    </div>
  );
}
