/**
 * FASE 7.12 — Smart Cart types.
 * Preparado para portes, bundles PC e sync cloud (FASE 8).
 */

export type CartItemStatus = "todo" | "bought" | "reserved";

/** Oferta observada — portes só se numéricos conhecidos. */
export type CartOfferSnap = {
  store: string;
  storeName: string;
  price: number;
  url: string;
  inStock?: boolean | null;
  /** € — null/undefined = desconhecido (nunca inventar). */
  shippingCostEur?: number | null;
};

export type CartItem = {
  id: string;
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  quantity: number;
  preferredStore?: string | null;
  priceAtAdd: number;
  addedAt: number;
  updatedAt: number;
  offers: CartOfferSnap[];
  status: CartItemStatus;
  leafId?: string | null;
  chipsetModel?: string | null;
  limiarIndex?: number;
  condition?: string | null;
  /** FASE 7.16 — rótulo factual (UI only; não altera optimize). */
  insightRecommendation?: string | null;
  insightLabel?: string | null;
  /** FASE 7.17 — tip de poupança (UI only). */
  savingsTipEur?: number | null;
};

/** Tipo futuro de configuração (não implementado na UI ainda). */
export type CartConfigKind =
  | "generic"
  | "pc_build"
  | "bundle_gaming"
  | "wedding"
  | "office"
  | "streaming"
  | "nas"
  | "university";

export type CartConfig = {
  id: string;
  name: string;
  kind: CartConfigKind;
  items: CartItem[];
  createdAt: number;
  updatedAt: number;
};

/** Alerta local: avisar quando o total baixar X € (FASE 8 = sync). */
export type CartPriceAlert = {
  id: string;
  configId: string;
  dropByEur: number;
  baselineTotal: number;
  active: boolean;
  createdAt: number;
};

export type SmartCartSnapshot = {
  version: 1;
  activeConfigId: string;
  configs: CartConfig[];
  alerts: CartPriceAlert[];
};

export type OptimizeStrategyId = "min_price" | "min_stores" | "balanced";

export type OptimizeAssignment = {
  itemId: string;
  slug: string;
  store: string;
  storeName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  url: string;
  shippingCostEur: number | null;
};

export type OptimizeOption = {
  id: OptimizeStrategyId;
  label: string;
  description: string;
  assignments: OptimizeAssignment[];
  productTotal: number;
  /** Soma de portes conhecidos; null se algum desconhecido. */
  shippingTotal: number | null;
  shippingUnknown: boolean;
  storeCount: number;
  stores: string[];
  /** Total produtos (+ portes se todos conhecidos). */
  grandTotal: number;
};

export const DEFAULT_CONFIG_NAMES = [
  "Gaming",
  "PC Trabalho",
  "Streaming",
  "NAS",
  "Universidade",
] as const;
