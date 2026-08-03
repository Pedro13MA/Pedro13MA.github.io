/**
 * Extracção conservadora de atributos tipados — sem parsers de nome.
 */

import { parseTypedAttributes } from "@/lib/product-content";
import type { Project, ProjectProductSnap } from "@/lib/projects/types";

export function attrsFromSnap(
  product: ProjectProductSnap | null | undefined,
): Record<string, unknown> {
  if (!product) return {};
  const typed = parseTypedAttributes(product.typedAttributes);
  // Campos de catálogo já tipados no snap (não inventados)
  if (product.chipsetModel && typed.chipset == null) {
    typed.chipset = product.chipsetModel;
  }
  if (product.brand && typed.brand == null) {
    typed.brand = product.brand;
  }
  return typed;
}

export function attrStr(
  attrs: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const k of keys) {
    const v = attrs[k];
    if (v == null) continue;
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
    if (typeof v === "boolean") return v ? "true" : "false";
  }
  return null;
}

export function attrNum(
  attrs: Record<string, unknown>,
  ...keys: string[]
): number | null {
  for (const k of keys) {
    const v = attrs[k];
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
      const m = v.replace(",", ".").match(/-?\d+(\.\d+)?/);
      if (m) return Number(m[0]);
    }
  }
  return null;
}

export function normalizeSocket(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw.toUpperCase().replace(/\s+/g, "");
  if (!s) return null;
  return s;
}

/** Contexto a partir do Project (frontend). */
export function projectToCompatContext(project: Project) {
  return {
    templateId: project.templateId,
    slots: project.slots.map((s) => {
      const attrs = attrsFromSnap(s.product);
      return {
        slotId: s.slotId,
        label: s.label,
        leafId: s.product?.leafId || null,
        brand: s.product?.brand || null,
        chipsetModel: s.product?.chipsetModel || null,
        name: s.product?.name || null,
        attrs,
        empty: !s.product,
      };
    }),
  };
}
