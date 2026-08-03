/**
 * FASE 7.14 — PC Gaming rules (só com typed_attributes reais).
 * Ver taxonomy-fase714-typed-attributes-audit.md
 */

import {
  attrNum,
  attrStr,
  normalizeSocket,
} from "@/lib/compatibility/attrs";
import type {
  CompatibilityRuleProvider,
  CompatRuleContext,
  CompatStatus,
  SlotCompatResult,
} from "@/lib/compatibility/types";

function baseSlot(
  slotId: string,
  label: string,
  status: CompatStatus,
  score: number | null,
  extra?: Partial<SlotCompatResult>,
): SlotCompatResult {
  return {
    slotId,
    label,
    status,
    score,
    warnings: extra?.warnings || [],
    errors: extra?.errors || [],
    suggestions: extra?.suggestions || [],
    issues: extra?.issues || [],
  };
}

function findSlot(ctx: CompatRuleContext, id: string) {
  return ctx.slots.find((s) => s.slotId === id);
}

/**
 * Cobertura auditada:
 * - socket CPU ~33%, MB ~5% → só comparar se ambos existem
 * - RAM sem DDR → unknown
 * - GPU sem length/tdp → unknown para clearance/potência
 * - PSU wattage 25%, sem TDP componentes → não inventar «insuficiente»
 * - cooler/case sem dims/socket → unknown
 * - SSD form_factor bom
 */
