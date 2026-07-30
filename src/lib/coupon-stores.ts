/** Lojas do Hub de Cupões e grelha da homepage — metadados UI. */

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

/** Lojas apresentadas na homepage (logos). */
export const MONITORED_STORES: CouponStoreMeta[] = [
  ...COUPON_HUB_STORES,
  { slug: "fnac", name: "Fnac", logoUrl: favicon("www.fnac.pt") },
  { slug: "castro", name: "Castro Electrónica", logoUrl: favicon("www.castroelectronica.pt") },
  {
    slug: "switch",
    name: "Switch Technology",
    logoUrl: favicon("www.switch.pt"),
  },
];

export function getCouponStoreMeta(slug: string): CouponStoreMeta | undefined {
  const key = (slug || "").trim().toLowerCase();
  return (
    COUPON_HUB_STORES.find((s) => s.slug === key) ||
    MONITORED_STORES.find((s) => s.slug === key)
  );
}

export function storeLogoUrl(slug: string): string {
  return getCouponStoreMeta(slug)?.logoUrl || favicon("example.com");
}

export function storeDisplayName(slug: string, fallback?: string): string {
  return getCouponStoreMeta(slug)?.name || fallback || slug;
}
