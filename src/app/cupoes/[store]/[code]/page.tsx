import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CouponDetailClient } from "@/components/cupoes/CouponDetailClient";
import { getCoupons } from "@/lib/api";
import { COUPON_HUB_STORES, getCouponStoreMeta } from "@/lib/coupon-stores";
import { normalizeCouponStoreSlug } from "@/lib/coupon-utils";

type PageProps = {
  params: Promise<{ store: string; code: string }>;
};

export async function generateStaticParams() {
  try {
    const hub = await getCoupons();
    const params = (hub.coupons || [])
      .filter((c) => c.code && String(c.code).trim())
      .map((c) => ({
        store: normalizeCouponStoreSlug(c.storeSlug || c.storeCode),
        code: String(c.code).trim().toUpperCase(),
      }));
    if (params.length) return params;
  } catch {
    // API indisponível no build — fallback mínimo
  }
  return COUPON_HUB_STORES.map((s) => ({ store: s.slug, code: "CAMPANHA" }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { store, code } = await params;
  const meta = getCouponStoreMeta(store);
  if (!meta) return { title: "Cupão" };
  return {
    title: `Cupão ${code.toUpperCase()} · ${meta.name}`,
    description: `Produtos elegíveis para o cupão ${code.toUpperCase()} na ${meta.name}.`,
  };
}

export default async function CouponCodePage({ params }: PageProps) {
  const { store, code } = await params;
  const meta = getCouponStoreMeta(store);
  if (!meta) notFound();

  return (
    <CouponDetailClient store={store} storeName={meta.name} code={code.toUpperCase()} />
  );
}
