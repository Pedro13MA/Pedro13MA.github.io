"use client";

import { useEffect, useState } from "react";
import { HomeLiveSections } from "@/components/home/HomeLiveSections";
import { TelegramAlertsCarousel } from "@/components/home/TelegramAlertsCarousel";
import { getTelegramDeals, summaryToProduct } from "@/lib/api";
import type { Product } from "@/lib/types";

/**
 * Carrega alertas Telegram uma vez e partilha EANs com Super Oportunidades
 * para evitar duplicados na homepage.
 */
export function HomeTelegramAndDeals() {
  const [telegramProducts, setTelegramProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getTelegramDeals(12, 36)
      .then((res) => {
        if (cancelled) return;
        setTelegramProducts(
          res.results
            .filter((s) => s.sentToTelegram !== false)
            .map(summaryToProduct)
            .slice(0, 12),
        );
      })
      .catch(() => {
        if (!cancelled) setTelegramProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const excludeEans = telegramProducts.map((p) => p.ean);

  return (
    <>
      <TelegramAlertsCarousel products={telegramProducts} loading={loading} />
      <HomeLiveSections excludeEans={excludeEans} />
    </>
  );
}