export const pcGamingProvider: CompatibilityRuleProvider = {
  id: "pc_gaming_v1",
  templateIds: ["pc_gaming"],

  evaluate(ctx: CompatRuleContext): SlotCompatResult[] {
    const cpu = findSlot(ctx, "cpu");
    const mb = findSlot(ctx, "motherboard");
    const ram = findSlot(ctx, "ram");
    const gpu = findSlot(ctx, "gpu");
    const psu = findSlot(ctx, "psu");
    const caseSlot = findSlot(ctx, "case");
    const cooler = findSlot(ctx, "cooler");
    const ssd = findSlot(ctx, "ssd");

    const cpuSocket =
      cpu && !cpu.empty
        ? normalizeSocket(attrStr(cpu.attrs, "socket"))
        : null;
    const mbSocket =
      mb && !mb.empty
        ? normalizeSocket(attrStr(mb.attrs, "socket"))
        : null;

    const results: SlotCompatResult[] = [];

    // ——— CPU ———
    if (!cpu || cpu.empty) {
      results.push(baseSlot("cpu", cpu?.label || "CPU", "empty", null));
    } else {
      const warnings: string[] = [];
      const errors: string[] = [];
      const suggestions: string[] = [];
      const issues: SlotCompatResult["issues"] = [];
      let status: CompatStatus = "compatible";
      let score = 100;

      if (!cpuSocket) {
        status = "unknown";
        score = 70;
        warnings.push(
          "Socket do CPU desconhecido nos dados tipados (cobertura ~33%).",
        );
        issues.push({
          code: "cpu_socket_unknown",
          message: "Socket ausente",
          severity: "info",
        });
      } else if (mbSocket && cpuSocket !== mbSocket) {
        status = "incompatible";
        score = 10;
        errors.push(
          `Socket do CPU (${cpuSocket}) diferente da motherboard (${mbSocket}).`,
        );
        suggestions.push(
          "Escolha CPU e motherboard com o mesmo socket (dados tipados).",
        );
        issues.push({
          code: "cpu_mb_socket_mismatch",
          message: errors[0],
          severity: "error",
        });
      } else if (mbSocket && cpuSocket === mbSocket) {
        suggestions.push(`Socket ${cpuSocket} alinhado com a motherboard.`);
      }

      results.push(
        baseSlot("cpu", cpu.label, status, score, {
          warnings,
          errors,
          suggestions,
          issues,
        }),
      );
    }

    // ——— Motherboard ———
    if (!mb || mb.empty) {
      results.push(
        baseSlot("motherboard", mb?.label || "Motherboard", "empty", null),
      );
    } else {
      const chipset = attrStr(mb.attrs, "chipset");
      const warnings: string[] = [
        "Tipo de memória (DDR4/DDR5) não está nos typed_attributes — não é possível validar.",
      ];
      const errors: string[] = [];
      const suggestions: string[] = [];
      const issues: SlotCompatResult["issues"] = [];
      let status: CompatStatus = "unknown";
      let score = 75;

      if (!mbSocket) {
        warnings.push(
          "Socket da motherboard desconhecido (cobertura tipada ~5%).",
        );
        issues.push({
          code: "mb_socket_unknown",
          message: "Socket ausente",
          severity: "info",
        });
        score = 70;
      } else if (cpuSocket && mbSocket !== cpuSocket) {
        status = "incompatible";
        score = 10;
        errors.push(
          `Socket da motherboard (${mbSocket}) diferente do CPU (${cpuSocket}).`,
        );
        issues.push({
          code: "mb_cpu_socket_mismatch",
          message: errors[0],
          severity: "error",
        });
      } else if (cpuSocket && mbSocket === cpuSocket) {
        status = "compatible";
        score = 95;
        suggestions.push(`Socket ${mbSocket} alinhado com o CPU.`);
        // DDR ainda unknown — baixa ligeiramente
        warnings.push(
          "Socket OK; DDR da RAM continua Desconhecido (sem atributo tipado).",
        );
        score = 85;
      }

      if (chipset) suggestions.push(`Chipset observado: ${chipset}.`);

      results.push(
        baseSlot("motherboard", mb.label, status, score, {
          warnings,
          errors,
          suggestions,
          issues,
        }),
      );
    }

    // ——— RAM ———
    if (!ram || ram.empty) {
      results.push(baseSlot("ram", ram?.label || "RAM", "empty", null));
    } else {
      results.push(
        baseSlot("ram", ram.label, "unknown", 70, {
          warnings: [
            "RAM só tem brand tipado — DDR, velocidade e capacidade não estão na base.",
          ],
          suggestions: [
            "Confirme DDR4/DDR5 na ficha da loja até a taxonomy enriquecer os atributos.",
          ],
          issues: [
            {
              code: "ram_ddr_unknown",
              message: "Sem DDR tipado",
              severity: "info",
            },
          ],
        }),
      );
    }

    // ——— GPU ———
    if (!gpu || gpu.empty) {
      results.push(baseSlot("gpu", gpu?.label || "GPU", "empty", null));
    } else {
      const vram = attrNum(gpu.attrs, "vram_gb");
      const chipset = attrStr(gpu.attrs, "chipset") || gpu.chipsetModel;
      const pcie = attrStr(gpu.attrs, "pcie_version", "pcie");
      const warnings: string[] = [
        "Comprimento da GPU e TDP não estão tipados — clearance e potência ficam Desconhecido.",
      ];
      const suggestions: string[] = [];
      if (chipset) suggestions.push(`Chipset: ${chipset}.`);
      if (vram != null) suggestions.push(`VRAM tipada: ${vram} GB.`);
      if (!pcie) {
        warnings.push("Interface PCIe quase ausente nos dados (~0,8%).");
      }
      results.push(
        baseSlot("gpu", gpu.label, "unknown", 72, {
          warnings,
          suggestions,
          issues: [
            {
              code: "gpu_dims_unknown",
              message: "Sem comprimento/TDP tipados",
              severity: "info",
            },
          ],
        }),
      );
    }

    // ——— PSU ———
    if (!psu || psu.empty) {
      results.push(baseSlot("psu", psu?.label || "Fonte", "empty", null));
    } else {
      const wattage = attrNum(psu.attrs, "wattage", "power_w");
      if (wattage == null) {
        results.push(
          baseSlot("psu", psu.label, "unknown", 70, {
            warnings: [
              "Wattage tipado ausente (só ~25% das fontes têm este campo).",
            ],
            issues: [
              {
                code: "psu_wattage_unknown",
                message: "Wattage ausente",
                severity: "info",
              },
            ],
          }),
        );
      } else {
        results.push(
          baseSlot("psu", psu.label, "unknown", 75, {
            warnings: [
              `Potência tipada: ${wattage} W — consumo CPU/GPU tipado insuficiente para validar folga.`,
            ],
            suggestions: [
              "Quando existirem TDP tipados, o motor poderá avisar se a fonte for curta.",
            ],
            issues: [
              {
                code: "psu_no_tdp_context",
                message: "Sem TDP dos componentes",
                severity: "info",
              },
            ],
          }),
        );
      }
    }

    // ——— Case ———
    if (!caseSlot || caseSlot.empty) {
      results.push(
        baseSlot("case", caseSlot?.label || "Caixa", "empty", null),
      );
    } else {
      results.push(
        baseSlot("case", caseSlot.label, "unknown", 70, {
          warnings: [
            "Caixas (leaf pc_case) só têm brand tipado — sem ATX/clearance GPU/altura cooler.",
          ],
          issues: [
            {
              code: "case_form_unknown",
              message: "Formato ausente",
              severity: "info",
            },
          ],
        }),
      );
    }

    // ——— Cooler ———
    if (!cooler || cooler.empty) {
      results.push(
        baseSlot("cooler", cooler?.label || "Cooler", "empty", null),
      );
    } else {
      const coolerSocket = normalizeSocket(attrStr(cooler.attrs, "socket"));
      if (coolerSocket && cpuSocket) {
        if (coolerSocket === cpuSocket) {
          results.push(
            baseSlot("cooler", cooler.label, "compatible", 100, {
              suggestions: [`Socket ${coolerSocket} compatível com o CPU.`],
            }),
          );
        } else {
          results.push(
            baseSlot("cooler", cooler.label, "incompatible", 10, {
              errors: [
                `Cooler socket ${coolerSocket} ≠ CPU ${cpuSocket}.`,
              ],
              suggestions: [
                "Escolha um cooler com o mesmo socket tipado do CPU.",
              ],
              issues: [
                {
                  code: "cooler_socket_mismatch",
                  message: "Socket diferente",
                  severity: "error",
                },
              ],
            }),
          );
        }
      } else {
        results.push(
          baseSlot("cooler", cooler.label, "unknown", 70, {
            warnings: [
              "Coolers tipados quase só com brand — socket/altura Desconhecido.",
            ],
            issues: [
              {
                code: "cooler_socket_unknown",
                message: "Socket ausente",
                severity: "info",
              },
            ],
          }),
        );
      }
    }

    // ——— SSD ———
    if (!ssd || ssd.empty) {
      results.push(baseSlot("ssd", ssd?.label || "SSD", "empty", null));
    } else {
      const ff = attrStr(ssd.attrs, "form_factor") || "";
      const pcieGen = attrStr(ssd.attrs, "pcie_generation", "pcie");
      const suggestions: string[] = [];
      const warnings: string[] = [];
      let status: CompatStatus = "compatible";
      let score = 100;

      if (/m\.?2/i.test(ff) || /nvme/i.test(ff)) {
        suggestions.push(`Formato tipado: ${ff || "M.2/NVMe"}.`);
        if (pcieGen) suggestions.push(`PCIe ${pcieGen}.`);
      } else if (/sata/i.test(ff)) {
        suggestions.push(`SSD SATA tipado (${ff}).`);
      } else if (!ff) {
        status = "unknown";
        score = 70;
        warnings.push("form_factor do SSD ausente.");
      } else {
        suggestions.push(`Formato tipado: ${ff}.`);
      }

      results.push(
        baseSlot("ssd", ssd.label, status, score, {
          warnings,
          suggestions,
        }),
      );
    }

    const covered = new Set(results.map((r) => r.slotId));
    for (const s of ctx.slots) {
      if (covered.has(s.slotId)) continue;
      if (s.empty) {
        results.push(baseSlot(s.slotId, s.label, "empty", null));
      } else {
        results.push(
          baseSlot(s.slotId, s.label, "unknown", 80, {
            suggestions: [
              "Sem regras de compatibilidade para este slot neste template.",
            ],
          }),
        );
      }
    }

    return results;
  },
};
