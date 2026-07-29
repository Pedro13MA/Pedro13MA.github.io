"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDealsNow, summaryToProduct } from "@/lib/api";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
import type { Product } from "@/lib/types";
import { cn, formatEUR } from "@/lib/utils";

function isTelegramWorthy(p: Product): boolean {
  return (
    p.decision.isHistoricalMin ||
    p.decision.semaphore === "buy" ||
    p.decision.limiarIndex.value >= 85
  );
}

export function TelegramAlertsCarousel() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    getDealsNow(50)
      .then((res) => {
        if (cancelled) return;
        const products = res.results
          .map(summaryToProduct)
          .filter(isTelegramWorthy)
          .slice(0, 12);
        setItems(products);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function scrollByCard(dir: -1 | 1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-carousel-card]");
    const delta = (card?.offsetWidth ?? 280) + 16;
    el.scrollBy({ left: dir * delta, behavior: "smooth" });
  }

  if (!loading && items.length === 0) return null;

  return (
    <section
      id="telegram-hoje"
      className="border-b border-slate-200/80 bg-gradient-to-b from-sky-50/80 via-white to-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900 sm:text-2xl">
              ⚡ Alertas do Telegram de Hoje
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              As melhores oportunidades publicadas no canal — em tempo quase real.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1 sm:flex">
              <button
                type="button"
                aria-label="Anterior"
                onClick={() => scrollByCard(-1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Seguinte"
                onClick={() => scrollByCard(1)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <a
              href={TELEGRAM_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-9 items-center rounded-xl bg-sky-700 px-3.5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800"
            >
              📢 Entrar no Telegram
            </a>
          </div>
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-44 w-[260px] shrink-0 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((product) => (
              <Link
                key={product.ean}
                data-carousel-card
                href={`/p/?id=${encodeURIComponent(product.slug)}`}
                className={cn(
                  "group relative w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl",
                  "border border-sky-200/80 bg-gradient-to-br from-white via-sky-50/60 to-emerald-50/40",
                  "shadow-[0_0_0_1px_rgba(14,165,233,0.08),0_12px_32px_-12px_rgba(14,165,233,0.35)]",
                  "transition-transform duration-300 hover:-translate-y-0.5",
                )}
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_55%)]" />
                <div className="relative flex gap-3 p-3">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white">
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-1.5"
                        sizes="96px"
                        unoptimized
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5 py-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700">
                      Alerta Telegram
                    </p>
                    <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                      {product.name}
                    </p>
                    <p className="font-display text-lg font-bold text-slate-900">
                      {formatEUR(product.currentPrice)}
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Índice {product.decision.limiarIndex.value}/100
                      {product.decision.isHistoricalMin ? " · Mín. histórico" : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
