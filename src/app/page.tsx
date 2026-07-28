import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { OpportunityCard } from "@/components/product/OpportunityCard";
import { PromotionCard } from "@/components/product/PromotionCard";
import { getActivePromotions, getDailyOpportunities } from "@/lib/mock-data";

export default function HomePage() {
  const opportunities = getDailyOpportunities();
  const promotions = getActivePromotions();

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
              Devo comprar agora ou esperar?
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-500 sm:text-lg">
              Price intelligence para o mercado português — histórico, multi-loja e semáforo de
              decisão num só sítio.
            </p>
            <div className="mt-10 max-w-2xl">
              <SearchBar autoFocus />
            </div>
          </div>
        </section>

        <section id="oportunidades" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Oportunidades do Dia
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Mínimos históricos e maiores quedas face à média de 30 dias.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((product) => (
              <OpportunityCard key={product.slug} product={product} />
            ))}
          </div>
        </section>

        <section id="cupoes" className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Cupões & Promoções Ativas
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Vouchers AWIN com código explícito priorizados.
              </p>
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
