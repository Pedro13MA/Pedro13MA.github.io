"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { searchProducts } from "@/lib/api";
import {
  findBetterStorageVariantTip,
  stripCapacityFromName,
  type VariantValueTip,
} from "@/lib/product-insights";
import { formatEUR } from "@/lib/utils";

type Props = {
  slug: string;
  name: string;
  brand?: string | null;
  currentPrice: number;
};

export function VariantValueTip({ slug, name, brand, currentPrice }: Props) {
  const [tip, setTip] = useState<VariantValueTip | null>(null);

  useEffect(() => {
    let cancelled = false;
    const q = stripCapacityFromName(name);
    if (q.length < 4) return;

    searchProducts(q, {
      brand: brand || undefined,
      limit: 16,
      sortBy: "price_asc",
    })
      .then((res) => {
        if (cancelled) return;
        const found = findBetterStorageVariantTip({
          currentName: name,
          currentSlug: slug,
          currentPrice,
          siblings: (res.results || []).map((r) => ({
            slug: r.slug,
            name: r.name,
            currentPrice: r.currentPrice,
          })),
        });
        setTip(found);
      })
      .catch(() => {
        if (!cancelled) setTip(null);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, name, brand, currentPrice]);

  if (!tip) return null;

  return (
    <aside className="rounded-2xl border border-sky-200/90 bg-sky-50/70 px-4 py-3.5 text-sm leading-relaxed text-sky-950">
      <p>
        <span className="mr-1" aria-hidden>
          💡
        </span>
        <span className="font-semibold">Dica Limiar:</span> {tip.message}
      </p>
      <p className="mt-2 text-xs text-sky-800/80">
        <Link
          href={`/p/?id=${encodeURIComponent(tip.siblingSlug)}`}
          className="font-medium underline decoration-sky-300 underline-offset-2 hover:text-sky-950"
        >
          {tip.siblingName}
        </Link>
        {" · "}
        {formatEUR(tip.siblingPrice)}
      </p>
    </aside>
  );
}
