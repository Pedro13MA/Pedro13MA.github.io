import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { PromotionCard } from "@/components/product/PromotionCard";
import { COUPON_HUB_STORES, getPromotionsByStore } from "@/lib/mocks";

type PageProps = {
  params: Promise<{ store: string }>;
};

export function generateStaticParams() {
  return COUPON_HUB_STORES.map((s) => ({ store: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { store } = await params;
  const meta = COUPON_HUB_STORES.find((s) => s.slug === store);
  if (!meta) return { title: "Cupões" };
  return {
    title: `Cupões ${meta.name}`,
    description: `Hub de cupões validados Limiar para ${meta.name}.`,
  };
}

export default async function CouponStorePage({ params }: PageProps) {
  const { store } = await params;
  const meta = COUPON_HUB_STORES.find((s) => s.slug === store);
  if (!meta) notFound();

  const promotions = getPromotionsByStore(store);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/#cupoes" className="hover:text-slate-800">
            Hub de Cupões
          </Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{meta.name}</span>
        </nav>

        <h1 className="font-display text-3xl font-bold text-slate-900">
          Cupões {meta.name}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-500">
          Vouchers validados com código explícito priorizados. Dados mock alinhados à AWIN
          Promotions API.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.length > 0 ? (
            promotions.map((promo) => (
              <PromotionCard key={promo.externalId} promotion={promo} />
            ))
          ) : (
            <p className="text-sm text-slate-500">Sem cupões ativos para esta loja neste momento.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
