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
import { getDealsNow, getDealsWait, summaryToProduct } from "@/lib/api";
import { TELEGRAM_CHANNEL } from "@/lib/constants";
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

function DecisionHeading({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        <h3 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>
      </div>
      {href ? (
        <Link
          href={href}
          className="text-sm font-medium text-sky-700 transition-colors duration-150 hover:text-sky-900"
        >
          Ver todos →
        </Link>
      ) : null}
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

/** Homepage: decisões de compra — não feed de deals. */
export function HomePageBody({
  decisionsOnly = false,
}: {
  /** FASE 7.20 — omitir Telegram/cupões quando a homepage nova já os mostra. */
  decisionsOnly?: boolean;
}) {
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

  const { buyUnique, waitUnique } = useMemo(() => {
    const used = new Set<string>();
    const buyUnique = takeUnique(filteredBuyNow, used, 6);
    const waitUnique = takeUnique(filteredWait, used, 6);
    return { buyUnique, waitUnique };
  }, [filteredBuyNow, filteredWait]);

  return (
    <>
      {error ? (
        <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
          <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Não foi possível carregar as decisões neste momento. Tenta novamente dentro de
            instantes.
          </p>
        </div>
      ) : null}

      <section id="decisoes" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Decisões de compra
            </h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">
              Comprar agora, esperar, ou ainda não sabemos — com base no histórico observado.
            </p>
          </div>

          <ConditionFilterPills
            value={condition}
            onChange={setCondition}
            className="mb-12"
          />

          <div id="comprar-agora" className="scroll-mt-16">
            <DecisionHeading
              title="Comprar agora"
              subtitle="Produtos em que o preço actual parece uma oportunidade face ao histórico."
              href="/catalog/?section=deals"
            />
            {loading ? (
              <SectionSkeleton />
            ) : buyUnique.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {buyUnique.map((product) => (
                  <OpportunityCard key={product.ean} product={product} compact />
                ))}
              </div>
            ) : (
              <p className="text-[15px] text-slate-500">
                Sem oportunidades claras com este filtro. Experimenta &quot;Todos&quot; ou
                pesquisa um produto.
              </p>
            )}
          </div>

          <div id="esperar" className="mt-20 scroll-mt-16 border-t border-slate-200/60 pt-16">
            <DecisionHeading
              title="Esperar"
              subtitle="Produtos em que comprar agora não parece a melhor opção."
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

          <div
            id="dados-insuficientes"
            className="mt-20 scroll-mt-16 border-t border-slate-200/60 pt-16"
          >
            <DecisionHeading
              title="Sem dados suficientes"
              subtitle="Quando o histórico é curto, o Limiar não inventa uma recomendação."
            />
            <div className="rounded-2xl border border-slate-200/80 bg-[#FAFAFA] px-6 py-8 sm:px-8">
              <p className="max-w-2xl text-[15px] leading-relaxed text-slate-600">
                Ainda não sabemos se o preço é bom no tempo. Em vez de forçar um veredicto,
                dizemos-te quando a amostra observada é insuficiente — e convidamos-te a
                voltar quando houver mais histórico.
              </p>
              <p className="mt-4 text-sm text-slate-500">
                Pesquisa um produto concreto para veres a decisão e a evidência disponíveis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {decisionsOnly ? null : (
        <>
          <section className="border-t border-slate-200/60 bg-[#FAFAFA]">
            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
              <div className="grid items-center gap-8 rounded-2xl border border-sky-100 bg-white px-6 py-8 sm:px-10 sm:py-10 md:grid-cols-[1.4fr_auto]">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Acompanhar no Telegram
                  </h2>
                  <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-500">
                    Oportunidades publicadas no canal Limiar — útil se quiseres um ritmo rápido,
                    sem substituir a decisão na página do produto.
                  </p>
                </div>
                <a
                  href={TELEGRAM_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-sky-700 px-8 text-sm font-semibold text-white transition-colors duration-150 hover:bg-sky-800 md:w-auto"
                >
                  Abrir Telegram
                </a>
              </div>
            </div>
          </section>

          <CouponHubSection />
        </>
      )}
    </>
  );
}
