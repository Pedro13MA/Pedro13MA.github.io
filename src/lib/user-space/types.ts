/**
 * FASE 7.9 — tipos da Minha Área (favoritos, listas, alertas).
 * Preparados para sync cloud sem reescrever a lógica UI.
 */

export type ProductSnapshot = {
  slug: string;
  ean: string;
  name: string;
  brand?: string | null;
  imageUrl?: string | null;
  currentPrice: number;
  lymiarIndex: number;
  cheapestStore?: string | null;
  condition?: string | null;
  category?: string | null;
};

export type Favorite = ProductSnapshot & {
  /** IDs de listas (inclui sempre "favorites" se for favorito). */
  listIds: string[];
  savedAt: number;
  updatedAt: number;
  lastPriceAtSave?: number;
};

export type SavedList = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  /** Lista sistema — não apagar. */
  system?: boolean;
};

export type AlertKind =
  | "price_below"
  | "percent_below"
  | "historical_min"
  | "cheaper_store_change"
  | "back_in_stock";

export type AlertConditionId =
  | "NEW"
  | "OPEN_BOX"
  | "OUTLET"
  | "REFURBISHED"
  | "USED";

export type AlertRule = {
  id: string;
  slug: string;
  ean: string;
  productName: string;
  imageUrl?: string | null;
  kind: AlertKind;
  /** Preço absoluto alvo (€) — kind=price_below */
  priceTarget?: number | null;
  /** % abaixo do preço ao criar — kind=percent_below */
  percentBelow?: number | null;
  /** Preço de referência ao criar o alerta % */
  referencePrice?: number | null;
  /** 'all' ou slugs de loja */
  stores: "all" | string[];
  conditions: AlertConditionId[];
  active: boolean;
  createdAt: number;
  updatedAt: number;
  lastTriggeredAt?: number | null;
};

/** Canal futuro de notificação (cloud). */
export type NotificationTarget = {
  id: string;
  channel: "local" | "email" | "push" | "telegram";
  address?: string | null;
  enabled: boolean;
  createdAt: number;
};

export const SYSTEM_FAVORITES_LIST_ID = "favorites";

export const DEFAULT_LISTS: SavedList[] = [
  {
    id: SYSTEM_FAVORITES_LIST_ID,
    name: "Favoritos",
    createdAt: 0,
    updatedAt: 0,
    system: true,
  },
];

export const ALERT_KIND_LABEL: Record<AlertKind, string> = {
  price_below: "Preço inferior a",
  percent_below: "% abaixo do preço actual",
  historical_min: "Novo mínimo histórico",
  cheaper_store_change: "Mudança de loja mais barata",
  back_in_stock: "Produto novamente disponível",
};

export const ALERT_CONDITION_LABEL: Record<AlertConditionId, string> = {
  NEW: "Novo",
  OPEN_BOX: "Caixa Aberta",
  OUTLET: "Outlet",
  REFURBISHED: "Recondicionado",
  USED: "Usado",
};
