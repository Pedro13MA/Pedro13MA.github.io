"use client";

import Link from "next/link";
import type { MarketplaceProductCard } from "@/lib/api";
import { formatEUR } from "@/lib/utils";

export function MarketProductCard({ item }: { item: MarketplaceProductCard }) {
  if (!item.slug) return null;
  return (
    <Link
      href={`/p/?id=${encodeURIComponent(item.slug)}`}
      className="block rounded-xl border border-slate-200 bg-white p-3 hover:border-slate-300"
    >
      <div className="flex h-20 items-center justify-center rounded-lg bg-slate-50">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name || item.slug || ""}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        ) : null}
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-900">
        {item.name || item.slug}
      </p>
      {item.currentPrice != null ? (
        <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">
          {formatEUR(item.currentPrice)}
        </p>
      ) : null}
      {item.discountPct != null ? (
        <p className="text-[11px] text-emerald-700">-{item.discountPct}%</p>
      ) : null}
    </Link>
  );
}

export function MarketStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-display text-lg font-bold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}
