"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { PromotionCard } from "@/components/product/PromotionCard";
import {
  getDealsNow,
  getDealsWait,
  getStorePromotions,
  mapPromotion,
  summaryToProduct,
} from "@/lib/api";
import { COUPON_HUB_STORES } from "@/lib/mocks";
import type { Product, Promotion } from "@/lib/types";

function SectionSkeleton({ n = 3 }: { n?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="h-72 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100"
        />
      ))}
    </div>
  );
}

export function HomeLiveSections() {
  const [buyNow, setBuyNow] = useState<Product[]>([]);
  const [wait, setWait] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nowRes, waitRes, worten, globaldata] = await Promise.all([
          getDealsNow(24),
          getDealsWait(24),
          getStorePromotions("worten", 4).catch(() => ({ results: [] as never[] })),
          getStorePromotions("globaldata", 4).catch(() => ({ results: [] as never[] })),
        ]);
        if (cancelled) return;
        setBuyNow(nowRes.results.map(summaryToProduct));
        setWait(waitRes.results.map(summaryToProduct));
        const promos = [...worten.results, ...globaldata.results]
          .map(mapPromotion)
          .slice(0, 8);
        setPromotions(promos);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Falha ao contactar a API Limiar");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const drops = [...buyNow, ...wait]
    .filter((p) => (p.dropTodayPct ?? 0) > 0)
    .sort((a, b) => (b.dropTodayPct ?? 0) - (a.dropTodayPct ?? 0))
    .slice(0, 6);

  return (
    <>
      {error ? (
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Não foi possível carregar as oportunidades neste momento. Tenta novamente dentro
            de instantes.
          </p>
        </div>
      ) : null}

      <section id="comprar-agora" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">🔥 Comprar Agora</h2>
          <p className="mt-1 text-sm text-slate-500">
            Super Oportunidades — Produtos em Mínimo Histórico e melhores preços do dia.
          </p>
        </div>
        {loading ? (
          <SectionSkeleton />
        ) : buyNow.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {buyNow.map((product) => (
              <OpportunityCard key={product.ean} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Sem super promoções no momento. Explora o catálogo ou cria um alerta de preço para
            seres notificado!
          </p>
        )}
      </section>

      <section id="esperar" className="border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              ⏳ Vale a Pena Esperar
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Vale a Pena Esperar — Produtos atualmente acima do valor normal de mercado.
            </p>
          </div>
          {loading ? (
            <SectionSkeleton />
          ) : wait.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wait.map((product) => (
                <OpportunityCard key={product.ean} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Neste momento não há produtos claramente acima do valor habitual.
            </p>
          )}
        </div>
      </section>

      <section id="quedas" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-slate-900">
            📉 Maiores Quedas de Hoje
          </h2>
          <p className="mt-1 text-sm text-slate-500">Variação face ao preço de ontem.</p>
        </div>
        {loading ? (
          <SectionSkeleton />
        ) : drops.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drops.map((product) => (
              <OpportunityCard key={`drop-${product.ean}`} product={product} showDropToday />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Sem quedas significativas registadas hoje.</p>
        )}
      </section>

      <section id="cupoes" className="border-t border-slate-200/80 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              🎟️ Hub de Cupões Validados
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Atalhos por loja — Worten e Globaldata em destaque.
            </p>
          </div>
          <div className="mb-8 flex flex-wrap gap-3">
            {COUPON_HUB_STORES.map((store) => (
              <Link
                key={store.slug}
                href={store.href}
                className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition-all hover:shadow-md"
              >
                {store.name}
              </Link>
            ))}
          </div>
          {loading ? (
            <SectionSkeleton n={4} />
          ) : promotions.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {promotions.map((promo) => (
                <PromotionCard key={promo.externalId} promotion={promo} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Sem cupões extra ativos no momento — o valor apresentado é o preço direto na
              loja.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
