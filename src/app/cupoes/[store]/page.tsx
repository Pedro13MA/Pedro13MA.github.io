import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CouponStoreClient } from "@/components/cupoes/CouponStoreClient";
import { COUPON_HUB_STORES } from "@/lib/coupon-stores";

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

  return <CouponStoreClient store={store} storeName={meta.name} />;
}
