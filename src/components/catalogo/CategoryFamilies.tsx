"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCatalogo, type CanonicalGroupListItem } from "@/lib/api";
import { formatEUR } from "@/lib/utils";

export function CategoryFamilies({ leafHint }: { leafHint: string }) {
  const [groups, setGroups] = useState<CanonicalGroupListItem[]>([]);

  useEffect(() => {
    let c = false;
    getCatalogo({ limit: 8, leaf: leafHint })
      .then((r) => {
        if (!c) setGroups(r.groups || []);
      })
      .catch(() => {
        if (!c) setGroups([]);
      });
    return () => {
      c = true;
    };
  }, [leafHint]);

  if (!groups.length) return null;

  return (
    <div className="mb-8 space-y-3">
      <h2 className="font-display text-lg font-bold text-slate-900">
        Famílias populares
      </h2>
      <p className="text-sm text-slate-500">
        Produtos canónicos com várias variantes nesta área.
      </p>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
        {groups.map((g) => (
          <Link
            key={g.slug}
            href={`/catalogo/grupo/?id=${encodeURIComponent(g.slug)}`}
            className="w-44 shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-sky-200"
          >
            <p className="line-clamp-2 text-sm font-semibold text-slate-900">
              {g.title}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {g.variantCount} variantes
              {g.minPrice != null ? ` · ${formatEUR(g.minPrice)}` : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
