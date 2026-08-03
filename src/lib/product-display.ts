/**
 * FASE 7.10 — labels de apresentação (nunca "Other").
 * Só UX; não altera taxonomy nem API.
 */

const OTHER_RE = /^(other|others|outro|outros|unknown|n\/?a|unmapped)$/i;

export function isOtherLabel(value: string | null | undefined): boolean {
  if (!value) return true;
  return OTHER_RE.test(value.trim());
}

/** Categoria / leaf legível — null se for Other ou vazia. */
export function displayCategoryLabel(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const c of candidates) {
    const t = (c || "").trim();
    if (!t || isOtherLabel(t)) continue;
    return t.replace(/_/g, " ");
  }
  return null;
}

export function displayLeafOrBrand(opts: {
  subcategoryLabel?: string | null;
  leafId?: string | null;
  category?: string | null;
  brand?: string | null;
}): string | null {
  const leaf = displayCategoryLabel(
    opts.subcategoryLabel,
    opts.leafId ? opts.leafId.replace(/_/g, " ") : null,
    opts.category,
  );
  if (leaf) return leaf;
  const brand = (opts.brand || "").trim();
  return brand || null;
}

/** Poupança vs média 30d ou vs máximo — só se positiva. */
export function computeSavingsEur(opts: {
  current: number;
  avg30d?: number | null;
  historicalMax?: number | null;
  originalPrice?: number | null;
}): number | null {
  const candidates: number[] = [];
  if (opts.originalPrice != null && opts.originalPrice > opts.current) {
    candidates.push(opts.originalPrice - opts.current);
  }
  if (opts.avg30d != null && opts.avg30d > opts.current) {
    candidates.push(opts.avg30d - opts.current);
  }
  if (opts.historicalMax != null && opts.historicalMax > opts.current) {
    const vsMax = opts.historicalMax - opts.current;
    if (vsMax / Math.max(opts.historicalMax, 1) >= 0.05) candidates.push(vsMax);
  }
  if (!candidates.length) return null;
  return Math.max(...candidates);
}
