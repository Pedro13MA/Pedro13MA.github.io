/** FASE P3 Block 1 — feature flag. OFF by default. */
export function isP32NavigationEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_P32_NAVIGATION;
  if (v == null || v === "") return false;
  const n = v.trim().toLowerCase();
  return n === "1" || n === "true" || n === "on" || n === "yes";
}

export const P32_FLAG_NAME = "P32_NAVIGATION" as const;
