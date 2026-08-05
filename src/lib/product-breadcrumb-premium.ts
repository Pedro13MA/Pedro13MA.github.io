/**
 * Breadcrumbs de produto — Explorar + taxonomia humana.
 * Sem nome do produto, sem "Other", sem arrays JSON.
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
  desktop: "Desktops",
  smartphone: "Smartphones",
  smartphones: "Smartphones",
  telemoveis: "Telemóveis",
  telemóveis: "Telemóveis",
  monitor: "Monitores",
  monitores: "Monitores",
  motherboard: "Motherboards",
  motherboards: "Motherboards",
  informatica: "Informática",
  informática: "Informática",
  componentes: "Componentes",
  computadores: "Computadores",
  perifericos: "Periféricos",
  armazenamento: "Armazenamento",
  redes: "Redes",
  impressao: "Impressão",
  gaming: "Gaming",
  jogos: "Jogos",
  consoles: "Consolas",
  console: "Consolas",
  game_physical: "Jogos",
  game_digital: "Jogos digitais",
  controller: "Comandos",
  mouse: "Ratos",
  keyboard: "Teclados",
  tablet: "Tablets",
  smartwatch: "Smartwatches",
  wearables: "Wearables",
  headphones: "Auscultadores",
  tv: "TVs",
  tv_audio: "TV e Áudio",
  casa: "Casa",
  fridge: "Frigoríficos",
  dishwasher: "Máquinas de Lavar Loiça",
  washing_machine: "Máquinas de Lavar",
  vacuum: "Aspiradores",
  fotografia: "Fotografia",
  camera: "Câmaras",
  tech: "Tech",
};

function slugLabel(slug: string): string {
  const key = slug
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
  return (
    LEAF_LABEL[key] ||
    slug.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function looksLikeJsonJunk(s: string): boolean {
  const t = s.trim();
  return (
    t.startsWith("[") ||
    t.startsWith("{") ||
    t.includes('","') ||
    /^["']/.test(t)
  );
}

/** Aceita string, JSON array, ou array runtime. */
export function normalizeTaxonomyParts(
  raw: string | string[] | null | undefined,
): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    return raw.map((p) => String(p).trim()).filter(Boolean);
  }
  const s = String(raw).trim();
  if (!s) return [];

  if (s.startsWith("[")) {
    try {
      const parsed = JSON.parse(s) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((p) => String(p).trim()).filter(Boolean);
      }
    } catch {
      /* fallback abaixo */
    }
  }

  return s
    .split(/[/>|,]/)
    .map((p) => p.trim().replace(/^["'\[\]]+|["'\[\]]+$/g, ""))
    .filter(Boolean)
    .filter((p) => !looksLikeJsonJunk(p));
}

function pushUnique(crumbs: BreadcrumbCrumb[], crumb: BreadcrumbCrumb) {
  if (isOtherLabel(crumb.label)) return;
  if (looksLikeJsonJunk(crumb.label)) return;
  const last = crumbs[crumbs.length - 1];
  if (last && last.label.toLowerCase() === crumb.label.toLowerCase()) return;
  crumbs.push(crumb);
}

export function buildPremiumProductBreadcrumbs(opts: {
  category?: string | null;
  subcategory?: string | null;
  subcategoryLabel?: string | null;
  leafId?: string | null;
  taxonomyPath?: string | string[] | null;
  brand?: string | null;
  productName?: string | null;
  chipsetModel?: string | null;
}): BreadcrumbCrumb[] {
  const crumbs: BreadcrumbCrumb[] = [
    { label: "Explorar", href: "/catalog/" },
  ];

  const parts = normalizeTaxonomyParts(opts.taxonomyPath);
  if (parts.length) {
    for (const part of parts) {
      if (isOtherLabel(part)) continue;
      const slug = part.toLowerCase().replace(/\s+/g, "_");
      pushUnique(crumbs, {
        label: slugLabel(slug),
        href: `/categoria/${encodeURIComponent(slug)}/`,
      });
    }
  } else {
    // Sem taxonomy_path: leaf_id antes de subcategory legacy
    if (opts.leafId) {
      const leaf = opts.leafId.toLowerCase().replace(/\s+/g, "_");
      const unusable = /^(unclassified|non_catalog|unmapped)$/i;
      if (!unusable.test(leaf)) {
        pushUnique(crumbs, {
          label: slugLabel(opts.leafId),
          href: `/categoria/${encodeURIComponent(opts.leafId)}/`,
        });
      }
    }
    if (crumbs.length <= 1) {
      const legacy = buildProductBreadcrumbs({
        category: opts.category,
        subcategory: opts.subcategory,
        subcategoryLabel: opts.subcategoryLabel,
      });
      for (const c of legacy) {
        if (isOtherLabel(c.label)) continue;
        const slugGuess = (opts.leafId || opts.subcategory || "")
          .toLowerCase()
          .replace(/\s+/g, "_");
        pushUnique(crumbs, {
          label: c.label,
          href: slugGuess
            ? `/categoria/${encodeURIComponent(slugGuess)}/`
            : c.href,
        });
      }
    }
  }

  return crumbs;
}
