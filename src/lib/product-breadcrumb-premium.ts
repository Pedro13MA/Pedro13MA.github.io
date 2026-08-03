/**
 * Breadcrumbs de produto — Início + taxonomy path + nome.
 * Nunca mostra "Other".
 */

import type { BreadcrumbCrumb } from "@/lib/product-breadcrumb";
import { buildProductBreadcrumbs } from "@/lib/product-breadcrumb";
import { isOtherLabel } from "@/lib/product-display";

const LEAF_LABEL: Record<string, string> = {
  gpu: "Placas Gráficas",
  cpu: "Processadores",
  ssd: "SSD",
  ram: "RAM",
  laptop: "Portáteis",
  smartphone: "Smartphones",
  monitor: "Monitores",
  motherboard: "Motherboards",
  informatica: "Informática",
  componentes: "Componentes",
};

function slugLabel(slug: string): string {
  const key = slug.toLowerCase().replace(/\s+/g, "_");
  return (
    LEAF_LABEL[key] ||
    slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function pushUnique(crumbs: BreadcrumbCrumb[], crumb: BreadcrumbCrumb) {
  if (isOtherLabel(crumb.label)) return;
  const last = crumbs[crumbs.length - 1];
  if (last && last.label.toLowerCase() === crumb.label.toLowerCase()) return;
  crumbs.push(crumb);
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
      if (isOtherLabel(part)) continue;
      const slug = part.toLowerCase().replace(/\s+/g, "_");
      pushUnique(crumbs, {
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
      if (isOtherLabel(c.label)) continue;
      const slugGuess = (opts.subcategory || opts.leafId || "").toLowerCase();
      pushUnique(crumbs, {
        label: c.label,
        href:
          slugGuess &&
          (c.label === (opts.subcategoryLabel || "") ||
            c.label.toLowerCase().includes("gráfic"))
            ? `/categoria/${encodeURIComponent(slugGuess)}/`
            : c.href,
      });
    }
    if (opts.leafId && crumbs.length <= 1) {
      pushUnique(crumbs, {
        label: slugLabel(opts.leafId),
        href: `/categoria/${encodeURIComponent(opts.leafId)}/`,
      });
    }
  }

  if (opts.chipsetModel && !isOtherLabel(opts.chipsetModel)) {
    pushUnique(crumbs, { label: opts.chipsetModel });
  } else if (opts.productName) {
    const short =
      opts.productName.length > 48
        ? `${opts.productName.slice(0, 45)}…`
        : opts.productName;
    pushUnique(crumbs, { label: short });
  }

  return crumbs;
}
