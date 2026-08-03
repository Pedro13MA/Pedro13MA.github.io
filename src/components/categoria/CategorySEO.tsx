"use client";

import { useEffect } from "react";
import type { CategorySeo } from "@/lib/api";

type Props = {
  seo: CategorySeo;
  jsonLd?: Record<string, unknown>[];
  description?: string;
  updatedHint?: string | null;
  productCount?: number | null;
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
}: Props) {
  const text = description || seo.meta_description || seo.description;

  useEffect(() => {
    if (!jsonLd?.length) return;
    const nodes: HTMLScriptElement[] = [];
    for (const block of jsonLd) {
      const el = document.createElement("script");
      el.type = "application/ld+json";
      el.setAttribute("data-limiar-seo", "1");
      el.text = JSON.stringify(block);
      document.head.appendChild(el);
      nodes.push(el);
    }
    return () => {
      for (const el of nodes) el.remove();
    };
  }, [jsonLd]);

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <p className="text-sm leading-relaxed text-slate-600">{text}</p>
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
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
