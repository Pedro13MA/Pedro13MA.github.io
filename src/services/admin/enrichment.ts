/** Admin enrichment coverage API */

import { getApiBaseUrl } from "@/lib/api-base-url";
import { getStoredToken } from "@/lib/auth/session";

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };
}

export type EnrichmentCampaignRow = {
  id: string;
  label: string;
  leafs: string[];
  products: number;
  enriched: number;
  coveragePct: number;
  extractorVersion: string;
  hasExtractor: boolean;
};

export type EnrichmentCoverage = {
  ok: boolean;
  campaigns: EnrichmentCampaignRow[];
  totals: {
    products: number;
    enriched: number;
    coveragePct: number;
  };
};

export type TaxonomySuspectSample = {
  ean: string;
  name: string;
  brand: string | null;
  leafId: string | null;
};

export type TaxonomySuspectRule = {
  id: string;
  leaf: string;
  label: string;
  rule: string;
  suggestedLeaf: string | null;
  leafTotal: number;
  suspects: number;
  suspectPct: number;
  samples: TaxonomySuspectSample[];
};

export type TaxonomySuspects = {
  ok: boolean;
  rules: TaxonomySuspectRule[];
  summary: { rules: number; suspects: number; leafs: string[] };
  note?: string;
};

export async function fetchEnrichmentCoverage(): Promise<EnrichmentCoverage> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/enrichment/coverage`, {
    headers: authHeaders(),
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`admin_http_${res.status}:${text.slice(0, 200)}`);
  }
  return res.json() as Promise<EnrichmentCoverage>;
}

export async function fetchTaxonomySuspects(): Promise<TaxonomySuspects> {
  const res = await fetch(`${getApiBaseUrl()}/api/admin/enrichment/taxonomy-suspects`, {
    headers: authHeaders(),
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`admin_http_${res.status}:${text.slice(0, 200)}`);
  }
  return res.json() as Promise<TaxonomySuspects>;
}
