"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useHomeDeals } from "@/components/home/premium/HomeDealsProvider";
import { formatEUR } from "@/lib/utils";
import type { DecisionSemaphore, Product } from "@/lib/types";
import { MiniSparkline } from "@/components/home/premium/illustrations";

function pickMatching(
  pools: Product[][],
  semaphores: DecisionSemaphore[],
  used: Set<string>,
): Product | null {
  for (const pool of pools) {
    for (const p of pool) {
      if (!p.ean || used.has(p.ean)) continue;
      if (semaphores.includes(p.decision?.semaphore)) {
        used.add(p.ean);
        return p;
      }
    }
  }
  return null;
}

function looksLikeMerchantPromo(text: string): boolean {
  return /pvpr|preço\s*de\s*venda|promoção\s*imediata|%\s*abaixo\s*do/i.test(
    text,
  );
}

function summary(p: Product): string {
  const candidates = [
    p.decision.lymiarIndex?.summary,
    p.decision.reason,
    p.decision.bullets?.[0],
  ];
  for (const c of candidates) {
    const t = (c || "").trim();
    if (t && !looksLikeMerchantPromo(t)) return t;
  }
  const avg = p.avg30d;
  const min = p.historicalMin;
  if (min != null && min > 0 && p.currentPrice <= min * 1.02) {
    return `Perto do mínimo observado (${formatEUR(min)}).`;
  }
  if (avg != null && avg > 0) {
    return `Face à média de 30 dias (${formatEUR(avg)}).`;
  }
  return "Com base no histórico observado.";
}

function histLine(p: Product): string | null {
  const min = p.historicalMin;
  const avg = p.avg30d;
  if (min != null && min > 0) {
    return `Mín. observado ${formatEUR(min)}`;
  }
  if (avg != null && avg > 0) {
    return `Média 30d ${formatEUR(avg)}`;
  }
  return null;
}

function BigCard({
  product,
  tone,
  badge,
  whyLabel,
  emptyHint,
}: {
  product: Product | null;
  tone: "buy" | "wait" | "unknown";
  badge: string;
  whyLabel: string;
  emptyHint: string;
}) {
  const [failed, setFailed] = useState(false);
  const styles =
    tone === "buy"
      ? {
          badge: "bg-[var(--hm-buy-soft)] text-[var(--hm-buy)] ring-green-200",
          btn: "bg-[var(--hm-buy)] hover:bg-green-700 text-white",
          spark: "green" as const,
        }
      : tone === "wait"
        ? {
            badge: "bg-[var(--hm-wait-soft)] text-amber-800 ring-amber-200",
            btn: "bg-[var(--hm-wait)] hover:bg-amber-600 text-white",
            spark: "amber" as const,
          }
        : {
            badge: "bg-slate-100 text-slate-600 ring-slate-200",
            btn: "bg-slate-900 hover:bg-slate-800 text-white",
            spark: "blue" as const,
          };

  const hist = product ? histLine(product) : null;

  return (
    <article className="home-card flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${styles.badge}`}
        >
          {badge}
        </span>
        {product ? (
          <MiniSparkline
            min={product.historicalMin ?? product.currentPrice}
            avg={product.avg30d ?? product.currentPrice}
            current={product.currentPrice}
            max={product.historicalMax ?? product.currentPrice}
            tone={styles.spark}
            className="h-8 w-14"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex aspect-[4/3] items-center justify-center rounded-xl bg-slate-50">
          {product?.imageUrl && !failed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt=""
              loading="lazy"
              className="max-h-full max-w-full object-contain p-4"
              onError={() => setFailed(true)}
            />
          ) : (
            <p className="px-4 text-center text-sm text-slate-400">
              {product ? "Sem imagem" : emptyHint}
            </p>
          )}
        </div>
        {product ? (
          <>
            <h3 className="font-display text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
              {product.name}
            </h3>
            <p className="home-price-pop mt-3 font-display text-3xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-4xl">
              {formatEUR(product.currentPrice)}
            </p>
            {hist ? (
              <p className="mt-1.5 text-sm text-slate-500">{hist}</p>
            ) : null}
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              <span className="font-medium text-slate-700">{whyLabel}</span>{" "}
              {summary(product)}
            </p>
            <div className="mt-auto pt-6">
              <Link
                href={`/p/?id=${encodeURIComponent(product.slug)}`}
                className={`inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold leading-none transition-colors ${styles.btn}`}
              >
                Ver decisão
              </Link>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
              {badge}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {emptyHint}
            </p>
            <div className="mt-auto pt-6">
              <Link
                href="/search/"
                className={`inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-sm font-semibold leading-none transition-colors ${styles.btn}`}
              >
                Ir à pesquisa
              </Link>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/** Três cartões — cada um com um produto que corresponde ao veredicto. */
export function HomeDecisionsPremium() {
  const { dealsNow, dealsWait, dealsFair, loading } = useHomeDeals();

  const { buyOne, waitOne, unknownOne } = useMemo(() => {
    const used = new Set<string>();
    const buyOne = pickMatching([dealsNow], ["buy"], used);
    const waitOne = pickMatching([dealsWait, dealsNow], ["wait"], used);
    const unknownOne = pickMatching(
      [dealsFair, dealsNow, dealsWait],
      ["fair"],
      used,
    );
    return { buyOne, waitOne, unknownOne };
  }, [dealsNow, dealsWait, dealsFair]);

  return (
    <section id="decisoes" className="scroll-mt-20 bg-[var(--hm-bg)]">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
        <div className="max-w-2xl">
          <p className="home-section-kicker text-sm font-semibold uppercase tracking-[0.14em]">
            Decisão
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Três respostas possíveis.{" "}
            <span className="text-[var(--hm-brand)]">Sem teatro.</span>
          </h2>
          <p className="mt-4 text-base text-slate-500 sm:text-lg">
            Cada cartão mostra um produto real com esse veredicto — comprar,
            esperar, ou ainda não sabemos.
          </p>
        </div>
        {loading ? (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[28rem] animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            <BigCard
              product={buyOne}
              tone="buy"
              badge="Vale a pena comprar"
              whyLabel="Porque recomendamos:"
              emptyHint="Neste momento não há um produto com veredicto de comprar para mostrar."
            />
            <BigCard
              product={waitOne}
              tone="wait"
              badge="Espera mais um pouco"
              whyLabel="O histórico sugere:"
              emptyHint="Neste momento não há um produto com veredicto de esperar para mostrar."
            />
            <BigCard
              product={unknownOne}
              tone="unknown"
              badge="Ainda não sabemos"
              whyLabel="O que vemos:"
              emptyHint="Quando o histórico é curto, não inventamos certeza — pesquisa um produto concreto."
            />
          </div>
        )}
      </div>
    </section>
  );
}
