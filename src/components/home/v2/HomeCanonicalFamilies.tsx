"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCatalogo, type CanonicalGroupListItem } from "@/lib/api";
import {
  HomeEmpty,
  HomeScroller,
  HomeSection,
} from "@/components/home/v2/HomeShared";
import { formatEUR } from "@/lib/utils";

export function HomeCanonicalFamilies() {
  const [groups, setGroups] = useState<CanonicalGroupListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    setLoading(true);
    getCatalogo({ limit: 8 })
      .then((r) => {
        if (!c) setGroups(r.groups || []);
      })
      .catch(() => {
        if (!c) setGroups([]);
      })
      .finally(() => {
        if (!c) setLoading(false);
      });
    return () => {
      c = true;
    };
  }, []);

  return (
    <HomeSection
      title="Produtos com variantes"
      subtitle="Famílias canónicas — escolhe a variante antes da ficha."
      href="/catalogo/"
    >
      {loading ? (
        <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
      ) : groups.length ? (
        <HomeScroller>
          {groups.map((g) => (
            <Link
              key={g.slug}
              href={`/catalogo/grupo/?id=${encodeURIComponent(g.slug)}`}
              className="w-44 shrink-0 snap-start rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sky-200"
            >
              <p className="line-clamp-2 text-sm font-semibold text-slate-900">
                {g.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {g.variantCount} variantes
                {g.minPrice != null ? ` · desde ${formatEUR(g.minPrice)}` : ""}
              </p>
            </Link>
          ))}
        </HomeScroller>
      ) : (
        <HomeEmpty message="Ainda sem famílias com variantes suficientes." />
      )}
    </HomeSection>
  );
}
