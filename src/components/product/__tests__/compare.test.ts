/**
 * FASE 7.8 — comparação localStorage.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addToCompare,
  clearCompare,
  COMPARE_MAX,
  readCompareList,
  removeFromCompare,
} from "@/lib/compare";

afterEach(() => {
  clearCompare();
  vi.unstubAllGlobals();
});

describe("compare", () => {
  it("adds up to 4 products", () => {
    const store: Record<string, string> = {};
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
          store[k] = v;
        },
        removeItem: (k: string) => {
          delete store[k];
        },
      },
      dispatchEvent: () => true,
    });

    for (let i = 0; i < COMPARE_MAX; i++) {
      const res = addToCompare({
        slug: `p-${i}`,
        ean: String(i),
        name: `Product ${i}`,
        currentPrice: 100 + i,
        limiarIndex: 50,
      });
      expect(res.ok).toBe(true);
    }
    const full = addToCompare({
      slug: "extra",
      ean: "x",
      name: "Extra",
      currentPrice: 1,
      limiarIndex: 1,
    });
    expect(full.ok).toBe(false);
    expect(full.reason).toBe("full");
    expect(readCompareList()).toHaveLength(4);

    removeFromCompare("p-0");
    expect(readCompareList()).toHaveLength(3);
  });
});
