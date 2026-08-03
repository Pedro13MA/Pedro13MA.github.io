/**
 * FASE 7.14 — tipos do Compatibility Engine.
 */

export type CompatStatus =
  | "compatible"
  | "warning"
  | "incompatible"
  | "unknown"
  | "empty";

export type CompatIssue = {
  code: string;
  message: string;
  severity: "warning" | "error" | "info";
};

export type SlotCompatResult = {
  slotId: string;
  label: string;
  status: CompatStatus;
  /** 0–100 para este slot (empty = null). */
  score: number | null;
  warnings: string[];
  errors: string[];
  suggestions: string[];
  issues: CompatIssue[];
};

export type ProjectCompatResult = {
  templateId: string;
  providerId: string | null;
  overallScore: number;
  status: CompatStatus;
  slots: SlotCompatResult[];
  counts: {
    compatible: number;
    warning: number;
    incompatible: number;
    unknown: number;
    empty: number;
  };
};

export type CompatRuleContext = {
  templateId: string;
  slots: Array<{
    slotId: string;
    label: string;
    leafId?: string | null;
    brand?: string | null;
    chipsetModel?: string | null;
    name?: string | null;
    attrs: Record<string, unknown>;
    empty: boolean;
  }>;
};

export interface CompatibilityRuleProvider {
  readonly id: string;
  /** Templates cobertos por este provider. */
  readonly templateIds: string[];
  evaluate(ctx: CompatRuleContext): SlotCompatResult[];
}
