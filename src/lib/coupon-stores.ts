/** Lojas do Hub de Cupões — metadados UI (sem dados mock de campanhas). */

export type CouponStoreMeta = {
  slug: string;
  name: string;
  logoUrl: string;
};

/** Domínios oficiais → favicon real (mesma abordagem das offers). */
function favicon(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
}

export const COUPON_HUB_STORES: CouponStoreMeta[] = [
  { slug: "worten", name: "Worten", logoUrl: favicon("www.worten.pt") },
  { slug: "amazon", name: "Amazon", logoUrl: favicon("www.amazon.es") },
  { slug: "pccomponentes", name: "PCComponentes", logoUrl: favicon("www.pccomponentes.pt") },
  { slug: "globaldata", name: "Globaldata", logoUrl: favicon("www.globaldata.pt") },
];

export function getCouponStoreMeta(slug: string): CouponStoreMeta | undefined {
  const key = (slug || "").trim().toLowerCase();
  return COUPON_HUB_STORES.find((s) => s.slug === key);
}

export function storeLogoUrl(slug: string): string {
  return getCouponStoreMeta(slug)?.logoUrl || favicon("example.com");
}

export function storeDisplayName(slug: string, fallback?: string): string {
  return getCouponStoreMeta(slug)?.name || fallback || slug;
}
