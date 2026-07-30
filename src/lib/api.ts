/** Cliente HTTP para a API FastAPI Limiar (VPS). */

import type {
  DecisionScore,
  DecisionSemaphore,
  LimiarIndex,
  Offer,
  PaymentMethod,
  PricePoint,
  Product,
  ProductCondition,
  Promotion,
  Seasonality,
  SmartCoupon,
  StoreCampaign,
} from "@/lib/types";

/** Proxy HTTPS nginx → FastAPI :8000 (domínio sem challenge Cloudflare bot). */
const DEFAULT_API_URL = "https://floristacantinhoverde.pt/limiar-api";

export function getApiBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL).trim();
  return raw.replace(/\/$/, "");
}

async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} ${path}`);
  }
  return (await res.json()) as T;
}

/* ——— shapes from FastAPI ——— */

export type ApiProductSummary = {
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  currentPrice: number;
  avg30d?: number | null;
  historicalMin?: number | null;
  historicalMax?: number | null;
  dropTodayPct?: number | null;
  limiarIndex: number;
  semaphore: DecisionSemaphore;
  summary: string;
  isHistoricalMin?: boolean;
  isOnSale?: boolean;
  discountPct?: number | null;
  cheapestStore?: string | null;
  stores?: string[];
  inStock?: boolean | null;
  originalPrice?: number | null;
  condition?: ProductCondition | string | null;
  chipsetModel?: string | null;
  vramSpec?: string | null;
  /** True apenas quando o bot confirmou publicação no Telegram. */
  sentToTelegram?: boolean;
  listPrice?: number | null;
  effectivePrice?: number | null;
  savings?: number | null;
  couponCode?: string | null;
  offerUrl?: string | null;
  /** Limiar v2 */
  referencePrice?: number | null;
  referenceSource?: string | null;
  realDiscountPct?: number | null;
  promotionConfidence?: number | null;
  dealScore?: number | null;
};

export type CouponProductsResponse = {
  store: string;
  code: string;
  coupon: ApiSmartCoupon;
  total: number;
  limit: number;
  offset: number;
  results: ApiProductSummary[];
};

export type FacetBucket = {
  value: string;
  label: string;
  count: number;
};

export type SearchFacets = {
  categories: FacetBucket[];
  subcategories?: FacetBucket[];
  brands: FacetBucket[];
  stores: FacetBucket[];
  types: FacetBucket[];
  models?: FacetBucket[];
  vram?: FacetBucket[];
  series?: FacetBucket[];
  sockets?: FacetBucket[];
  capacities?: FacetBucket[];
  formats?: FacetBucket[];
  in_stock?: FacetBucket[];
};

export type SearchResponse = {
  query: string;
  total: number;
  limit: number;
  offset: number;
  sortBy: string;
  inferredCategory?: string | null;
  results: ApiProductSummary[];
  facets: SearchFacets;
};

export type SearchSortBy =
  | "limiar_desc"
  | "price_asc"
  | "price_desc"
  | "discount_desc";

export type SearchParams = {
  limit?: number;
  offset?: number;
  category?: string;
  brand?: string;
  store?: string;
  type?: string;
  model?: string;
  vram?: string;
  series?: string;
  socket?: string;
  capacity?: string;
  format?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: SearchSortBy;
  inStockOnly?: boolean;
  subcategory?: string;
};

export type ApiPaymentMethod = {
  id: string;
  name: string;
  icon?: string | null;
};

export type ApiShippingInfo = {
  estimatedDaysMin?: number;
  estimatedDaysMax?: number;
  shippingCost?: string;
  supportsPickup?: boolean;
};

export type ApiOffer = {
  store: string;
  storeName: string;
  url: string;
  price: number;
  currency?: string;
  originalPrice?: number | null;
  effectivePrice?: number | null;
  inStock?: boolean | null;
  couponCode?: string | null;
  couponLabel?: string | null;
  /** Backend snake_case (OfferOut). */
  payment_methods?: ApiPaymentMethod[];
  shipping_info?: ApiShippingInfo | null;
  /** CamelCase fallback se o proxy normalizar. */
  paymentMethods?: ApiPaymentMethod[];
  shippingInfo?: ApiShippingInfo | string | null;
  smartBasketOpportunity?: boolean;
};

export type ApiProductDetail = {
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  category?: string | null;
  imageUrl?: string | null;
  currency?: string;
  currentPrice: number;
  effectivePrice?: number | null;
  avg30d?: number | null;
  historicalMin?: number | null;
  historicalMax?: number | null;
  dropTodayPct?: number | null;
  originalPrice?: number | null;
  isOnSale?: boolean;
  condition?: ProductCondition | string | null;
  history: PricePoint[];
  offers: ApiOffer[];
  decision: {
    finalScore: number;
    publish: boolean;
    tier: string;
    reason: string;
    discountPct: number;
    zScore?: number | null;
    dealQuality: string;
    opportunityType: string;
    historicalAvg?: number | null;
    historicalMin?: number | null;
    isHistoricalMin: boolean;
    cheapestStore?: string | null;
    feedCategory?: string;
    bullets: string[];
    semaphore: DecisionSemaphore;
    limiarIndex: LimiarIndex;
  };
  activePromotion?: Record<string, unknown> | null;
  activeCoupon?: Record<string, unknown> | null;
  activeCampaign?: Record<string, unknown> | null;
  storeCouponsAvailable?: boolean;
  smartBasketOpportunity?: {
    smartBasketOpportunity?: boolean;
    amountNeededEur: number;
    potentialTotalEur: number;
    competitorMinPrice: number;
    savingsEur: number;
    discountPct: number;
    minSpendEur: number;
    storeCode: string;
    storeName?: string | null;
    campaignTitle?: string | null;
    brands?: string[];
  } | null;
  /** Limiar v2 */
  referencePrice?: number | null;
  referenceSource?: string | null;
  realDiscountPct?: number | null;
  promotionConfidence?: number | null;
  dealScore?: number | null;
  historicalLow?: number | null;
  historicalHigh?: number | null;
  priceTrend?: string | null;
  dailySummary?: Array<Record<string, unknown>> | null;
};

export type ApiSmartCoupon = {
  storeCode: string;
  code: string;
  discountPct?: number | null;
  discountKind?: string;
  discountAmount?: number | null;
  appliesTo?: string;
  category?: string | null;
  title?: string | null;
  description?: string | null;
  affiliateUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  source?: string;
};

export type ApiStoreCampaign = {
  storeCode: string;
  title: string;
  description?: string | null;
  rulesSummary?: string | null;
  appliesTo?: string;
  category?: string | null;
  couponCode?: string | null;
  affiliateUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  requiresCode?: boolean;
  minSpendEur?: number | null;
  discountPct?: number | null;
  brands?: string[] | null;
  maxGapEur?: number | null;
};

export type CampaignsResponse = {
  store: string;
  campaigns: ApiStoreCampaign[];
  coupons: ApiSmartCoupon[];
};

function normalizeCondition(raw: unknown): ProductCondition {
  const v = String(raw || "NEW").trim().toUpperCase();
  if (v === "OUTLET" || v === "REFURBISHED" || v === "OPEN_BOX") return v;
  return "NEW";
}

function formatShippingInfo(
  info: ApiShippingInfo | string | null | undefined,
): string | undefined {
  if (!info) return undefined;
  if (typeof info === "string") return info.trim() || undefined;
  const min = info.estimatedDaysMin ?? 2;
  const max = info.estimatedDaysMax ?? 5;
  const pickup = info.supportsPickup ? " · levantamento" : "";
  return `${min}–${max} dias${pickup}`;
}

function mapPaymentMethods(
  methods: ApiPaymentMethod[] | undefined,
): PaymentMethod[] {
  if (!methods?.length) return [];
  return methods
    .filter((m) => m && (m.id || m.name))
    .map((m) => ({
      id: String(m.id || ""),
      label: String(m.name || m.id || ""),
      icon: m.icon ? String(m.icon) : undefined,
    }));
}

export type ApiPromotion = {
  externalId: string;
  merchantId: string;
  storeName: string;
  storeSlug: string;
  title?: string | null;
  description?: string | null;
  code?: string | null;
  url: string;
  promotionType?: string;
  discountKind?: string;
  discountValue?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
};

export type DealsResponse = {
  count: number;
  results: ApiProductSummary[];
};

export type PromotionsResponse = {
  storeSlug: string;
  count: number;
  results: ApiPromotion[];
};

const DEFAULT_SEASONALITY: Seasonality = {
  timesBelowCurrent12m: 0,
  note: "Sazonalidade estimada a partir do histórico de preços Limiar.",
  markers: Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: "",
    kind: "neutral" as const,
  })),
};

export function summaryToProduct(s: ApiProductSummary): Product {
  const index: LimiarIndex = {
    value: s.limiarIndex,
    summary: s.summary,
    factors: {
      vsAvg30d: { score: 0, label: "Preço vs média 30d", detail: "—" },
      historicalMin: { score: 0, label: "Mínimo histórico", detail: "—" },
      couponApplied: { score: 0, label: "Cupão aplicado", detail: "—" },
      volatility: { score: 0, label: "Volatilidade", detail: "—" },
    },
  };
  const decision: DecisionScore = {
    finalScore: s.limiarIndex,
    publish: s.semaphore === "buy",
    tier: s.limiarIndex >= 85 ? "S" : s.limiarIndex >= 50 ? "A" : "B",
    reason: s.summary,
    breakdown: {
      baseQuality: 0,
      priceOpportunity: 0,
      trend: 0,
      rarity: 0,
      categoryOverload: 0,
      storeDominance: 0,
      feedbackAdjustment: 0,
    },
    discountPct: Number(s.realDiscountPct ?? s.discountPct ?? 0),
    dealQuality: "NORMAL",
    opportunityType: s.isHistoricalMin ? "NEW_LOW" : "NOISE",
    historicalAvg: s.avg30d ?? null,
    historicalMin: s.historicalMin ?? null,
    isHistoricalMin: Boolean(s.isHistoricalMin),
    cheapestStore: s.cheapestStore ?? null,
    feedCategory: "other",
    bullets: [s.summary],
    semaphore: s.semaphore,
    limiarIndex: index,
  };
  return {
    slug: s.slug,
    ean: s.ean,
    name: s.name,
    brand: s.brand,
    category: s.category || "Other",
    imageUrl: s.imageUrl,
    currentPrice: s.currentPrice,
    listPrice: s.listPrice ?? undefined,
    effectivePrice: s.effectivePrice ?? undefined,
    savings: s.savings ?? undefined,
    avg30d: s.avg30d ?? s.currentPrice,
    historicalMin: s.historicalMin ?? s.currentPrice,
    historicalMax: s.historicalMax ?? s.currentPrice,
    dropTodayPct: s.dropTodayPct ?? undefined,
    history: [],
    offers: s.offerUrl
      ? [
          {
            store: s.cheapestStore || "store",
            storeName: s.cheapestStore || "Loja",
            url: s.offerUrl,
            price: s.listPrice ?? s.currentPrice,
            effectivePrice: undefined,
          },
        ]
      : [],
    decision,
    seasonality: DEFAULT_SEASONALITY,
    inStock: s.inStock,
    originalPrice: s.originalPrice,
    isOnSale: Boolean(s.isOnSale),
    condition: normalizeCondition(s.condition),
    chipsetModel: s.chipsetModel,
    vramSpec: s.vramSpec,
    sentToTelegram: Boolean(s.sentToTelegram),
    referencePrice: s.referencePrice ?? undefined,
    referenceSource: s.referenceSource ?? undefined,
    realDiscountPct: s.realDiscountPct ?? undefined,
    promotionConfidence: s.promotionConfidence ?? undefined,
    dealScore: s.dealScore ?? undefined,
  };
}

export function mapSmartCoupon(c: ApiSmartCoupon): SmartCoupon {
  return {
    storeCode: c.storeCode,
    code: c.code,
    discountPct: c.discountPct,
    discountKind: (c.discountKind as Promotion["discountKind"]) || "percent",
    discountAmount: c.discountAmount,
    appliesTo: c.appliesTo,
    category: c.category,
    title: c.title,
    description: c.description,
    affiliateUrl: c.affiliateUrl,
    startDate: c.startDate,
    endDate: c.endDate,
    isActive: c.isActive,
    source: undefined, // interno — não expor na UI
  };
}

export function mapStoreCampaign(c: ApiStoreCampaign): StoreCampaign {
  return {
    storeCode: c.storeCode,
    title: c.title,
    description: c.description,
    rulesSummary: c.rulesSummary,
    appliesTo: c.appliesTo,
    category: c.category,
    couponCode: c.couponCode,
    affiliateUrl: c.affiliateUrl,
    startDate: c.startDate,
    endDate: c.endDate,
    isActive: c.isActive,
    requiresCode: c.requiresCode,
    minSpendEur: c.minSpendEur,
    discountPct: c.discountPct,
    brands: c.brands,
    maxGapEur: c.maxGapEur,
  };
}

/** Converte cupão inteligente para Promotion (CouponCard). */
export function smartCouponToPromotion(c: SmartCoupon, storeName?: string): Promotion {
  const slug = c.storeCode;
  return {
    externalId: `smart-${slug}-${c.code}`,
    merchantId: slug,
    storeName: storeName || slug,
    storeSlug: slug,
    title: c.title,
    description: c.description,
    code: c.code,
    url: c.affiliateUrl || "#",
    promotionType: "voucher",
    discountKind:
      c.discountKind === "amount" ? "amount" : c.discountPct ? "percent" : "unknown",
    discountValue: c.discountPct ?? c.discountAmount,
    startDate: c.startDate,
    endDate: c.endDate,
    isActive: c.isActive,
  };
}

export function detailToProduct(d: ApiProductDetail): Product {
  const offers: Offer[] = (d.offers || []).map((o) => ({
    store: o.store,
    storeName: o.storeName,
    url: o.url,
    price: o.price,
    currency: o.currency,
    originalPrice: o.originalPrice,
    effectivePrice: o.effectivePrice,
    inStock: o.inStock,
    couponCode: o.couponCode,
    couponLabel: o.couponLabel,
    paymentMethods: mapPaymentMethods(o.payment_methods ?? o.paymentMethods),
    shippingInfo: formatShippingInfo(o.shipping_info ?? o.shippingInfo),
    smartBasketOpportunity: Boolean(o.smartBasketOpportunity),
  }));
  const listPrice = d.currentPrice;
  const effectivePrice = null;
  const displayPrice = listPrice;
  const bestOffer =
    offers.length > 0
      ? [...offers].sort((a, b) => a.price - b.price)[0]
      : null;
  const originalPrice = bestOffer?.originalPrice ?? d.originalPrice ?? null;
  const activeCoupon = d.activeCoupon
    ? mapSmartCoupon(d.activeCoupon as ApiSmartCoupon)
    : null;
  const activeCampaign = d.activeCampaign
    ? mapStoreCampaign(d.activeCampaign as ApiStoreCampaign)
    : null;
  return {
    slug: d.slug,
    ean: d.ean,
    name: d.name,
    brand: d.brand,
    category: d.category || "Other",
    imageUrl: d.imageUrl,
    currency: d.currency,
    listPrice,
    effectivePrice,
    currentPrice: displayPrice,
    avg30d: d.avg30d ?? displayPrice,
    historicalMin: d.historicalMin ?? displayPrice,
    historicalMax: d.historicalMax ?? displayPrice,
    dropTodayPct: d.dropTodayPct ?? undefined,
    history: d.history || [],
    offers,
    originalPrice,
    isOnSale: Boolean(d.isOnSale),
    condition: normalizeCondition(d.condition),
    activeCoupon,
    activeCampaign,
    smartBasketOpportunity: null,
    storeCouponsAvailable: Boolean(d.storeCouponsAvailable || activeCoupon?.code),
    decision: {
      finalScore: d.decision.finalScore,
      publish: d.decision.publish,
      tier: (d.decision.tier as "S" | "A" | "B") || "B",
      reason: d.decision.reason,
      breakdown: {
        baseQuality: 0,
        priceOpportunity: 0,
        trend: 0,
        rarity: 0,
        categoryOverload: 0,
        storeDominance: 0,
        feedbackAdjustment: 0,
      },
      discountPct: Number(d.realDiscountPct ?? d.decision.discountPct),
      zScore: d.decision.zScore,
      dealQuality: d.decision.dealQuality as DecisionScore["dealQuality"],
      opportunityType: d.decision.opportunityType as DecisionScore["opportunityType"],
      historicalAvg: d.decision.historicalAvg,
      historicalMin: d.decision.historicalMin,
      isHistoricalMin: d.decision.isHistoricalMin,
      cheapestStore: d.decision.cheapestStore,
      feedCategory: d.decision.feedCategory || "other",
      bullets: d.decision.bullets || [],
      semaphore: d.decision.semaphore,
      limiarIndex: d.decision.limiarIndex,
    },
    seasonality: {
      ...DEFAULT_SEASONALITY,
      timesBelowCurrent12m:
        d.decision.bullets
          ?.map((b) => {
            const m = b.match(/(\d+)\s+ocasi/);
            return m ? Number(m[1]) : null;
          })
          .find((n) => n != null) ?? 0,
    },
    activePromotion: d.activePromotion
      ? {
          externalId: String(d.activePromotion.externalId || ""),
          merchantId: String(d.activePromotion.merchantId || ""),
          storeName: String(d.activePromotion.storeName || ""),
          storeSlug: String(d.activePromotion.storeSlug || ""),
          title: (d.activePromotion.title as string) || null,
          description: (d.activePromotion.description as string) || null,
          code: (d.activePromotion.code as string) || null,
          url: String(d.activePromotion.url || ""),
          isActive: true,
        }
      : null,
    referencePrice: d.referencePrice ?? undefined,
    referenceSource: d.referenceSource ?? undefined,
    realDiscountPct: d.realDiscountPct ?? undefined,
    promotionConfidence: d.promotionConfidence ?? undefined,
    dealScore: d.dealScore ?? undefined,
  };
}

export function mapPromotion(p: ApiPromotion): Promotion {
  return {
    externalId: p.externalId,
    merchantId: p.merchantId,
    storeName: p.storeName,
    storeSlug: p.storeSlug,
    title: p.title,
    description: p.description,
    code: p.code,
    url: p.url,
    promotionType: p.promotionType,
    discountKind: (p.discountKind as Promotion["discountKind"]) || "unknown",
    discountValue: p.discountValue,
    startDate: p.startDate,
    endDate: p.endDate,
    isActive: p.isActive,
  };
}

export async function searchProducts(
  q: string,
  opts?: SearchParams,
): Promise<SearchResponse> {
  const limit = opts?.limit ?? 24;
  const offset = opts?.offset ?? 0;
  const params = new URLSearchParams({
    q,
    limit: String(limit),
    offset: String(offset),
    sort_by: opts?.sortBy || "limiar_desc",
  });
  if (opts?.category) params.set("category", opts.category);
  if (opts?.brand) params.set("brand", opts.brand);
  if (opts?.store) params.set("store", opts.store);
  if (opts?.type) params.set("type", opts.type);
  if (opts?.model) params.set("model", opts.model);
  if (opts?.vram) params.set("vram", opts.vram);
  if (opts?.series) params.set("series", opts.series);
  if (opts?.socket) params.set("socket", opts.socket);
  if (opts?.capacity) params.set("capacity", opts.capacity);
  if (opts?.format) params.set("format", opts.format);
  if (opts?.minPrice != null && !Number.isNaN(opts.minPrice)) {
    params.set("min_price", String(opts.minPrice));
  }
  if (opts?.maxPrice != null && !Number.isNaN(opts.maxPrice)) {
    params.set("max_price", String(opts.maxPrice));
  }
  if (opts?.inStockOnly) params.set("in_stock", "true");
  if (opts?.subcategory) params.set("subcategory", opts.subcategory);
  return apiGet<SearchResponse>(`/api/v1/search?${params}`);
}

export async function getDealsNow(limit = 24): Promise<DealsResponse> {
  return apiGet<DealsResponse>(`/api/v1/deals/now?limit=${limit}`);
}

export async function getDealsWait(limit = 24): Promise<DealsResponse> {
  return apiGet<DealsResponse>(`/api/v1/deals/wait?limit=${limit}`);
}

/** Alertas efetivamente enviados ao Telegram (ledger de publish confirmado). */
export async function getTelegramDeals(
  limit = 24,
  sinceHours = 36,
): Promise<DealsResponse> {
  return apiGet<DealsResponse>(
    `/api/v1/deals/telegram?limit=${limit}&since_hours=${sinceHours}`,
  );
}

export async function getProductBySlug(slug: string): Promise<ApiProductDetail> {
  return apiGet<ApiProductDetail>(`/api/v1/product/${encodeURIComponent(slug)}`);
}

export type HistoryGranularity = "daily" | "weekly";

export type PriceHistorySeriesPoint = {
  date: string;
  price: number;
  avgPrice?: number | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  samples?: number;
};

export type PriceHistoryOut = {
  ean: string;
  days: number;
  granularity: HistoryGranularity;
  points: PriceHistorySeriesPoint[];
  currentPrice?: number | null;
  historicalMin?: number | null;
  historicalMax?: number | null;
  referencePrice?: number | null;
  referenceSource?: string | null;
  seriesSource?: string;
};

export type StorePriceSpread = {
  store: string;
  storeName: string;
  price: number;
};

export type ProductMetricsOut = {
  ean: string;
  currentPrice?: number | null;
  allTimeLow?: number | null;
  allTimeHigh?: number | null;
  avg30d?: number | null;
  avg90d?: number | null;
  storeSpreadEur?: number | null;
  storeCount: number;
  storePrices: StorePriceSpread[];
  volatilityPct?: number | null;
  samples30d: number;
  samples90d: number;
};

export async function fetchPriceHistory(
  id: string,
  days = 30,
  granularity: HistoryGranularity = "daily",
): Promise<PriceHistoryOut> {
  const params = new URLSearchParams({
    days: String(days),
    granularity,
  });
  return apiGet<PriceHistoryOut>(
    `/api/v1/product/${encodeURIComponent(id)}/history?${params}`,
  );
}

export async function fetchProductMetrics(ean: string): Promise<ProductMetricsOut> {
  return apiGet<ProductMetricsOut>(
    `/api/v1/metrics/product/${encodeURIComponent(ean)}`,
  );
}

export async function getStoreCampaigns(store: string): Promise<CampaignsResponse> {
  return apiGet<CampaignsResponse>(
    `/api/v1/campaigns?store=${encodeURIComponent(store)}`,
  );
}

export async function getCoupons(store?: string): Promise<{
  store: string | null;
  coupons: ApiSmartCoupon[];
  rules?: {
    store: string;
    supportsCodes: boolean;
    requiresVerification: boolean;
    displayConditions: boolean;
  } | null;
}> {
  const q = store ? `?store=${encodeURIComponent(store)}` : "";
  return apiGet(`/api/v1/coupons${q}`);
}

export async function getCouponProducts(
  store: string,
  code: string,
  limit = 48,
  offset = 0,
): Promise<CouponProductsResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return apiGet<CouponProductsResponse>(
    `/api/v1/coupons/${encodeURIComponent(store)}/${encodeURIComponent(code)}/products?${params}`,
  );
}

export async function getStorePromotions(
  store: string,
  limit = 50,
): Promise<PromotionsResponse> {
  return apiGet<PromotionsResponse>(
    `/api/v1/promotions/${encodeURIComponent(store)}?limit=${limit}`,
  );
}
