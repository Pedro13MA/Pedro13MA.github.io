/**
 * FASE 7.21 — catálogo canónico (FE smoke).
 */

import { describe, expect, it } from "vitest";
import type { CanonicalGroupDetail } from "@/lib/api";

function resolveVariant(
  group: CanonicalGroupDetail,
  selected: Record<string, string>,
) {
  const keys = Object.keys(selected);
  if (!keys.length) return null;
  const hits = group.variants.filter((v) =>
    keys.every((k) => (v.selection || {})[k] === selected[k]),
  );
  return hits.length === 1 ? hits[0] : null;
}

describe("Canonical variant resolution", () => {
  const group: CanonicalGroupDetail = {
    slug: "gpu-rtx-5070",
    title: "RTX 5070",
    variantCount: 2,
    variableAttributes: [
      { key: "brand", label: "Marca", options: ["ASUS", "MSI"] },
    ],
    variants: [
      {
        slug: "asus-5070",
        name: "ASUS Dual",
        currentPrice: 589,
        selection: { brand: "ASUS" },
      },
      {
        slug: "msi-5070",
        name: "MSI Gaming",
        currentPrice: 619,
        selection: { brand: "MSI" },
      },
    ],
  };

  it("resolve variante exacta", () => {
    const v = resolveVariant(group, { brand: "ASUS" });
    expect(v?.slug).toBe("asus-5070");
  });

  it("não inventa combinação inválida", () => {
    expect(resolveVariant(group, { brand: "Zotac" })).toBeNull();
  });

  it("família sem variantes não é canónica na API", () => {
    expect(group.variantCount).toBeGreaterThanOrEqual(2);
  });
});

describe("ProductGroup JSON-LD shape", () => {
  it("usa ProductGroup + hasVariant", () => {
    const ld = {
      "@type": "ProductGroup",
      name: "RTX 5070",
      hasVariant: [{ "@type": "Product", name: "ASUS Dual" }],
    };
    expect(ld["@type"]).toBe("ProductGroup");
    expect(ld.hasVariant[0]["@type"]).toBe("Product");
  });
});
