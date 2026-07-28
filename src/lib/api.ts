/** Cliente HTTP para a API FastAPI Limiar (VPS). */

import type {
  DecisionScore,
  DecisionSemaphore,
  LimiarIndex,
  Offer,
  PricePoint,
  Product,
  Promotion,
  Seasonality,
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
  cheapestStore?: string | null;
  stores?: string[];
  inStock?: boolean | null;
  originalPrice?: number | null;
  chipsetModel?: string | null;
  vramSpec?: string | null;
};

export type FacetBucket = {
  value: string;
  label: string;
  count: number;
};

export type SearchFacets = {
  categories: FacetBucket[];
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
};

export type ApiOffer = {
  store: string;
  storeName: string;
  url: string;
  price: number;
  currency?: string;
  originalPrice?: number | null;
  inStock?: boolean | null;
  couponCode?: string | null;
  couponLabel?: string | null;
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
  avg30d?: number | null;
  historicalMin?: number | null;
  historicalMax?: number | null;
  dropTodayPct?: number | null;
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
};

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
    discountPct: 0,
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
    avg30d: s.avg30d ?? s.currentPrice,
    historicalMin: s.historicalMin ?? s.currentPrice,
    historicalMax: s.historicalMax ?? s.currentPrice,
    dropTodayPct: s.dropTodayPct ?? undefined,
    history: [],
    offers: [],
    decision,
    seasonality: DEFAULT_SEASONALITY,
    inStock: s.inStock,
    originalPrice: s.originalPrice,
    chipsetModel: s.chipsetModel,
    vramSpec: s.vramSpec,
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
    inStock: o.inStock,
    couponCode: o.couponCode,
    couponLabel: o.couponLabel,
  }));
  return {
    slug: d.slug,
    ean: d.ean,
    name: d.name,
    brand: d.brand,
    category: d.category || "Other",
    imageUrl: d.imageUrl,
    currency: d.currency,
    currentPrice: d.currentPrice,
    avg30d: d.avg30d ?? d.currentPrice,
    historicalMin: d.historicalMin ?? d.currentPrice,
    historicalMax: d.historicalMax ?? d.currentPrice,
    dropTodayPct: d.dropTodayPct ?? undefined,
    history: d.history || [],
    offers,
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
      discountPct: d.decision.discountPct,
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
  return apiGet<SearchResponse>(`/api/v1/search?${params}`);
}

export async function getDealsNow(limit = 24): Promise<DealsResponse> {
  return apiGet<DealsResponse>(`/api/v1/deals/now?limit=${limit}`);
}

export async function getDealsWait(limit = 24): Promise<DealsResponse> {
  return apiGet<DealsResponse>(`/api/v1/deals/wait?limit=${limit}`);
}

export async function getProductBySlug(slug: string): Promise<ApiProductDetail> {
  return apiGet<ApiProductDetail>(`/api/v1/product/${encodeURIComponent(slug)}`);
}

export async function getStorePromotions(
  store: string,
  limit = 50,
): Promise<PromotionsResponse> {
  return apiGet<PromotionsResponse>(
    `/api/v1/promotions/${encodeURIComponent(store)}?limit=${limit}`,
  );
}
