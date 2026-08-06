"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getDealsFair,
  getDealsNow,
  getDealsWait,
  summaryToProduct,
  type ApiProductSummary,
} from "@/lib/api";
import { MOCK_PRODUCTS } from "@/lib/mocks";
import type { Product } from "@/lib/types";

type HomeDealsState = {
  dealsNow: Product[];
  dealsWait: Product[];
  dealsFair: Product[];
  loading: boolean;
  error: string | null;
  /** True quando os cards vêm de fixtures locais (API vazia/offline). */
  isPreview: boolean;
  refresh: () => void;
};

const HomeDealsContext = createContext<HomeDealsState | null>(null);

const HOME_DEALS_TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 60_000;

type DealsCache = {
  now: Product[];
  wait: Product[];
  fair: Product[];
  at: number;
  preview: boolean;
};

/** Cache + inflight ao nível do módulo — sobrevivem a Strict Mode / Fast Refresh. */
let dealsCache: DealsCache | null = null;
let dealsInflight: Promise<DealsCache> | null = null;
let dealsInflightStartedAt = 0;
let dealsLastError: string | null = null;

function radarPreviewEnabled(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  const v = (process.env.NEXT_PUBLIC_RADAR_DEMO || "").trim().toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes";
}

function mockBySemaphore(sem: "buy" | "wait" | "fair"): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.decision?.semaphore === sem);
}

function previewDeals(): DealsCache {
  const buy = mockBySemaphore("buy");
  const wait = mockBySemaphore("wait");
  const fair = mockBySemaphore("fair");
  const now = [...buy, ...fair, ...wait].slice(0, 5);
  return {
    now: now.length > 0 ? now : MOCK_PRODUCTS.slice(0, 5),
    wait: wait.length > 0 ? wait.slice(0, 3) : MOCK_PRODUCTS.slice(2, 4),
    fair: fair.length > 0 ? fair : MOCK_PRODUCTS.slice(1, 2),
    at: Date.now(),
    preview: true,
  };
}

function mapSafe(rows: ApiProductSummary[] | undefined): Product[] {
  const out: Product[] = [];
  for (const row of rows ?? []) {
    try {
      out.push(summaryToProduct(row));
    } catch {
      /* um card inválido não zera a homepage */
    }
  }
  return out;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = window.setTimeout(() => {
      reject(new Error(`${label}_timeout_${ms}ms`));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(id);
        resolve(value);
      },
      (err) => {
        window.clearTimeout(id);
        reject(err);
      },
    );
  });
}

async function loadFairSafe(): Promise<Product[]> {
  try {
    const fairRes = await withTimeout(
      getDealsFair(12),
      HOME_DEALS_TIMEOUT_MS,
      "home_deals_fair",
    );
    return mapSafe(fairRes.results);
  } catch {
    return [];
  }
}

function loadHomeDeals(force = false): Promise<DealsCache> {
  if (
    !force &&
    dealsCache &&
    Array.isArray(dealsCache.fair) &&
    Date.now() - dealsCache.at < CACHE_TTL_MS
  ) {
    return Promise.resolve(dealsCache);
  }
  if (dealsCache && !Array.isArray(dealsCache.fair)) {
    dealsCache = null;
  }

  const inflightAge = Date.now() - dealsInflightStartedAt;
  const inflightFresh =
    dealsInflight &&
    inflightAge >= 0 &&
    inflightAge < HOME_DEALS_TIMEOUT_MS + 2_000;

  if (!force && inflightFresh) return dealsInflight!;

  dealsInflightStartedAt = Date.now();
  dealsInflight = (async () => {
    try {
      const [nowRes, waitRes, fairFromApi] = await Promise.all([
        withTimeout(getDealsNow(24), HOME_DEALS_TIMEOUT_MS, "home_deals_now"),
        withTimeout(getDealsWait(12), HOME_DEALS_TIMEOUT_MS, "home_deals_wait"),
        loadFairSafe(),
      ]);
      const now = mapSafe(nowRes.results);
      const wait = mapSafe(waitRes.results);
      let fair = fairFromApi;

      if (now.length === 0 && radarPreviewEnabled()) {
        dealsCache = previewDeals();
        dealsLastError = null;
        return dealsCache;
      }

      // Em dev, se a API ainda não tiver /deals/fair, usar fixture para o 3.º cartão.
      if (fair.length === 0 && radarPreviewEnabled()) {
        fair = mockBySemaphore("fair");
      }

      dealsCache = {
        now,
        wait,
        fair,
        at: Date.now(),
        preview: false,
      };
      dealsLastError = null;
      return dealsCache;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao carregar oportunidades";
      dealsLastError = message;
      console.warn("[HomeDeals]", message);
      if (radarPreviewEnabled()) {
        dealsCache = previewDeals();
        return dealsCache;
      }
      throw err;
    } finally {
      dealsInflight = null;
    }
  })();

  return dealsInflight;
}

/** Um único fetch partilhado — evita 3× getDealsNow na homepage. */
export function HomeDealsProvider({ children }: { children: ReactNode }) {
  const [dealsNow, setDealsNow] = useState<Product[]>(
    () => dealsCache?.now ?? [],
  );
  const [dealsWait, setDealsWait] = useState<Product[]>(
    () => dealsCache?.wait ?? [],
  );
  const [dealsFair, setDealsFair] = useState<Product[]>(
    () => dealsCache?.fair ?? [],
  );
  const [isPreview, setIsPreview] = useState(() => dealsCache?.preview ?? false);
  const [loading, setLoading] = useState(() => {
    if (dealsCache && Date.now() - dealsCache.at < CACHE_TTL_MS) return false;
    return true;
  });
  const [error, setError] = useState<string | null>(() =>
    dealsCache?.preview ? null : dealsLastError,
  );
  const [tick, setTick] = useState(0);

  const refresh = useCallback(() => {
    dealsCache = null;
    dealsInflight = null;
    dealsInflightStartedAt = 0;
    dealsLastError = null;
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const force = tick > 0;
    setLoading(true);
    if (!force) setError(null);

    loadHomeDeals(force)
      .then((cache) => {
        if (cancelled) return;
        setDealsNow(cache.now);
        setDealsWait(cache.wait);
        setDealsFair(cache.fair ?? []);
        setIsPreview(cache.preview);
        setError(null);
      })
      .catch(() => {
        if (cancelled) return;
        setError(dealsLastError);
        setIsPreview(false);
        if (!dealsCache) {
          setDealsNow([]);
          setDealsWait([]);
          setDealsFair([]);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tick]);

  return (
    <HomeDealsContext.Provider
      value={{
        dealsNow,
        dealsWait,
        dealsFair,
        loading,
        error,
        isPreview,
        refresh,
      }}
    >
      {children}
    </HomeDealsContext.Provider>
  );
}

export function useHomeDeals(): HomeDealsState {
  const ctx = useContext(HomeDealsContext);
  if (!ctx) {
    throw new Error("useHomeDeals must be used within HomeDealsProvider");
  }
  return ctx;
}
