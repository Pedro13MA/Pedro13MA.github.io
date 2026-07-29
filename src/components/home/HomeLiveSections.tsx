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
import {
  getDealsNow,
  getDealsWait,
  summaryToProduct,
} from "@/lib/api";
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

type Props = {
  /** EANs já visíveis no carrossel Telegram — excluídos de Super Oportunidades. */
  excludeEans?: string[];
};

export function HomeLiveSections({ excludeEans = [] }: Props) {
  const [buyNow, setBuyNow] = useState<Product[]>([]);
  const [wait, setWait] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [condition, setCondition] = useState<HomeConditionFilter>("all");

  const excludeSet = useMemo(() => new Set(excludeEans), [excludeEans]);

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
    () =>
      buyNow.filter(
        (p) =>
          matchesHomeCondition(p.condition, condition) && !excludeSet.has(p.ean),
      ),
    [buyNow, condition, excludeSet],
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

      <section id="comprar-agora" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 scroll-mt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              🔥 Super Oportunidades
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Produtos em Mínimo Histórico e melhores preços do dia.
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
            {filteredBuyNow.map((product) => (
              <OpportunityCard key={product.ean} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Sem super promoções com este filtro. Experimenta &quot;Todos&quot; ou explora o
            catálogo.
          </p>
        )}
      </section>

      <section id="esperar" className="border-t border-slate-200/80 bg-white scroll-mt-16">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900">
                ⏳ Vale a Pena Esperar
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Produtos atualmente acima do valor normal de mercado.
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
              {filteredWait.map((product) => (
                <OpportunityCard key={product.ean} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Neste momento não há produtos claramente acima do valor habitual com este filtro.
            </p>
          )}
        </div>
      </section>

      <section id="quedas" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 scroll-mt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">
              📉 Maiores Quedas
            </h2>
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
              <OpportunityCard key={`drop-${product.ean}`} product={product} showDropToday />
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Sem quedas significativas com este filtro.</p>
        )}
      </section>

      <CouponHubSection />
    </>
  );
}
