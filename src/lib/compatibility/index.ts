/**
 * FASE 7.14 — CompatibilityEngine (genérica, só aconselha).
 */

import { projectToCompatContext } from "@/lib/compatibility/attrs";
import { getProviderForTemplate } from "@/lib/compatibility/providers";
import type {
  CompatStatus,
  ProjectCompatResult,
  SlotCompatResult,
} from "@/lib/compatibility/types";
import type { Project } from "@/lib/projects/types";

function rankStatus(slots: SlotCompatResult[]): CompatStatus {
  if (slots.some((s) => s.status === "incompatible")) return "incompatible";
  if (slots.some((s) => s.status === "warning")) return "warning";
  const filled = slots.filter((s) => s.status !== "empty");
  if (!filled.length) return "unknown";
  if (filled.every((s) => s.status === "compatible")) return "compatible";
  if (filled.every((s) => s.status === "compatible" || s.status === "unknown")) {
    return "unknown";
  }
  return "unknown";
}

function overallScore(slots: SlotCompatResult[]): number {
  const scored = slots.filter(
    (s) => s.status !== "empty" && s.score != null,
  ) as Array<SlotCompatResult & { score: number }>;
  if (!scored.length) return 0;
  const sum = scored.reduce((a, s) => a + s.score, 0);
  return Math.round(sum / scored.length);
}

/**
 * Avalia um projeto. Sem provider → todos Desconhecido (não bloqueia).
 */
export function evaluateProjectCompatibility(
  project: Project,
): ProjectCompatResult {
  const ctx = projectToCompatContext(project);
  const provider = getProviderForTemplate(project.templateId);

  let slots: SlotCompatResult[];
  if (!provider) {
    slots = project.slots.map((s) => ({
      slotId: s.slotId,
      label: s.label,
      status: s.product ? ("unknown" as const) : ("empty" as const),
      score: s.product ? 80 : null,
      warnings: s.product
        ? [
            "Sem regras de compatibilidade para este template (preparado para FASE futura).",
          ]
        : [],
      errors: [],
      suggestions: [],
      issues: [],
    }));
  } else {
    slots = provider.evaluate(ctx);
  }

  const counts = {
    compatible: slots.filter((s) => s.status === "compatible").length,
    warning: slots.filter((s) => s.status === "warning").length,
    incompatible: slots.filter((s) => s.status === "incompatible").length,
    unknown: slots.filter((s) => s.status === "unknown").length,
    empty: slots.filter((s) => s.status === "empty").length,
  };

  return {
    templateId: project.templateId,
    providerId: provider?.id || null,
    overallScore: overallScore(slots),
    status: rankStatus(slots),
    slots,
    counts,
  };
}

export {
  registerCompatibilityProvider,
  listCompatibilityProviders,
  getProviderForTemplate,
} from "@/lib/compatibility/providers";
export type {
  CompatStatus,
  ProjectCompatResult,
  SlotCompatResult,
  CompatibilityRuleProvider,
} from "@/lib/compatibility/types";
