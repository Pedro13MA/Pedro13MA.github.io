"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getCatalogoGroup,
  getCatalogoSemelhantes,
  type CanonicalGroupDetail,
  type CanonicalGroupListItem,
} from "@/lib/api";
import { VariantPicker } from "@/components/catalogo/VariantPicker";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { formatEUR } from "@/lib/utils";
import { addToCompare, type CompareItem } from "@/lib/compare";

type Props = { slug: string };

export function CanonicalPageClient({ slug }: Props) {
  const [group, setGroup] = useState<CanonicalGroupDetail | null>(null);
  const [similares, setSimilares] = useState<CanonicalGroupListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [compareMsg, setCompareMsg] = useState<string | null>(null);

  useEffect(() => {
    let c = false;
    getCatalogoGroup(slug)
      .then((g) => {
        if (!c) setGroup(g);
      })
      .catch(() => {
        if (!c) setError("Família não encontrada.");
      });
    getCatalogoSemelhantes(slug)
      .then((s) => {
        if (!c) setSimilares(s.similares || []);
      })
      .catch(() => {});
    return () => {
      c = true;
    };
  }, [slug]);

  const compareVariants = () => {
    if (!group?.variants?.length) return;
    let n = 0;
    for (const v of group.variants.slice(0, 4)) {
      if (!v.slug || v.currentPrice == null) continue;
      const item: Omit<CompareItem, "addedAt"> = {
        slug: v.slug,
        ean: v.ean || v.slug,
        name: v.name || v.slug,
        brand: v.brand,
        imageUrl: v.imageUrl,
        currentPrice: v.currentPrice,
        lymiarIndex: 0,
        leafId: v.leafId,
      };
      if (addToCompare(item).ok) n += 1;
    }
    setCompareMsg(
      n
        ? `${n} variantes no comparador.`
        : "Não foi possível adicionar (limite ou já presentes).",
    );
  };

  const jsonLd =
    group &&
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ProductGroup",
      name: group.title,
      productGroupID: group.slug,
      variesBy: (group.variableAttributes || []).map((a) => a.label),
      hasVariant: (group.variants || []).map((v) => ({
        "@type": "Product",
        name: v.name,
        sku: v.ean || v.slug,
        url: `https://lymiar.com/p/${encodeURIComponent(v.slug)}/`,
        offers:
          v.currentPrice != null
            ? {
                "@type": "Offer",
                price: v.currentPrice,
                priceCurrency: "EUR",
                availability: "https://schema.org/InStock",
              }
            : undefined,
      })),
    });

  return (
    <>
      <SiteHeader />
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
      ) : null}
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
        <nav className="text-xs text-slate-400">
          <Link href="/" className="hover:underline">
            Início
          </Link>
          {" / "}
          <Link href="/catalogo/" className="hover:underline">
            Catálogo
          </Link>
          {group?.leafId ? (
            <>
              {" / "}
              <Link
                href={`/categoria/${encodeURIComponent(group.leafId)}/`}
                className="hover:underline"
              >
                {group.leafId}
              </Link>
            </>
          ) : null}
          {" / "}
          <span className="text-slate-700">{group?.title || slug}</span>
        </nav>

        {error ? (
          <p className="text-amber-800">{error}</p>
        ) : !group ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        ) : (
          <>
            <header className="space-y-3">
              <h1 className="font-display text-3xl font-bold text-slate-900 sm:text-4xl">
                {group.title}
              </h1>
              <p className="text-sm text-slate-500">
                {group.variantCount} variantes disponíveis
                {group.minPrice != null
                  ? ` · Melhor preço desde ${formatEUR(group.minPrice)}`
                  : ""}
                {group.brandCount
                  ? ` · ${group.brandCount} marcas`
                  : ""}
                {group.storeCount
                  ? ` · até ${group.storeCount} lojas`
                  : ""}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={compareVariants}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:border-sky-300"
                >
                  Comparar variantes
                </button>
                <Link
                  href="/comparar/"
                  className="rounded-xl border border-transparent px-4 py-2 text-sm font-medium text-sky-700 hover:underline"
                >
                  Abrir comparador
                </Link>
              </div>
              {compareMsg ? (
                <p className="text-xs text-sky-700">{compareMsg}</p>
              ) : null}
            </header>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <h2 className="font-display text-lg font-bold text-slate-900">
                Escolhe a variante
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Só combinações observadas no catálogo — sem inventar.
              </p>
              <div className="mt-5">
                <VariantPicker group={group} />
              </div>
            </section>

            {similares.length ? (
              <section>
                <h2 className="font-display text-lg font-bold">Semelhantes</h2>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {similares.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/catalogo/grupo/?id=${encodeURIComponent(s.slug)}`}
                        className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300"
                      >
                        <p className="font-medium text-slate-900">{s.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {s.variantCount} variantes
                          {s.minPrice != null
                            ? ` · desde ${formatEUR(s.minPrice)}`
                            : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
