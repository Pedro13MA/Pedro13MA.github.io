/** Types aligned with Limiar backend (Python/SQLite). */

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

export interface Offer {
  store: string;
  storeName: string;
  url: string;
  price: number;
  currency?: string;
  originalPrice?: number | null;
  inStock?: boolean | null;
  couponCode?: string | null;
  couponLabel?: string | null;
}

export interface PricePoint {
  date: string; // ISO date
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

export interface ScoreBreakdown {
  baseQuality: number;
  priceOpportunity: number;
  trend: number;
  rarity: number;
  categoryOverload: number;
  storeDominance: number;
  feedbackAdjustment: number;
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
  bullets: string[];
  semaphore: DecisionSemaphore;
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
  history: PricePoint[];
  offers: Offer[];
  decision: DecisionScore;
  activePromotion?: Promotion | null;
}
