/**
 * FASE 7.7 — helpers Catálogo UI.
 */

import { describe, expect, it } from "vitest";
import {
  LEGACY_CATALOG_CATEGORY,
  matchesCatalogConditions,
  parseCatalogConditions,
} from "@/lib/catalog-ui";

describe("catalog-ui", () => {
  it("parseCatalogConditions — multi NEW/OUTLET", () => {
    const p = new URLSearchParams();
    p.append("condition", "NEW");
    p.append("condition", "OUTLET");
    expect(parseCatalogConditions(p)).toEqual(["NEW", "OUTLET"]);
  });

  it("parseCatalogConditions — legacy pill outlet expands", () => {
    const p = new URLSearchParams({ condition: "outlet" });
    expect(parseCatalogConditions(p)).toEqual([
      "OUTLET",
      "REFURBISHED",
      "OPEN_BOX",
    ]);
  });

  it("parseCatalogConditions — OUTLET enum does not expand", () => {
    const p = new URLSearchParams({ condition: "OUTLET" });
    expect(parseCatalogConditions(p)).toEqual(["OUTLET"]);
  });

  it("matchesCatalogConditions", () => {
    expect(matchesCatalogConditions("NEW", [])).toBe(true);
    expect(matchesCatalogConditions("NEW", ["NEW"])).toBe(true);
    expect(matchesCatalogConditions("NEW", ["OUTLET"])).toBe(false);
    expect(matchesCatalogConditions(undefined, ["NEW"])).toBe(true);
  });

  it("LEGACY_CATALOG_CATEGORY maps old pills", () => {
    expect(LEGACY_CATALOG_CATEGORY.audio).toBe("tv_audio");
    expect(LEGACY_CATALOG_CATEGORY.eletrodomesticos).toBe("casa");
  });
});
