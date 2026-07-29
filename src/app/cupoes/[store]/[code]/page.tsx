import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CouponDetailClient } from "@/components/cupoes/CouponDetailClient";
import { COUPON_HUB_STORES, KNOWN_COUPON_CODES } from "@/lib/mocks";

type PageProps = {
  params: Promise<{ store: string; code: string }>;
};

export function generateStaticParams() {
  return COUPON_HUB_STORES.flatMap((s) =>
    KNOWN_COUPON_CODES.map((code) => ({ store: s.slug, code })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { store, code } = await params;
  const meta = COUPON_HUB_STORES.find((s) => s.slug === store);
  if (!meta) return { title: "Cupão" };
  return {
    title: `Cupão ${code.toUpperCase()} · ${meta.name}`,
    description: `Produtos elegíveis para o cupão ${code.toUpperCase()} na ${meta.name}.`,
  };
}

export default async function CouponCodePage({ params }: PageProps) {
  const { store, code } = await params;
  const meta = COUPON_HUB_STORES.find((s) => s.slug === store);
  if (!meta) notFound();

  return (
    <CouponDetailClient store={store} storeName={meta.name} code={code.toUpperCase()} />
  );
}
