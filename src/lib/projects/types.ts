/**
 * FASE 7.13 — Projetos Inteligentes (builds genéricos).
 * Compatibilidade técnica = FASE futura (só slots agora).
 */

export type ProjectSlotDef = {
  id: string;
  label: string;
  /** Hints para validação futura — não usados nesta fase. */
  compatibilityHints?: string[];
};

export type ProjectTemplateId =
  | "blank"
  | "pc_gaming"
  | "pc_work"
  | "streaming"
  | "home_office"
  | "nas"
  | "photography"
  | "smart_home";

export type ProjectTemplate = {
  id: ProjectTemplateId;
  name: string;
  description: string;
  slots: ProjectSlotDef[];
};

export type ProjectProductSnap = {
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  currentPrice: number;
  priceAtAdd: number;
  lymiarIndex: number;
  cheapestStore?: string | null;
  storeCouponsAvailable?: boolean;
  isOnSale?: boolean;
  leafId?: string | null;
  chipsetModel?: string | null;
  category?: string | null;
  /** Atributos tipados — necessários à Compatibility Engine (FASE 7.14). */
  typedAttributes?: Record<string, unknown> | null;
  /** FASE 7.15 — atributos knowledge (só enriquecimento de UI). */
  knowledgeAttributes?: Record<string, unknown> | null;
  knowledgeCompleteness?: number | null;
  /** FASE 7.16 — rótulo factual de preço (UI). */
  priceInsightLabel?: string | null;
  /** FASE 7.17 — melhor alternativa (UI). */
  betterAlternativeLabel?: string | null;
  betterAlternativeSlug?: string | null;
  offers: Array<{
    store: string;
    storeName: string;
    price: number;
    url: string;
  }>;
};

export type ProjectSlot = {
  slotId: string;
  label: string;
  product: ProjectProductSnap | null;
  /** Selecção para exportar ao Smart Cart. */
  selected: boolean;
  compatibilityHints?: string[];
};

export type ProjectPricePoint = {
  date: string;
  total: number;
};

export type ProjectStatus = "active" | "archived";

export type Project = {
  id: string;
  name: string;
  description: string;
  imageUrl?: string | null;
  templateId: ProjectTemplateId;
  slots: ProjectSlot[];
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  initialTotal: number;
  priceHistory: ProjectPricePoint[];
  /** Evolução do score de compatibilidade (FASE 7.14). */
  compatibilityHistory?: Array<{
    date: string;
    score: number;
    warnings: number;
    errors: number;
  }>;
  /** Placeholder para motor de compatibilidade. */
  compatibilityVersion: 0 | 1;
};

export type ProjectsSnapshot = {
  version: 1;
  projects: Project[];
};

export type ProjectSummary = {
  total: number;
  minTotal: number;
  storeCount: number;
  savingVsInitial: number;
  onSaleCount: number;
  couponCount: number;
  filledSlots: number;
  emptySlots: number;
};
