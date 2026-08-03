/**
 * FASE 7.8 — comparação VS (localStorage, até 4 produtos).
 */

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
  if (list.some((i) => i.slug === item.slug || i.ean === item.ean)) {
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

export const COMPARE_MAX = MAX;
