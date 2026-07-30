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
import { LatestDetectedSection } from "@/components/home/LatestDetectedSection";
import { StoreLogosSection } from "@/components/home/StoreLogosSection";
import { WhyTrustSection } from "@/components/home/WhyTrustSection";
import {
  getDealsNow,
  getDealsWait,
  getTelegramDeals,
  summaryToProduct,
} from "@/lib/api";
import type { Product } from "@/lib/types";

function SectionSkeleton({ n = 3 }: { n?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: n }).map((_, i) => (
        <div
          key={i}
          className="h-80 animate-pulse rounded-2xl border border-slate-200/70 bg-slate-100"
        />
      ))}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  href,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">
            {eyebrow}
          </p>
        ) : null}
        <h2
          className={`font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl ${
            eyebrow ? "mt-1.5" : ""
          }`}
        >
          {title}
        </h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>
      </div>
      <Link
        href={href}
        className="text-sm font-medium text-sky-700 transition-colors duration-150 hover:text-sky-900"
      >
        Ver todos ➔
      </Link>
    </div>
  );
}

function takeUnique(products: Product[], used: Set<string>, limit: number): Product[] {
  const out: Product[] = [];
  for (const p of products) {
    if (!p.ean || used.has(p.ean)) continue;
    used.add(p.ean);
    out.push(p);
    if (out.length >= limit) break;
  }
  return out;
}

/** Homepage abaixo do hero/stats — um único ciclo de fetch de deals. */
export function HomePageBody() {
  const [buyNow, setBuyNow] = useState<Product[]>([]);
  const [wait, setWait] = useState<Product[]>([]);
  const [telegram, setTelegram] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [condition, setCondition] = useState<HomeConditionFilter>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [nowRes, waitRes, tgRes] = await Promise.all([
          getDealsNow(24),
          getDealsWait(24),
          getTelegramDeals(18, 72).catch(() => ({ results: [] as never[] })),
        ]);
        if (cancelled) return;
        setBuyNow(nowRes.results.map(summaryToProduct));
        setWait(waitRes.results.map(summaryToProduct));
        setTelegram(
          (tgRes.results ?? [])
            .filter((s) => s.sentToTelegram !== false)
            .map(summaryToProduct),
        );
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
  const filteredTelegram = useMemo(
    () => telegram.filter((p) => matchesHomeCondition(p.condition, condition)),
    [telegram, condition],
  );

  const { featured, latestDetected, waitUnique, dropsUnique } = useMemo(() => {
    const used = new Set<string>();
    const featured = takeUnique(filteredBuyNow, used, 9);
    const latestDetected = takeUnique(filteredTelegram, used, 6);
    const waitUnique = takeUnique(filteredWait, used, 6);
    const dropPool = [...filteredBuyNow, ...filteredWait]
      .filter((p) => (p.dropTodayPct ?? 0) > 0)
      .sort((a, b) => (b.dropTodayPct ?? 0) - (a.dropTodayPct ?? 0));
    const dropsUnique = takeUnique(dropPool, used, 6);
    return { featured, latestDetected, waitUnique, dropsUnique };
  }, [filteredBuyNow, filteredWait, filteredTelegram]);

  return (
    <>
      {error ? (
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Não foi possível carregar as oportunidades neste momento. Tenta novamente dentro
            de instantes.
          </p>
        </div>
      ) : null}

      <div className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-2 sm:px-6">
          <ConditionFilterPills value={condition} onChange={setCondition} />
        </div>
      </div>

      <section id="comprar-agora" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <SectionHeading
            eyebrow="Destaque"
            title="Melhores oportunidades"
            subtitle="Produtos em que o Limiar identifica uma oportunidade real face ao histórico — não apenas um preço baixo de anúncio."
            href="/catalog/?section=deals"
          />
          {loading ? (
            <SectionSkeleton />
          ) : featured.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <OpportunityCard key={product.ean} product={product} compact />
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-slate-500">
              Sem oportunidades com este filtro. Experimenta &quot;Todos&quot; ou explora o
              catálogo.
            </p>
          )}
        </div>
      </section>

      <LatestDetectedSection products={latestDetected} loading={loading} />

      <HowItWorksSection />
      <WhyTrustSection />
      <StoreLogosSection />
      <HomeAlertsSection />

      <section id="esperar" className="scroll-mt-16 border-t border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            title="Vale a pena esperar"
            subtitle="Produtos actualmente acima do valor habitual de mercado."
            href="/catalog/?section=overpriced"
          />
          {loading ? (
            <SectionSkeleton />
          ) : waitUnique.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {waitUnique.map((product) => (
                <OpportunityCard key={product.ean} product={product} compact />
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-slate-500">
              Neste momento não há produtos claramente acima do valor habitual.
            </p>
          )}
        </div>
      </section>

      <section
        id="quedas"
        className="scroll-mt-16 border-t border-slate-200/60 bg-[#FAFAFA]"
      >
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            title="Maiores quedas"
            subtitle="Variação face ao preço de ontem."
            href="/catalog/?section=drops"
          />
          {loading ? (
            <SectionSkeleton />
          ) : dropsUnique.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {dropsUnique.map((product) => (
                <OpportunityCard
                  key={`drop-${product.ean}`}
                  product={product}
                  showDropToday
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="text-[15px] text-slate-500">
              Sem quedas significativas neste momento.
            </p>
          )}
        </div>
      </section>

      <CouponHubSection />
    </>
  );
}
