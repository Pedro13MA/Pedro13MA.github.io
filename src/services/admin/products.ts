/** Admin products API — Control Center 2B.1 */

import { getApiBaseUrl } from "@/lib/api-base-url";
import { getStoredToken } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers || {}) },
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`admin_http_${res.status}:${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}

export type ProductSearchRow = {
  ean: string;
  canonical_name: string | null;
  brand: string | null;
  brand_normalized: string | null;
  canonical_model: string | null;
  category: string | null;
  leaf_id: string | null;
  family: string | null;
  updated_at: string | null;
  created_at: string | null;
  bestPrice: number | null;
  offerCount: number;
  sku: string | null;
  mpn: string | null;
};

export type FieldQuality = {
  column: string;
  value: unknown;
  rawType: string;
  status: "filled" | "partial" | "empty";
  catalogCoveragePct?: number | null;
  impact?: number;
  usedIn?: string[];
};

export type SectionScore = {
  id: string;
  label: string;
  pct: number | null;
  tone: "ok" | "warn" | "critical" | "na";
  applicable?: boolean;
  note?: string | null;
};

export type DiagnosticIssue = {
  id: string;
  title: string;
  severity: boolean;
  reasons: string[];
  fixes: string[];
  categoryLabel?: string | null;
  profileId?: string | null;
  fixesHigh?: string[];
  fixesMedium?: string[];
};

export type KnowledgeItem = {
  label: string;
  present: boolean;
  source: string | null;
  priority?: "identity" | "high" | "medium" | string;
};

export type KnowledgeCoverage = {
  knowledgeKind?: "product" | "service" | "non_catalog" | string;
  profileId: string | null;
  profileLabel: string | null;
  message?: string | null;
  covered: number;
  total: number;
  items: KnowledgeItem[];
};

export type TimelineEvent = {
  at: string;
  title: string;
  detail: string | null;
};

export type ProductRelations = {
  sameModel: Array<{
    ean: string;
    canonical_name: string | null;
    brand: string | null;
    canonical_model: string | null;
  }>;
  sameEanOffers: number;
  sameGroup: Array<{
    ean: string;
    canonical_name: string | null;
    brand: string | null;
    canonical_model: string | null;
  }>;
  sameGroupCount: number;
  canonicalGroupId: string | null;
};

export type ProductDetail = {
  ok: boolean;
  ean: string;
  product: Record<string, unknown>;
  quality: {
    fields: FieldQuality[];
    counts: { filled: number; partial: number; empty: number };
    qualityPct: number;
    columnCount: number;
  };
  offers: Record<string, unknown>[];
  summary: {
    name: string | null;
    brand: string | null;
    model: string | null;
    category: string | null;
    leafId: string | null;
    updatedAt: string | null;
    createdAt: string | null;
    offerCount: number;
    bestPrice: number | null;
    qualityPct: number;
    dealScore: number | null;
    state: string;
  };
  decision: {
    verdict: string;
    label: string;
    dealScore: number | null;
    realDiscountPct: number | null;
    note: string;
  };
  monitoring: Record<string, unknown> | null;
  history: {
    daily: Record<string, unknown>[];
    ticks: Record<string, unknown>[];
  };
  dealEvents: Record<string, unknown>[];
  sectionScores?: {
    overallPct: number;
    tone: "ok" | "warn" | "critical" | "na";
    knowledgeKind?: string;
    sections: SectionScore[];
  };
  knowledgeKind?: "product" | "service" | "non_catalog" | string;
  diagnostics?: DiagnosticIssue[];
  knowledgeCoverage?: KnowledgeCoverage | KnowledgeItem[];
  timeline?: TimelineEvent[];
  relations?: ProductRelations;
};

export async function searchAdminProducts(params: {
  q?: string;
  brand?: string;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  ok: boolean;
  total: number;
  products: ProductSearchRow[];
}> {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.brand) sp.set("brand", params.brand);
  if (params.category) sp.set("category", params.category);
  if (params.limit) sp.set("limit", String(params.limit));
  if (params.offset) sp.set("offset", String(params.offset));
  const q = sp.toString();
  return adminFetch(`/api/admin/products${q ? `?${q}` : ""}`);
}

export async function fetchAdminProduct(ean: string): Promise<ProductDetail> {
  return adminFetch(`/api/admin/products/${encodeURIComponent(ean)}`);
}

export async function patchAdminProduct(
  ean: string,
  fields: Record<string, unknown>,
): Promise<{ ok: boolean; changed: boolean; product: Record<string, unknown> }> {
  return adminFetch(`/api/admin/products/${encodeURIComponent(ean)}`, {
    method: "PATCH",
    body: JSON.stringify({ fields }),
  });
}

export function formatEuro(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value));
}
