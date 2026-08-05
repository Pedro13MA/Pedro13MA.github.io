/**
 * FASE 7.7 — helpers UI do Catálogo (apenas frontend).
 */

export type CatalogConditionId =
  | "NEW"
  | "OPEN_BOX"
  | "OUTLET"
  | "REFURBISHED"
  | "USED";

export const CATALOG_CONDITIONS: {
  id: CatalogConditionId;
  label: string;
}[] = [
  { id: "NEW", label: "Novo" },
  { id: "OPEN_BOX", label: "Caixa Aberta" },
  { id: "OUTLET", label: "Outlet" },
  { id: "REFURBISHED", label: "Recondicionado" },
  { id: "USED", label: "Usado" },
];

/** Mapeia pills antigas → slug taxonomy. */
export const LEGACY_CATALOG_CATEGORY: Record<string, string> = {
  eletrodomesticos: "casa",
  audio: "tv_audio",
  gaming: "gaming",
  informatica: "informatica",
};

const SECTION_STORAGE = "lymiar.catalog.section.";

export function readCatalogSectionOpen(
  sectionId: string,
  fallback = true,
): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(SECTION_STORAGE + sectionId);
    if (raw === null) return fallback;
    return raw === "1";
  } catch {
    return fallback;
  }
}

export function writeCatalogSectionOpen(
  sectionId: string,
  open: boolean,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      SECTION_STORAGE + sectionId,
      open ? "1" : "0",
    );
  } catch {
    /* ignore */
  }
}

export function parseCatalogConditions(
  params: URLSearchParams,
): CatalogConditionId[] {
  const allowed = new Set(CATALOG_CONDITIONS.map((c) => c.id));
  const fromMulti = params.getAll("condition").map((v) => v.toUpperCase());
  const fromCsv = (params.get("conditions") || "")
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);

  // BC: apenas pills antigas exactas `new` / `outlet` (minúsculas)
  const legacyRaw = params.getAll("condition");
  const onlyLegacyPills =
    legacyRaw.length === 1 &&
    (legacyRaw[0] === "new" || legacyRaw[0] === "outlet");
  const legacyMapped: CatalogConditionId[] = [];
  if (onlyLegacyPills) {
    if (legacyRaw[0] === "new") legacyMapped.push("NEW");
    if (legacyRaw[0] === "outlet") {
      legacyMapped.push("OUTLET", "REFURBISHED", "OPEN_BOX");
    }
  }

  const source = onlyLegacyPills
    ? legacyMapped
    : [...fromMulti, ...fromCsv];
  const out: CatalogConditionId[] = [];
  for (const id of source) {
    const up = id.toUpperCase() as CatalogConditionId;
    if (!allowed.has(up)) continue;
    if (!out.includes(up)) out.push(up);
  }
  return out;
}

export function matchesCatalogConditions(
  productCondition: string | undefined,
  selected: CatalogConditionId[],
): boolean {
  if (!selected.length) return true;
  const c = (productCondition || "NEW").toUpperCase();
  return selected.some((id) => id === c);
}

export type CatalogChip = {
  key: string;
  label: string;
  /** Remove este chip. */
  onRemove: () => void;
};
