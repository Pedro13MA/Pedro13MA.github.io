import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { PromotionCard } from "@/components/product/PromotionCard";
import { Badge } from "@/components/ui/badge";
import {
  COUPON_HUB_STORES,
  getActivePromotions,
  getBiggestDropsToday,
  getBuyNowProducts,
  getWaitProducts,
} from "@/lib/mocks";

export default function HomePage() {
  const buyNow = getBuyNowProducts();
  const wait = getWaitProducts();
  const drops = getBiggestDropsToday();
  const promotions = getActivePromotions().slice(0, 4);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-blue-50/30">
          <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-sky-700">
              Limiar
            </p>
            <h1 className="font-display max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
              A plataforma que diz quando vale realmente a pena comprar.
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-500 sm:text-lg">
              Índice Limiar 0–100, histórico factual e comparação multi-loja — sem previsões, só
              dados.
            </p>
            <div className="mt-10 max-w-2xl">
              <SearchBar autoFocus />
            </div>
          </div>
        </section>

        <section id="comprar-agora" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              🔥 Comprar Agora
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Mínimo histórico com Índice Limiar &gt; 85.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {buyNow.map((product) => (
              <OpportunityCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section
          id="esperar"
          className="border-t border-slate-200/80 bg-white"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                ⏳ Vale a Pena Esperar
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Produtos populares atualmente acima do preço habitual (Índice Limiar &lt; 50).
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {wait.map((product) => (
                <OpportunityCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section id="quedas" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              📉 Maiores Quedas de Hoje
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Variação face ao preço de ontem (dados mock).
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {drops.map((product) => (
              <OpportunityCard key={product.slug} product={product} showDropToday />
            ))}
          </div>
        </section>

        <section id="cupoes" className="border-t border-slate-200/80 bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                🎟️ Hub de Cupões Validados
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Atalhos por loja — códigos AWIN com prioridade a vouchers explícitos.
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
                  <Badge variant="teal" className="ml-2">
                    /cupoes/{store.slug}
                  </Badge>
                </Link>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {promotions.map((promo) => (
                <PromotionCard key={promo.externalId} promotion={promo} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
