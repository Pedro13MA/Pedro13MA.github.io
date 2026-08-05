"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDealsNow, getDealsWait, summaryToProduct } from "@/lib/api";
import { formatEUR } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { MiniSparkline } from "@/components/home/premium/illustrations";

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

function summary(p: Product): string {
  const raw =
    p.decision.lymiarIndex?.summary || p.decision.reason || p.decision.bullets?.[0] || "";
  const t = raw.trim();
  return t || "Com base no histórico observado.";
}

function BigCard({
  product,
  tone,
  badge,
  whyLabel,
}: {
  product: Product | null;
  tone: "buy" | "wait" | "unknown";
  badge: string;
  whyLabel: string;
}) {
  const [failed, setFailed] = useState(false);
  const styles =
    tone === "buy"
      ? {
          badge: "bg-green-50 text-green-700 ring-green-200",
          btn: "bg-green-600 hover:bg-green-700 text-white",
          spark: "green" as const,
        }
      : tone === "wait"
        ? {
            badge: "bg-amber-50 text-amber-800 ring-amber-200",
            btn: "bg-amber-500 hover:bg-amber-600 text-white",
            spark: "amber" as const,
          }
        : {
            badge: "bg-slate-100 text-slate-600 ring-slate-200",
            btn: "bg-slate-900 hover:bg-slate-800 text-white",
            spark: "blue" as const,
          };

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
              {tone === "unknown"
                ? "Precisamos de mais histórico"
                : "Sem imagem"}
            </p>
          )}
        </div>
        {product ? (
          <>
            <h3 className="font-display text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
              {product.name}
            </h3>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatEUR(product.currentPrice)}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              <span className="font-medium text-slate-700">{whyLabel}</span>{" "}
              {summary(product)}
            </p>
            <Link
              href={`/p/?id=${encodeURIComponent(product.slug)}`}
              className={`mt-6 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors ${styles.btn}`}
            >
              Ver produto
            </Link>
          </>
        ) : (
          <>
            <h3 className="font-display text-lg font-semibold text-slate-900 sm:text-xl">
              Ainda não sabemos
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              Quando o histórico é curto, não inventamos uma recomendação.
              Pesquisa um produto concreto para ver a evidência disponível.
            </p>
            <Link
              href="/search/"
              className={`mt-6 inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm font-semibold transition-colors ${styles.btn}`}
            >
              Ir à pesquisa
            </Link>
          </>
        )}
      </div>
    </article>
  );
}

/** “O que diz o histórico?” — 3 cartões grandes. */
export function HomeDecisionsPremium() {
  const [buy, setBuy] = useState<Product[]>([]);
  const [wait, setWait] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      try {
        const [a, b] = await Promise.all([getDealsNow(12), getDealsWait(12)]);
        if (c) return;
        setBuy(a.results.map(summaryToProduct));
        setWait(b.results.map(summaryToProduct));
      } catch {
        /* keep empty */
      } finally {
        if (!c) setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, []);

  const { buyOne, waitOne } = useMemo(() => {
    const used = new Set<string>();
    return {
      buyOne: takeUnique(buy, used, 1)[0] ?? null,
      waitOne: takeUnique(wait, used, 1)[0] ?? null,
    };
  }, [buy, wait]);

  return (
    <section id="decisoes" className="scroll-mt-20 bg-slate-50">
      <div className="home-fade mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl">
        <p className="text-sm font-semibold text-blue-600">Evidência</p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          O que diz o histórico?
        </h2>
        <p className="mt-4 max-w-2xl text-base text-slate-500">
          Três leituras possíveis — comprar, esperar, ou admitir que ainda não há
          dados suficientes.
        </p>
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
              badge="🟢 Vale a pena comprar"
              whyLabel="Porque recomendamos:"
            />
            <BigCard
              product={waitOne}
              tone="wait"
              badge="🟡 Espera mais um pouco"
              whyLabel="O histórico sugere:"
            />
            <BigCard
              product={null}
              tone="unknown"
              badge="⚪ Ainda não sabemos"
              whyLabel=""
            />
          </div>
        )}
      </div>
    </section>
  );
}
