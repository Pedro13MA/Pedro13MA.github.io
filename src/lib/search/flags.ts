/** FASE P3 Block 2 — feature flag. OFF por defeito. */
export function isP33SearchEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_P33_SEARCH_ENGINE;
  if (v == null || v === "") return false;
  const n = v.trim().toLowerCase();
  return n === "1" || n === "true" || n === "on" || n === "yes";
}

export const P33_FLAG_NAME = "P33_SEARCH_ENGINE" as const;
