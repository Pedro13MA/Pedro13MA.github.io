"use client";

import { useEffect } from "react";
import type { CategorySeo } from "@/lib/api";

type Props = {
  seo: CategorySeo;
  jsonLd?: Record<string, unknown>[];
  description?: string;
  updatedHint?: string | null;
  productCount?: number | null;
  /** UI curta — JSON-LD mantém-se completo. */
  compact?: boolean;
};

/**
 * FASE 7.6 — bloco de conteúdo SEO institucional + JSON-LD.
 * Não inventa specs técnicas.
 */
export function CategorySEO({
  seo,
  jsonLd,
  description,
  updatedHint,
  productCount,
  compact = true,
}: Props) {
  const text = description || seo.meta_description || seo.description;

  useEffect(() => {
    if (!jsonLd?.length) return;
    const nodes: HTMLScriptElement[] = [];
    for (const block of jsonLd) {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.setAttribute("data-lymiar-seo", "1");
      el.text = JSON.stringify(block);
      document.head.appendChild(el);
      nodes.push(el);
    }
    return () => {
      for (const el of nodes) el.remove();
    };
  }, [jsonLd]);

  if (!text) return null;

  const short =
    compact && text.length > 180 ? `${text.slice(0, 177).trim()}…` : text;

  return (
    <div className="space-y-2">
      <p className="max-w-2xl text-sm leading-relaxed text-[var(--hm-muted,#5b6b7c)]">
        {short}
      </p>
      <div className="flex flex-wrap gap-3 text-xs text-[var(--hm-faint,#8b9aab)]">
        {typeof productCount === "number" ? (
          <span>
            {productCount} produto{productCount === 1 ? "" : "s"} observados
          </span>
        ) : null}
        {updatedHint ? <span>{updatedHint}</span> : null}
      </div>
    </div>
  );
}
