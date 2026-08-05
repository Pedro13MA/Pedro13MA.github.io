/** FASE P3 Block 3 — Product Page layout. OFF por defeito = PDP actual. */
export function isP34ProductPageEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_P34_PRODUCT_PAGE;
  if (v == null || v === "") return false;
  const n = v.trim().toLowerCase();
  return n === "1" || n === "true" || n === "on" || n === "yes";
}

export const P34_FLAG_NAME = "P34_PRODUCT_PAGE" as const;
