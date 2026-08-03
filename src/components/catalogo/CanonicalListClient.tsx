"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCatalogo, type CanonicalGroupListItem } from "@/lib/api";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { formatEUR } from "@/lib/utils";

export function CanonicalListClient() {
  const [groups, setGroups] = useState<CanonicalGroupListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    getCatalogo({ limit: 60 })
      .then((r) => {
        if (!c) setGroups(r.groups || []);
      })
      .catch(() => {
        if (!c) setError("Catálogo indisponível.");
      });
    return () => {
      c = true;
    };
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900">
            Catálogo canónico
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Famílias com várias variantes observadas. Escolhe antes de abrir a
            ficha.
          </p>
        </div>
        {error ? <p className="text-sm text-amber-800">{error}</p> : null}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <Link
              key={g.slug}
              href={`/catalogo/grupo/?id=${encodeURIComponent(g.slug)}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-sky-200"
            >
              <p className="font-display text-lg font-bold text-slate-900">
                {g.title}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {g.variantCount} variantes
                {g.minPrice != null ? ` · desde ${formatEUR(g.minPrice)}` : ""}
                {g.brandCount ? ` · ${g.brandCount} marcas` : ""}
              </p>
            </Link>
          ))}
        </div>
        {!groups.length && !error ? (
          <p className="text-sm text-slate-500">
            Ainda sem famílias com variantes suficientes.
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
