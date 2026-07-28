import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProductPageClient } from "@/components/product/ProductPageClient";
import { getDealsNow, getDealsWait } from "@/lib/api";
import { MOCK_PRODUCTS } from "@/lib/mocks";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = new Set<string>();
  for (const p of MOCK_PRODUCTS) {
    slugs.add(p.slug);
    slugs.add(p.ean);
  }
  try {
    const [now, wait] = await Promise.all([getDealsNow(30), getDealsWait(30)]);
    for (const r of [...now.results, ...wait.results]) {
      slugs.add(r.slug);
      slugs.add(r.ean);
    }
  } catch {
    // Build sem API — mantém mocks
  }
  return Array.from(slugs).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: slug,
    description: "Detalhe de produto Limiar — Índice Limiar e histórico de preço.",
  };
}

export default async function ProductSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <>
      <SiteHeader />
      <ProductPageClient slug={slug} />
      <SiteFooter />
    </>
  );
}
