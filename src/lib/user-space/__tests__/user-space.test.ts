/**
 * FASE 7.9 — user-space local storage service.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocalStorageAdapter } from "@/lib/user-space/local-storage-adapter";
import {
  createList,
  getFavorites,
  isFavorite,
  setUserSpaceAdapter,
  upsertAlert,
  upsertFavoriteInLists,
} from "@/lib/user-space";
import { SYSTEM_FAVORITES_LIST_ID } from "@/lib/user-space/types";

const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
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
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  setUserSpaceAdapter(new LocalStorageAdapter());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("user-space", () => {
  it("guarda favorito na lista sistema", async () => {
    await upsertFavoriteInLists(
      {
        slug: "rtx-5070",
        ean: "1",
        name: "RTX 5070",
        currentPrice: 649,
        limiarIndex: 88,
      },
      [SYSTEM_FAVORITES_LIST_ID],
    );
    expect(await isFavorite("rtx-5070")).toBe(true);
    const favs = await getFavorites();
    expect(favs).toHaveLength(1);
    expect(favs[0].name).toBe("RTX 5070");
  });

  it("cria lista e associa produto a várias", async () => {
    const list = await createList("PC Gaming");
    await upsertFavoriteInLists(
      {
        slug: "gpu-a",
        ean: "2",
        name: "GPU A",
        currentPrice: 500,
        limiarIndex: 70,
      },
      [SYSTEM_FAVORITES_LIST_ID, list.id],
    );
    const favs = await getFavorites();
    expect(favs[0].listIds).toContain(list.id);
    expect(favs[0].listIds).toContain(SYSTEM_FAVORITES_LIST_ID);
  });

  it("cria alerta price_below", async () => {
    const rule = await upsertAlert({
      slug: "gpu-a",
      ean: "2",
      productName: "GPU A",
      kind: "price_below",
      priceTarget: 400,
      stores: "all",
      conditions: ["NEW"],
      active: true,
    });
    expect(rule.id).toBeTruthy();
    expect(rule.priceTarget).toBe(400);
  });
});
