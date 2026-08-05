"use client";

import { collectImageUrls } from "@/lib/product-content";
import { knowledgeForJsonLd } from "@/lib/product-knowledge";
import { resolveProductInsights } from "@/lib/product-insights-buying";
import { recommendationsFromApi } from "@/lib/product-discovery";
import { displayCategoryLabel } from "@/lib/product-display";
import type { Product } from "@/lib/types";

/**
 * Schema.org Product + Recommended ItemList (FASE 7.17).
 */
export function ProductJsonLd({ product }: { product: Product }) {
  const images = collectImageUrls(product);
  const best = [...product.offers].sort((a, b) => a.price - b.price)[0];
  const category =
    displayCategoryLabel(
      product.leafId?.replace(/_/g, " "),
      product.subcategoryLabel,
      product.category,
    ) || undefined;

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.ean || product.slug,
    ...(product.brand ? { brand: { "@type": "Brand", name: product.brand } } : {}),
    ...(category ? { category } : {}),
    ...(images.length ? { image: images } : {}),
  };

  const specs = knowledgeForJsonLd(product);
  if (specs.length) {
    data.additionalProperty = specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.name,
      value: s.value,
    }));
  }

  const insights = resolveProductInsights(product);
  if (insights.pros.length) data.positiveNotes = insights.pros;
  if (insights.cons.length) data.negativeNotes = insights.cons;

  if (best && best.price > 0) {
    data.offers = {
      "@type": "Offer",
      url: best.url,
      priceCurrency: best.currency || "EUR",
      price: best.price,
      availability:
        best.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      ...(best.storeName || best.store
        ? { seller: { "@type": "Organization", name: best.storeName || best.store } }
        : {}),
    };
  }

  const scripts: Record<string, unknown>[] = [data];

  const recs = recommendationsFromApi(product.recommendations);
  const items = [
    ...(recs?.recommended || []),
    ...(recs?.alternatives || []),
    ...(recs?.similar || []),
  ].slice(0, 8);
  if (items.length) {
    scripts.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "RecommendedProducts",
      itemListElement: items.map((it, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `/p/?id=${encodeURIComponent(it.slug)}`,
        name: it.name,
      })),
    });
  }

  return (
    <>
      {scripts.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
    </>
  );
}
