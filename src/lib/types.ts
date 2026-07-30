/** Types aligned with Limiar backend (Python/SQLite) + web decision UI. */

export type DealTier = "S" | "A" | "B";

export type DealQuality =
  | "VERY_GOOD_DEAL"
  | "GOOD_DEAL"
  | "FAIR_DEAL"
  | "NORMAL";

export type OpportunityType = "NEW_LOW" | "RETURNED_DEAL" | "NOISE";

/** UI semaphore mapped from opportunity + deal quality. */
export type DecisionSemaphore = "buy" | "fair" | "wait";

export type DiscountKind = "percent" | "amount" | "unknown";

/** Condição do produto (isolamento ATL: outlet ≠ new). */
export type ProductCondition = "NEW" | "OUTLET" | "REFURBISHED" | "OPEN_BOX";

export interface PaymentMethod {
  id: string;
  label: string;
  icon?: string;
}

export interface Offer {
  store: string;
  storeName: string;
  url: string;
  price: number;
  currency?: string;
  originalPrice?: number | null;
  /** Preço após cupão aplicável (se menor que price). */
  effectivePrice?: number | null;
  inStock?: boolean | null;
  couponCode?: string | null;
  couponLabel?: string | null;
  paymentMethods?: PaymentMethod[];
  /** Resumo legível (ex: "2–5 dias"). */
  shippingInfo?: string;
  /** Campanha de carrinho estratégica nesta loja. */
  smartBasketOpportunity?: boolean;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Promotion {
  externalId: string;
  merchantId: string;
  storeName: string;
  storeSlug: string;
  title?: string | null;
  description?: string | null;
  code?: string | null;
  url: string;
  promotionType?: string;
  discountKind?: DiscountKind;
  discountValue?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
}

export interface SmartCoupon {
  storeCode: string;
  code: string;
  discountPct?: number | null;
  discountKind?: DiscountKind | string;
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
}

export interface StoreCampaign {
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
}

export interface SmartBasketOpportunity {
  smartBasketOpportunity: boolean;
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
}

export interface ScoreBreakdown {
  baseQuality: number;
  priceOpportunity: number;
  trend: number;
  rarity: number;
  categoryOverload: number;
  storeDominance: number;
  feedbackAdjustment: number;
}

/** Fatores factuais do Índice Limiar (0–100). */
export interface LimiarIndexFactors {
  vsAvg30d: {
    score: number;
    label: string;
    detail: string;
  };
  historicalMin: {
    score: number;
    label: string;
    detail: string;
  };
  couponApplied: {
    score: number;
    label: string;
    detail: string;
  };
  volatility: {
    score: number;
    label: string;
    detail: string;
  };
}

export interface LimiarIndex {
  /** Score 0–100. */
  value: number;
  summary: string;
  factors: LimiarIndexFactors;
}

export interface SeasonalMarker {
  month: number; // 1–12
  label: string;
  kind: "promo" | "peak" | "neutral";
}

export interface Seasonality {
  markers: SeasonalMarker[];
  note: string;
  timesBelowCurrent12m: number;
}

export interface DecisionScore {
  finalScore: number;
  publish: boolean;
  tier: DealTier;
  reason: string;
  breakdown: ScoreBreakdown;
  discountPct: number;
  zScore?: number | null;
  dealQuality: DealQuality;
  opportunityType: OpportunityType;
  historicalAvg?: number | null;
  historicalMin?: number | null;
  isHistoricalMin: boolean;
  cheapestStore?: string | null;
  feedCategory: string;
  /** Justificações factuais (sem previsões). */
  bullets: string[];
  semaphore: DecisionSemaphore;
  limiarIndex: LimiarIndex;
}

export interface Product {
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  category: string;
  imageUrl?: string | null;
  currency?: string;
  currentPrice: number;
  avg30d: number;
  historicalMin: number;
  historicalMax: number;
  /** Queda percentual face a ontem (mock “maiores quedas”). */
  dropTodayPct?: number;
  history: PricePoint[];
  offers: Offer[];
  decision: DecisionScore;
  seasonality: Seasonality;
  activePromotion?: Promotion | null;
  /** Cupão inteligente aplicável a este produto (motor de campanhas). */
  activeCoupon?: SmartCoupon | null;
  /** Campanha de loja em vigor (banner). */
  activeCampaign?: StoreCampaign | null;
  /** Oportunidade de carrinho estratégico (abaixo do min_spend). */
  smartBasketOpportunity?: SmartBasketOpportunity | null;
  /** Preço de lista (preço factual da loja). */
  listPrice?: number;
  /** @deprecated Cupões não alteram preço — sempre null. */
  effectivePrice?: number | null;
  /** @deprecated */
  savings?: number | null;
  /** Há campanhas/cupões informativos na loja. */
  storeCouponsAvailable?: boolean;
  inStock?: boolean | null;
  originalPrice?: number | null;
  /** Promoção imediata vs PVPR (≥20%). */
  isOnSale?: boolean;
  /** NEW por omissão; outlet/recondicionado não contamina ATL de novos. */
  condition?: ProductCondition;
  chipsetModel?: string | null;
  vramSpec?: string | null;
  /** True só se o bot publicou este produto no canal Telegram. */
  sentToTelegram?: boolean;
  /** Limiar v2 — preço de referência e desconto real. */
  referencePrice?: number | null;
  referenceSource?: string | null;
  realDiscountPct?: number | null;
  promotionConfidence?: number | null;
  dealScore?: number | null;
}
