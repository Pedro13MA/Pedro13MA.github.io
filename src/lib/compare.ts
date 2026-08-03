/**
 * FASE 7.11 — comparação VS (localStorage, até 4, deep-link).
 */

import type { Product } from "@/lib/types";

export type CompareItem = {
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  currentPrice: number;
  limiarIndex: number;
  leafId?: string | null;
  chipsetModel?: string | null;
  vramSpec?: string | null;
  category?: string;
  addedAt: number;
};

const STORAGE_KEY = "limiar.compare.v1";
const MAX = 4;

export function readCompareList(): CompareItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x === "object" && typeof (x as CompareItem).slug === "string")
      .slice(0, MAX) as CompareItem[];
  } catch {
    return [];
  }
}

export function writeCompareList(items: CompareItem[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent("limiar:compare-changed"));
  } catch {
    /* ignore */
  }
}

export function isInCompare(slug: string): boolean {
  return readCompareList().some((i) => i.slug === slug);
}

export function addToCompare(item: Omit<CompareItem, "addedAt">): {
  ok: boolean;
  list: CompareItem[];
  reason?: "full" | "duplicate";
} {
  const list = readCompareList();
  if (list.some((i) => i.slug === item.slug || (item.ean && i.ean === item.ean))) {
    return { ok: false, list, reason: "duplicate" };
  }
  if (list.length >= MAX) {
    return { ok: false, list, reason: "full" };
  }
  const next = [...list, { ...item, addedAt: Date.now() }];
  writeCompareList(next);
  return { ok: true, list: next };
}

export function removeFromCompare(slug: string): CompareItem[] {
  const next = readCompareList().filter((i) => i.slug !== slug);
  writeCompareList(next);
  return next;
}

export function clearCompare(): void {
  writeCompareList([]);
}

export function productToCompareItem(product: Product): Omit<CompareItem, "addedAt"> {
  return {
    slug: product.slug,
    ean: product.ean,
    name: product.name,
    brand: product.brand,
    imageUrl: product.imageUrl,
    currentPrice: product.currentPrice,
    limiarIndex: product.decision.limiarIndex.value,
    leafId: product.leafId,
    chipsetModel: product.chipsetModel,
    vramSpec: product.vramSpec,
    category: product.category,
  };
}

/** Parse `/comparar?ids=a,b,c` */
export function parseCompareIdsParam(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX);
}

export function compareIdsToParam(slugs: string[]): string {
  return slugs.filter(Boolean).slice(0, MAX).join(",");
}

export function buildCompareShareUrl(slugs: string[], origin?: string): string {
  const base =
    origin ||
    (typeof window !== "undefined" ? window.location.origin : "https://pedro13ma.github.io");
  const ids = compareIdsToParam(slugs);
  const path = ids ? `/comparar/?ids=${encodeURIComponent(ids)}` : "/comparar/";
  return `${base.replace(/\/$/, "")}${path}`;
}

export const COMPARE_MAX = MAX;
