/**
 * FASE 7.14 — Compatibility Engine.
 */

import { describe, expect, it } from "vitest";
import { evaluateProjectCompatibility } from "@/lib/compatibility";
import type { Project, ProjectSlot } from "@/lib/projects/types";

function slot(
  slotId: string,
  label: string,
  product: ProjectSlot["product"],
): ProjectSlot {
  return { slotId, label, product, selected: true };
}

function project(slots: ProjectSlot[]): Project {
  return {
    id: "p1",
    name: "Test",
    description: "",
    templateId: "pc_gaming",
    slots,
    status: "active",
    createdAt: 1,
    updatedAt: 1,
    initialTotal: 0,
    priceHistory: [],
    compatibilityVersion: 1,
  };
}

function snap(
  over: Partial<NonNullable<ProjectSlot["product"]>> & {
    slug: string;
    typedAttributes?: Record<string, unknown> | null;
  },
): NonNullable<ProjectSlot["product"]> {
  return {
    ean: over.slug,
    name: over.name || over.slug,
    currentPrice: 100,
    priceAtAdd: 100,
    lymiarIndex: 80,
    offers: [],
    ...over,
  };
}

describe("compatibility engine", () => {
  it("CPU + MB same socket → compatible", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "cpu",
          "CPU",
          snap({
            slug: "cpu1",
            typedAttributes: { socket: "AM5", brand: "AMD" },
          }),
        ),
        slot(
          "motherboard",
          "MB",
          snap({
            slug: "mb1",
            typedAttributes: { socket: "AM5", chipset: "B650" },
          }),
        ),
      ]),
    );
    expect(r.slots.find((s) => s.slotId === "cpu")?.status).toBe("compatible");
    expect(r.slots.find((s) => s.slotId === "motherboard")?.status).toBe(
      "compatible",
    );
    expect(r.overallScore).toBeGreaterThan(70);
  });

  it("socket incompatível", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "cpu",
          "CPU",
          snap({ slug: "c", typedAttributes: { socket: "AM5" } }),
        ),
        slot(
          "motherboard",
          "MB",
          snap({ slug: "m", typedAttributes: { socket: "LGA1700" } }),
        ),
      ]),
    );
    expect(r.slots.find((s) => s.slotId === "cpu")?.status).toBe(
      "incompatible",
    );
    expect(r.status).toBe("incompatible");
    expect(r.counts.incompatible).toBeGreaterThanOrEqual(1);
  });

  it("DDR4 vs DDR5 → Desconhecido (sem dados tipados)", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "ram",
          "RAM",
          snap({ slug: "r", typedAttributes: { brand: "Corsair" } }),
        ),
        slot(
          "motherboard",
          "MB",
          snap({ slug: "m", typedAttributes: { brand: "MSI" } }),
        ),
      ]),
    );
    expect(r.slots.find((s) => s.slotId === "ram")?.status).toBe("unknown");
    expect(
      r.slots
        .find((s) => s.slotId === "ram")
        ?.warnings.some((w) => /DDR/i.test(w)),
    ).toBe(true);
  });

  it("fonte sem wattage / sem TDP → Desconhecido, não inventa insuficiente", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "psu",
          "Fonte",
          snap({ slug: "p", typedAttributes: { brand: "Corsair" } }),
        ),
        slot(
          "gpu",
          "GPU",
          snap({
            slug: "g",
            typedAttributes: { chipset: "RTX 5070", vram_gb: 12 },
          }),
        ),
      ]),
    );
    const psu = r.slots.find((s) => s.slotId === "psu")!;
    expect(psu.status).toBe("unknown");
    expect(psu.errors.join(" ")).not.toMatch(/insuficiente/i);
  });

  it("GPU demasiado grande → Desconhecido (sem comprimento tipado)", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "gpu",
          "GPU",
          snap({
            slug: "g",
            typedAttributes: { chipset: "RTX 5090", vram_gb: 24 },
          }),
        ),
        slot(
          "case",
          "Caixa",
          snap({ slug: "c", typedAttributes: { brand: "Fractal" } }),
        ),
      ]),
    );
    expect(r.slots.find((s) => s.slotId === "gpu")?.status).toBe("unknown");
    expect(r.slots.find((s) => s.slotId === "case")?.status).toBe("unknown");
  });

  it("cooler incompatível quando sockets tipados diferem", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "cpu",
          "CPU",
          snap({ slug: "c", typedAttributes: { socket: "AM5" } }),
        ),
        slot(
          "cooler",
          "Cooler",
          snap({ slug: "k", typedAttributes: { socket: "LGA1700" } }),
        ),
      ]),
    );
    expect(r.slots.find((s) => s.slotId === "cooler")?.status).toBe(
      "incompatible",
    );
  });

  it("SSD NVMe via form_factor", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "ssd",
          "SSD",
          snap({
            slug: "s",
            typedAttributes: {
              form_factor: "M.2 NVMe",
              pcie_generation: "Gen4",
            },
          }),
        ),
      ]),
    );
    const ssd = r.slots.find((s) => s.slotId === "ssd")!;
    expect(ssd.status).toBe("compatible");
    expect(ssd.suggestions.join(" ")).toMatch(/NVMe|M\.2/i);
  });

  it("dados desconhecidos não baixam a incompatible", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "cpu",
          "CPU",
          snap({ slug: "c", typedAttributes: { brand: "AMD" } }),
        ),
      ]),
    );
    expect(r.slots.find((s) => s.slotId === "cpu")?.status).toBe("unknown");
    expect(r.status).not.toBe("incompatible");
  });

  it("templates sem provider → unknown, não bloqueia", () => {
    const r = evaluateProjectCompatibility({
      ...project([]),
      templateId: "nas",
      slots: [
        slot(
          "nas_unit",
          "NAS",
          snap({ slug: "n", typedAttributes: { brand: "Synology" } }),
        ),
      ],
    });
    expect(r.providerId).toBeNull();
    expect(r.slots[0].status).toBe("unknown");
  });

  it("resumo e score", () => {
    const r = evaluateProjectCompatibility(
      project([
        slot(
          "ssd",
          "SSD",
          snap({
            slug: "s",
            typedAttributes: { form_factor: "SATA" },
          }),
        ),
        slot("gpu", "GPU", null),
      ]),
    );
    expect(r.counts.empty).toBeGreaterThanOrEqual(1);
    expect(r.overallScore).toBeGreaterThan(0);
    expect(typeof r.overallScore).toBe("number");
  });
});
