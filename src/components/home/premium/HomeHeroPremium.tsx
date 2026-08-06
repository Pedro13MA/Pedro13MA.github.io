"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { HomeSearchBar } from "@/components/home/premium/HomeSearchBar";
import { useHomeDeals } from "@/components/home/premium/HomeDealsProvider";
import { formatEUR } from "@/lib/utils";
import type { DecisionSemaphore, Product } from "@/lib/types";

const EXPLORE = [
  { href: "/categoria/informatica/", label: "Informática" },
  { href: "/categoria/gaming/", label: "Gaming" },
  { href: "/categoria/telemoveis/", label: "Telemóveis" },
  { href: "/categoria/casa/", label: "Casa" },
  { href: "/mercado/", label: "Mercado" },
  { href: "/#cupoes", label: "Cupões" },
] as const;

function semaphoreDot(sem: DecisionSemaphore | undefined): string {
  if (sem === "buy") return "bg-[var(--hm-buy)]";
  if (sem === "wait") return "bg-[var(--hm-wait)]";
  return "bg-slate-400";
}

function semaphoreLabel(sem: DecisionSemaphore | undefined): string {
  if (sem === "buy") return "Comprar";
  if (sem === "wait") return "Esperar";
  return "Ver";
}

function ProductShot({
  product,
  delayMs,
  featured,
}: {
  product: Product;
  delayMs: number;
  featured?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const sem = product.decision?.semaphore;

  return (
    <Link
      href={`/p/?id=${encodeURIComponent(product.slug)}`}
      className={`home-shot home-shot-float group relative block overflow-hidden rounded-2xl ${
        featured ? "sm:col-span-2 sm:row-span-2" : ""
      }`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className={featured ? "aspect-square sm:aspect-auto sm:h-full" : "aspect-square"}>
        {product.imageUrl && !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-contain bg-white p-3 sm:p-4"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full min-h-[7rem] items-center justify-center bg-slate-100 px-3 text-center text-xs text-slate-400">
            {product.name.slice(0, 28)}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-transparent px-3 pb-3 pt-12">
        <p className="line-clamp-1 text-[11px] font-medium text-white/70 sm:text-xs">
          {product.brand || product.category || "Lymiar"}
        </p>
        <div className="mt-1 flex items-end justify-between gap-2">
          <span className="font-display text-base font-bold tabular-nums text-white sm:text-lg">
            {formatEUR(product.currentPrice)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm sm:text-[11px]">
            <span className={`h-1.5 w-1.5 rounded-full ${semaphoreDot(sem)}`} />
            {semaphoreLabel(sem)}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MosaicSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3">
      <div className="aspect-square animate-pulse rounded-2xl bg-white/10 sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:min-h-[20rem]" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="aspect-square animate-pulse rounded-2xl bg-white/10" />
      ))}
    </div>
  );
}

export function HomeHeroPremium() {
  const { dealsNow, loading, error, refresh, isPreview } = useHomeDeals();
  const shots = useMemo(() => dealsNow.slice(0, 5), [dealsNow]);

  return (
    <section className="home-hero">
      <div className="relative mx-auto max-w-6xl px-4 pb-14 pt-12 sm:px-6 sm:pb-16 sm:pt-16 lg:max-w-7xl lg:pb-20 lg:pt-20">
        <div className="home-fade mx-auto max-w-3xl text-center">
          <p className="home-hero-brand font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Lymiar
          </p>
          <h1 className="mt-4 font-display text-[2.1rem] font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
            Vale a pena comprar hoje?
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
            Encontra o momento certo — com histórico real, não com promoções
            inventadas.
          </p>

          <div className="mx-auto mt-8 max-w-2xl sm:mt-10">
            <HomeSearchBar autoFocus />
          </div>

          <nav
            aria-label="Explorar"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-1 gap-y-2 text-sm"
          >
            {EXPLORE.map((item, i) => (
              <span key={item.href} className="inline-flex items-center">
                {i > 0 ? (
                  <span className="mx-2 text-white/25" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Link href={item.href} className="home-explore-link font-medium">
                  {item.label}
                </Link>
              </span>
            ))}
          </nav>
        </div>

        <div
          className="home-fade-delay mt-12 sm:mt-14"
          data-deals={loading ? "loading" : error ? "error" : `ok-${shots.length}`}
        >
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--hm-brand)]">
                Agora no radar
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {isPreview
                  ? "Pré-visualização local — dados de exemplo enquanto a API está offline."
                  : "Clica num produto e vê se é momento de comprar."}
              </p>
            </div>
            <Link
              href="/search/"
              className="hidden items-center gap-1.5 text-sm font-semibold text-[#ffb087] hover:text-white sm:inline-flex"
            >
              Ver todos
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {shots.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3">
              {shots.map((p, i) => (
                <ProductShot
                  key={p.ean}
                  product={p}
                  delayMs={60 + i * 70}
                  featured={i === 0}
                />
              ))}
            </div>
          ) : loading ? (
            <MosaicSkeleton />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center backdrop-blur-sm">
              <p className="text-sm text-slate-300">
                {error
                  ? "Não foi possível carregar oportunidades agora."
                  : "Sem oportunidades para mostrar de momento."}
              </p>
              <button
                type="button"
                onClick={refresh}
                className="mt-4 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--hm-brand)] px-5 text-sm font-bold text-white hover:bg-[var(--hm-brand-deep)]"
              >
                Tentar de novo
              </button>
            </div>
          )}
        </div>

        <div className="home-fade-delay-2 mt-10 flex flex-wrap items-center justify-center gap-3 sm:mt-12">
          <Link
            href="/#decisoes"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-sm font-bold text-slate-900 hover:bg-orange-50"
          >
            Ver decisões de hoje
          </Link>
          <Link
            href="/categorias/"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white hover:bg-white/10"
          >
            Explorar categorias
          </Link>
        </div>
      </div>
    </section>
  );
}
