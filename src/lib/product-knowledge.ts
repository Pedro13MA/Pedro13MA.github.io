/**
 * FASE 7.15 — Product Knowledge (cliente).
 * Prefere `product.knowledge` da API; fallback factual a partir de typed_attributes.
 * Sem IA / sem inventar.
 */

import { buildSpecRows, parseTypedAttributes } from "@/lib/product-content";
import type { Product } from "@/lib/types";

export type KnowledgeItem = {
  key: string;
  label: string;
  value: string;
  source?: string;
};

export type KnowledgeGroup = {
  id: string;
  label: string;
  items: KnowledgeItem[];
};

export type ProductKnowledge = {
  leaf?: string | null;
  attributes: Record<string, unknown>;
  groups: KnowledgeGroup[];
  sources?: Record<string, string>;
  completeness: number;
};

const GROUP_KEYS: Record<string, string[]> = {
  identidade: ["brand", "series", "model", "chipset"],
  processador: ["socket", "cores", "threads", "base_mhz", "boost_mhz", "tdp_w"],
  memoria: [
    "vram_gb",
    "memory_type",
    "ram_type",
    "ram_gb",
    "capacity_gb",
    "speed_mhz",
  ],
  video: [
    "chipset",
    "vram_gb",
    "ray_tracing",
    "dlss",
    "gpu",
    "panel",
    "resolution",
    "refresh_rate",
    "screen_size",
    "hdr",
    "adaptive_sync",
  ],
  armazenamento: [
    "capacity_gb",
    "interface",
    "nvme",
    "form_factor",
    "read_mb_s",
    "write_mb_s",
    "pcie",
  ],
  conectividade: ["wifi", "bluetooth", "pcie", "esim"],
  energia: ["tdp_w", "wattage", "efficiency", "battery_mah", "wireless_charge"],
  dimensoes: ["length_mm", "form_factor", "screen_size"],
};

const GROUP_LABELS: Record<string, string> = {
  identidade: "Identidade",
  processador: "Processador",
  memoria: "Memória",
  video: "Vídeo / Ecrã",
  armazenamento: "Armazenamento",
  conectividade: "Conectividade",
  energia: "Energia",
  dimensoes: "Dimensões / Formato",
  outros: "Outros",
};

/** Chaves esperadas por leaf — alinhado com hub ProductKnowledgeService. */
export const EXPECTED_BY_LEAF: Record<string, string[]> = {
  gpu: ["brand", "chipset", "vram_gb", "pcie", "tdp_w", "memory_type"],
  cpu: ["brand", "socket", "cores", "threads", "tdp_w", "series"],
  motherboard: ["brand", "socket", "chipset", "ram_type", "form_factor"],
  ssd: ["brand", "capacity_gb", "interface", "form_factor", "pcie"],
  ram: ["brand", "ram_type", "capacity_gb", "speed_mhz"],
  monitor: ["brand", "screen_size", "resolution", "refresh_rate", "panel"],
  smartphone: ["brand", "screen_size", "ram_gb", "capacity_gb", "battery_mah"],
  laptop: ["brand", "ram_gb", "screen_size", "series"],
  tv: ["brand", "screen_size", "resolution", "panel"],
  psu: ["brand", "wattage", "efficiency"],
};

export function leafFromProduct(product: Product): string {
  const raw = (product.leafId || product.subcategory || "").toLowerCase().trim();
  const aliases: Record<string, string> = {
    fonte: "psu",
    graphics: "gpu",
    processor: "cpu",
    phone: "smartphone",
    notebook: "laptop",
  };
  return aliases[raw] || raw;
}

export function scoreKnowledgeCompleteness(
  attributes: Record<string, unknown>,
  leaf: string,
): number {
  const expected = EXPECTED_BY_LEAF[leaf] || ["brand"];
  const present = expected.filter((k) => attributes[k] != null && attributes[k] !== "").length;
  return Math.round((100 * present) / Math.max(expected.length, 1));
}

function groupFromSpecRows(product: Product): ProductKnowledge {
  const rows = buildSpecRows(product);
  const attrs = parseTypedAttributes(product.typedAttributes);
  const leaf = leafFromProduct(product);
  const used = new Set<string>();
  const groups: KnowledgeGroup[] = [];

  for (const [gid, keys] of Object.entries(GROUP_KEYS)) {
    const items: KnowledgeItem[] = [];
    for (const key of keys) {
      if (used.has(key)) continue;
      const hit = rows.find((r) => r.key === key);
      if (!hit) continue;
      items.push({
        key: hit.key,
        label: hit.label,
        value: hit.value,
        source: "typed_attributes",
      });
      used.add(key);
    }
    if (items.length) {
      groups.push({
        id: gid,
        label: GROUP_LABELS[gid] || gid,
        items,
      });
    }
  }

  const rest = rows.filter((r) => !used.has(r.key));
  if (rest.length) {
    groups.push({
      id: "outros",
      label: GROUP_LABELS.outros,
      items: rest.map((r) => ({
        key: r.key,
        label: r.label,
        value: r.value,
        source: "typed_attributes",
      })),
    });
  }

  const attributes: Record<string, unknown> = { ...attrs };
  for (const r of rows) {
    if (!(r.key in attributes)) attributes[r.key] = r.value;
  }

  return {
    leaf: leaf || null,
    attributes,
    groups,
    completeness: scoreKnowledgeCompleteness(attributes, leaf),
  };
}

/** Resolve knowledge: API primeiro, senão agrupamento local factual. */
export function resolveProductKnowledge(product: Product): ProductKnowledge | null {
  const api = product.knowledge;
  if (api && Array.isArray(api.groups) && api.groups.length) {
    return {
      leaf: api.leaf ?? leafFromProduct(product),
      attributes: api.attributes || {},
      groups: api.groups as KnowledgeGroup[],
      sources: api.sources,
      completeness:
        typeof product.knowledgeCompleteness === "number"
          ? product.knowledgeCompleteness
          : typeof api.completeness === "number"
            ? api.completeness
            : scoreKnowledgeCompleteness(api.attributes || {}, leafFromProduct(product)),
    };
  }
  const local = groupFromSpecRows(product);
  if (!local.groups.length) return null;
  return local;
}

/** Specs suficientes para JSON-LD AdditionalProperty (≥3 atributos). */
export function knowledgeForJsonLd(
  product: Product,
): Array<{ name: string; value: string }> {
  const k = resolveProductKnowledge(product);
  if (!k || k.completeness < 40) return [];
  const out: Array<{ name: string; value: string }> = [];
  for (const g of k.groups) {
    for (const item of g.items) {
      out.push({ name: item.label, value: item.value });
    }
  }
  return out.length >= 3 ? out : [];
}

/** Chips curtos para enriquecer sugestões de projetos (sem regras de compat). */
export function knowledgeSuggestionChips(
  product: Product,
  max = 4,
): string[] {
  const k = resolveProductKnowledge(product);
  if (!k) return [];
  const chips: string[] = [];
  for (const g of k.groups) {
    for (const item of g.items) {
      if (item.key === "brand") continue;
      chips.push(`${item.label}: ${item.value}`);
      if (chips.length >= max) return chips;
    }
  }
  return chips;
}

export function compareGroupIdForSpecKey(key: string): string {
  for (const [gid, keys] of Object.entries(GROUP_KEYS)) {
    if (keys.includes(key)) return gid;
  }
  return "outros";
}

export function compareGroupLabel(groupId: string): string {
  return GROUP_LABELS[groupId] || groupId;
}
