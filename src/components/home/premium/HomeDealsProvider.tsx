"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getDealsNow, getDealsWait, summaryToProduct } from "@/lib/api";
import type { Product } from "@/lib/types";

type HomeDealsState = {
  dealsNow: Product[];
  dealsWait: Product[];
  loading: boolean;
};

const HomeDealsContext = createContext<HomeDealsState | null>(null);

/** Um único fetch partilhado — evita 3× getDealsNow na homepage. */
export function HomeDealsProvider({ children }: { children: ReactNode }) {
  const [dealsNow, setDealsNow] = useState<Product[]>([]);
  const [dealsWait, setDealsWait] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [nowRes, waitRes] = await Promise.all([
          getDealsNow(24),
          getDealsWait(12),
        ]);
        if (cancelled) return;
        setDealsNow(nowRes.results.map(summaryToProduct));
        setDealsWait(waitRes.results.map(summaryToProduct));
      } catch {
        /* keep empty */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <HomeDealsContext.Provider value={{ dealsNow, dealsWait, loading }}>
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
