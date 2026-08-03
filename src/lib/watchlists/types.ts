/**
 * FASE 7.19 — Watchlists & Timeline (tipos).
 * Apenas dados observados; sem IA / previsões.
 */

export type WatchKind =
  | "PRODUCT"
  | "CATEGORY"
  | "BRAND"
  | "STORE"
  | "PROJECT"
  | "SMART_CART";

export type WatchTarget = {
  /** Identificador estável dentro do kind (slug, id, …). */
  key: string;
  label: string;
  href: string;
  imageUrl?: string | null;
};

/** Snapshot factual no momento da última observação. */
export type WatchBaseline = {
  price?: number | null;
  avgPrice?: number | null;
  productCount?: number | null;
  storeCount?: number | null;
  promotionCount?: number | null;
  couponCount?: number | null;
  brandCount?: number | null;
  /** Total projeto / carrinho. */
  total?: number | null;
  historicalMin?: number | null;
  inStock?: boolean | null;
  /** Slugs/ids de lojas com oferta (ordenados). */
  offerStores?: string[];
  updatedAt: number;
};

export type WatchItem = {
  id: string;
  kind: WatchKind;
  target: WatchTarget;
  created: number;
  lastSeen: number;
  notes: string;
  enabled: boolean;
  baseline: WatchBaseline | null;
};

export type TimelineEventKind =
  | "FOLLOWED"
  | "PRICE_DROP"
  | "PRICE_RISE"
  | "NEW_MIN"
  | "NEW_STORE"
  | "STORE_GONE"
  | "BACK_IN_STOCK"
  | "MORE_COUPONS"
  | "MORE_STORES"
  | "PROJECT_CHEAPER"
  | "PROJECT_ITEM_CHEAPER"
  | "PROJECT_ITEM_COSTLIER"
  | "CATEGORY_PRODUCTS_UP"
  | "CATEGORY_PRODUCTS_DOWN"
  | "CATEGORY_AVG_DOWN"
  | "CATEGORY_BRANDS_UP"
  | "BRAND_PROMOS_UP"
  | "BRAND_PRODUCTS_UP"
  | "STORE_PROMOS_UP"
  | "CART_TOTAL_DOWN"
  | "CART_SAVINGS"
  | "CART_FEWER_STORES"
  | "CART_COUPON"
  | "HISTORY_PRICE_CHANGE";

export type TimelineEvent = {
  id: string;
  watchId: string | null;
  kind: WatchKind;
  eventKind: TimelineEventKind;
  title: string;
  summary: string;
  href: string;
  targetLabel: string;
  /** Epoch ms. */
  at: number;
  deltaEur?: number | null;
  deltaCount?: number | null;
  searchText: string;
};

export type WatchlistsSnapshot = {
  version: 1;
  watches: WatchItem[];
  events: TimelineEvent[];
};

export type TimelinePeriod =
  | "today"
  | "yesterday"
  | "week"
  | "month"
  | "older";

export type TimelinePeriodGroup = {
  period: TimelinePeriod;
  label: string;
  events: TimelineEvent[];
};

export type WatchStats = {
  products: number;
  categories: number;
  brands: number;
  stores: number;
  projects: number;
  smartCarts: number;
  total: number;
  eventsThisWeek: number;
  /** Soma de preços/totais observados nos baselines activos. */
  followedValueEur: number;
};

export const WATCH_KIND_LABEL: Record<WatchKind, string> = {
  PRODUCT: "Produtos",
  CATEGORY: "Categorias",
  BRAND: "Marcas",
  STORE: "Lojas",
  PROJECT: "Projetos",
  SMART_CART: "Carrinho",
};

export const SMART_CART_WATCH_KEY = "active";
