"use client";

import Link from "next/link";
import type { MarketplaceProductCard } from "@/lib/api";
import { formatEUR } from "@/lib/utils";

export function HomeSection({
  id,
  title,
  subtitle,
  href,
  children,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-16 py-10 sm:py-14">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-xl">
          <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
              {subtitle}
            </p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="text-sm font-medium text-sky-700 hover:text-sky-900"
          >
            Ver todos →
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function HomeScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory sm:mx-0 sm:px-0">
      {children}
    </div>
  );
}

export function HomeProductCard({
  item,
  badge,
}: {
  item: MarketplaceProductCard;
  badge?: string | null;
}) {
  if (!item.slug) return null;
  return (
    <Link
      href={`/p/?id=${encodeURIComponent(item.slug)}`}
      className="w-[9.5rem] shrink-0 snap-start rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm transition-colors hover:border-slate-300 sm:w-40"
    >
      <div className="flex h-24 items-center justify-center rounded-lg bg-slate-50">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name || item.slug || ""}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        ) : (
          <span className="text-[10px] text-slate-300">Sem imagem</span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-xs font-medium text-slate-900">
        {item.name || item.slug}
      </p>
      {item.currentPrice != null ? (
        <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">
          {formatEUR(item.currentPrice)}
        </p>
      ) : null}
      {badge || item.discountPct != null ? (
        <p className="mt-0.5 text-[11px] font-medium text-emerald-700">
          {badge ||
            (item.discountPct != null ? `−${item.discountPct}% observado` : null)}
        </p>
      ) : null}
    </Link>
  );
}

export function HomeEmpty({ message }: { message: string }) {
  return <p className="text-sm text-slate-500">{message}</p>;
}
