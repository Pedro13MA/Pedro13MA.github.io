"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCategories, type CategorySummary } from "@/lib/api";
import { CATEGORY_MENU_L1 } from "@/lib/category-slugs";

export default function CategoriasHubPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((res) => {
        if (!cancelled) setCategories(res.categories || []);
      })
      .catch(() => {
        if (!cancelled) {
          setCategories(
            CATEGORY_MENU_L1.map((c) => ({
              slug: c.slug,
              display_name: c.label,
              level: 1,
              children_count: 0,
              seo: {
                slug: c.slug,
                title: c.label,
                description: "",
                canonical_url: `/categoria/${c.slug}/`,
              },
            })),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">
        Categorias
      </h1>
      <p className="mt-2 text-slate-500">
        Navega o catálogo Limiar sem escrever pesquisa.
      </p>

      {loading ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-slate-100"
            />
          ))}
        </div>
      ) : (
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/categoria/${c.slug}/`}
                className="block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-sky-200 hover:shadow-md"
              >
                <p className="font-display text-lg font-semibold text-slate-900">
                  {c.display_name}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {c.children_count} subcategorias
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
