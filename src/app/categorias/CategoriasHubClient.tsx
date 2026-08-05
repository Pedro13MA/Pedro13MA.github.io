"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getCategories, type CategorySummary } from "@/lib/api";
import { CATEGORY_MENU_L1 } from "@/lib/category-slugs";
import { isP32NavigationEnabled } from "@/lib/nav/flags";
import { flattenTreeForMap } from "@/lib/nav/build-menu";
import { useTaxonomyNavOptional } from "@/components/nav/TaxonomyTreeProvider";
import {
  CategoryGrid,
  CategoryHero,
} from "@/components/nav/CategoryLayout";

function LegacyHub() {
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
        Navega o catálogo Lymiar sem escrever pesquisa.
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

function P32Hub() {
  const nav = useTaxonomyNavOptional();
  const sections = useMemo(
    () => (nav?.tree?.length ? flattenTreeForMap(nav.tree) : []),
    [nav?.tree],
  );

  if (nav?.loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </main>
    );
  }

  return (
    <>
      <CategoryHero
        title="Categorias"
        description="Mapa completo do catálogo. Pesquisa continua a ser o caminho principal — isto é exploração."
        breadcrumbs={[
          { label: "Início", href: "/" },
          { label: "Categorias" },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {nav?.error ? (
          <p className="text-sm text-amber-700">
            Não foi possível carregar a árvore. A mostrar atalhos do menu.
          </p>
        ) : null}
        {sections.length ? (
          <div className="space-y-14">
            {sections.map(({ l1, l2, leaves }) => (
              <section key={l1.slug} id={l1.slug}>
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    <Link
                      href={`/categoria/${l1.slug}/`}
                      className="hover:text-sky-700"
                    >
                      {l1.display_name}
                    </Link>
                  </h2>
                  <Link
                    href={`/categoria/${l1.slug}/`}
                    className="text-sm text-sky-700 hover:underline"
                  >
                    Ver tudo
                  </Link>
                </div>
                {l2.length ? (
                  <div className="mt-4">
                    <CategoryGrid
                      items={l2.map((c) => ({
                        href: `/categoria/${c.slug}/`,
                        title: c.display_name,
                        subtitle: `${c.children?.length || 0} subcategorias`,
                      }))}
                    />
                  </div>
                ) : null}
                {leaves.length ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {leaves.slice(0, 24).map((leaf) => (
                      <li key={leaf.slug}>
                        <Link
                          href={`/categoria/${leaf.slug}/`}
                          className="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600 ring-1 ring-slate-200 hover:bg-white"
                        >
                          {leaf.display_name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        ) : (
          <CategoryGrid
            items={(nav?.megaMenu?.columns || []).map((c) => ({
              href: c.href,
              title: c.label,
            }))}
          />
        )}
      </main>
    </>
  );
}

export default function CategoriasHubPage() {
  if (isP32NavigationEnabled()) return <P32Hub />;
  return <LegacyHub />;
}
