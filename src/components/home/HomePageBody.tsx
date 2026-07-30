"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { CouponHubSection } from "@/components/cupoes/CouponHubSection";
import {
  ConditionFilterPills,
  matchesHomeCondition,
  type HomeConditionFilter,
} from "@/components/home/ConditionFilterPills";
import { HomeAlertsSection } from "@/components/home/HomeAlertsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { StoreLogosSection } from "@/components/home/StoreLogosSection";
import { WhyTrustSection } from "@/components/home/WhyTrustSection";
import { getDealsNow, getDealsWait, summaryToProduct } from "@/lib/api";
import type { Product } from "@/lib/types";

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

/** Homepage abaixo do hero/stats — um único fetch de deals. */
export function HomePageBody() {
  const [buyNow, setBuyNow] = useState<Product[]>([]);
  const [wait, setWait] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [condition, setCondition] = useState<HomeConditionFilter>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nowRes, waitRes] = await Promise.all([
          getDealsNow(24),
          getDealsWait(24),
        ]);
        if (cancelled) return;
        setBuyNow(nowRes.results.map(summaryToProduct));
        setWait(waitRes.results.map(summaryToProduct));
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

  const filteredBuyNow = useMemo(
    () => buyNow.filter((p) => matchesHomeCondition(p.condition, condition)),
    [buyNow, condition],
  );
  const filteredWait = useMemo(
    () => wait.filter((p) => matchesHomeCondition(p.condition, condition)),
    [wait, condition],
  );
  const drops = useMemo(
    () =>
      [...filteredBuyNow, ...filteredWait]
        .filter((p) => (p.dropTodayPct ?? 0) > 0)
        .sort((a, b) => (b.dropTodayPct ?? 0) - (a.dropTodayPct ?? 0))
        .slice(0, 6),
    [filteredBuyNow, filteredWait],
  );

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

      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
        <ConditionFilterPills value={condition} onChange={setCondition} />
      </div>

      <section
        id="comprar-agora"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14 sm:px-6"
      >
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
              Destaque
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              Melhores oportunidades
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-slate-500">
              Produtos em que o Limiar identifica uma oportunidade real face ao histórico —
              não apenas um preço baixo de anúncio.
            </p>
          </div>
          <Link
            href="/catalog/?section=deals"
            className="text-sm font-medium text-sky-700 transition-colors hover:text-sky-900"
          >
            Ver todos ➔
          </Link>
        </div>
        {loading ? (
          <SectionSkeleton />
        ) : filteredBuyNow.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBuyNow.slice(0, 9).map((product) => (
              <OpportunityCard key={product.ean} product={product} compact />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Sem oportunidades com este filtro. Experimenta &quot;Todos&quot; ou explora o
            catálogo.
          </p>
        )}
      </section>

      <HowItWorksSection />
      <WhyTrustSection />
      <StoreLogosSection />
      <HomeAlertsSection />

      <section id="esperar" className="scroll-mt-16 border-t border-slate-200/80 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Vale a pena esperar
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Produtos actualmente acima do valor habitual de mercado.
              </p>
            </div>
            <Link
              href="/catalog/?section=overpriced"
              className="text-sm font-medium text-sky-700 transition-colors hover:text-sky-900"
            >
              Ver todos ➔
            </Link>
          </div>
          {loading ? (
            <SectionSkeleton />
          ) : filteredWait.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredWait.slice(0, 6).map((product) => (
                <OpportunityCard key={product.ean} product={product} compact />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Neste momento não há produtos claramente acima do valor habitual.
            </p>
          )}
        </div>
      </section>

      <section id="quedas" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Maiores quedas</h2>
            <p className="mt-1 text-sm text-slate-500">Variação face ao preço de ontem.</p>
          </div>
          <Link
            href="/catalog/?section=drops"
            className="text-sm font-medium text-sky-700 transition-colors hover:text-sky-900"
          >
            Ver todos ➔
          </Link>
        </div>
        {loading ? (
          <SectionSkeleton />
        ) : drops.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drops.map((product) => (
              <OpportunityCard
                key={`drop-${product.ean}`}
                product={product}
                showDropToday
                compact
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Sem quedas significativas neste momento.</p>
        )}
      </section>

      <CouponHubSection />
    </>
  );
}
