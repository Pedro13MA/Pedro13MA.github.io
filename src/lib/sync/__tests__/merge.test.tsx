/**
 * FASE 8.1 — merge choices.
 */

import { describe, it, expect } from "vitest";
import { mergeUserspace, mergeProjects, mergeCart } from "@/lib/sync/merge";
import { DEFAULT_LISTS } from "@/lib/user-space/types";

describe("merge choices", () => {
  const localUs = {
    version: 1,
    favorites: [
      {
        slug: "only-local",
        ean: "1",
        name: "L",
        currentPrice: 1,
        limiarIndex: 1,
        listIds: ["favorites"],
        savedAt: 1,
        updatedAt: 1,
      },
    ],
    lists: DEFAULT_LISTS,
    alerts: [],
    notificationTargets: [],
  };
  const cloudUs = {
    version: 1,
    favorites: [
      {
        slug: "only-cloud",
        ean: "2",
        name: "C",
        currentPrice: 2,
        limiarIndex: 2,
        listIds: ["favorites"],
        savedAt: 1,
        updatedAt: 1,
      },
    ],
    lists: DEFAULT_LISTS,
    alerts: [],
    notificationTargets: [],
  };

  it("replace_cloud", () => {
    expect(mergeUserspace(localUs, cloudUs, "replace_cloud").favorites[0]?.slug).toBe(
      "only-local",
    );
  });

  it("ignore_local", () => {
    expect(mergeUserspace(localUs, cloudUs, "ignore_local").favorites[0]?.slug).toBe(
      "only-cloud",
    );
  });

  it("keep_both", () => {
    const slugs = mergeUserspace(localUs, cloudUs, "keep_both").favorites.map(
      (f) => f.slug,
    );
    expect(slugs.sort()).toEqual(["only-cloud", "only-local"]);
  });

  it("projects keep_both", () => {
    const local = {
      version: 1 as const,
      projects: [
        {
          id: "p1",
          name: "L",
          description: "",
          templateId: "blank" as const,
          slots: [{ slotId: "a", label: "A", product: null, selected: true }],
          status: "active" as const,
          createdAt: 1,
          updatedAt: 2,
          initialTotal: 0,
          priceHistory: [],
          compatibilityVersion: 0 as const,
        },
      ],
    };
    const cloud = {
      version: 1 as const,
      projects: [
        {
          id: "p1",
          name: "C",
          description: "",
          templateId: "blank" as const,
          slots: [
            {
              slotId: "b",
              label: "B",
              product: { slug: "x" } as never,
              selected: true,
            },
          ],
          status: "active" as const,
          createdAt: 1,
          updatedAt: 1,
          initialTotal: 0,
          priceHistory: [],
          compatibilityVersion: 0 as const,
        },
      ],
    };
    const m = mergeProjects(local, cloud, "keep_both");
    expect(m.projects[0]?.slots?.length).toBeGreaterThanOrEqual(2);
  });

  it("cart keep_both configs", () => {
    const local = {
      version: 1 as const,
      activeConfigId: "l",
      configs: [
        {
          id: "l",
          name: "L",
          kind: "generic" as const,
          items: [],
          createdAt: 1,
          updatedAt: 5,
        },
      ],
      alerts: [],
    };
    const cloud = {
      version: 1 as const,
      activeConfigId: "c",
      configs: [
        {
          id: "c",
          name: "C",
          kind: "generic" as const,
          items: [],
          createdAt: 1,
          updatedAt: 1,
        },
      ],
      alerts: [],
    };
    const m = mergeCart(local, cloud, "keep_both");
    expect(m.configs.map((c) => c.id).sort()).toEqual(["c", "l"]);
  });
});
