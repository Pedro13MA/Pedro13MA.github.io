/**
 * Breadcrumbs de produto — Início + taxonomy path + nome.
 */

import type { BreadcrumbCrumb } from "@/lib/product-breadcrumb";
import { buildProductBreadcrumbs } from "@/lib/product-breadcrumb";

const LEAF_LABEL: Record<string, string> = {
  gpu: "Placas Gráficas",
  cpu: "Processadores",
  ssd: "SSD",
  ram: "RAM",
  laptop: "Portáteis",
  smartphone: "Smartphones",
  monitor: "Monitores",
  motherboard: "Motherboards",
};

function slugLabel(slug: string): string {
  return (
    LEAF_LABEL[slug] ||
    slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function buildPremiumProductBreadcrumbs(opts: {
  category?: string | null;
  subcategory?: string | null;
  subcategoryLabel?: string | null;
  leafId?: string | null;
  taxonomyPath?: string | null;
  brand?: string | null;
  productName?: string | null;
  chipsetModel?: string | null;
}): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = [{ label: "Início", href: "/" }];

  const pathRaw = (opts.taxonomyPath || "").trim();
  if (pathRaw) {
    const parts = pathRaw
      .split(/[/>|]/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (const part of parts) {
      const slug = part.toLowerCase().replace(/\s+/g, "_");
      crumbs.push({
        label: slugLabel(slug),
        href: `/categoria/${encodeURIComponent(slug)}/`,
      });
    }
  } else {
    const legacy = buildProductBreadcrumbs({
      category: opts.category,
      subcategory: opts.subcategory,
      subcategoryLabel: opts.subcategoryLabel,
    });
    for (const c of legacy) {
      const slugGuess = (opts.subcategory || "").toLowerCase();
      crumbs.push({
        label: c.label,
        href:
          slugGuess && c.label === (opts.subcategoryLabel || "")
            ? `/categoria/${encodeURIComponent(slugGuess)}/`
            : c.href,
      });
    }
    if (opts.leafId && !legacy.length) {
      crumbs.push({
        label: slugLabel(opts.leafId),
        href: `/categoria/${encodeURIComponent(opts.leafId)}/`,
      });
    }
  }

  if (opts.chipsetModel) {
    crumbs.push({ label: opts.chipsetModel });
  }

  if (opts.brand) {
    crumbs.push({ label: opts.brand });
  } else if (opts.productName) {
    const short =
      opts.productName.length > 40
        ? `${opts.productName.slice(0, 37)}…`
        : opts.productName;
    crumbs.push({ label: short });
  }

  return crumbs;
}
