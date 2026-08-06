import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { CategoryPage } from "@/components/categoria/CategoryPage";
import { CATEGORY_STATIC_SLUGS } from "@/lib/category-slugs";
import { SITE_URL } from "@/lib/constants";
import "@/components/catalogo/catalog-premium.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return CATEGORY_STATIC_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const label = slug.replace(/_/g, " ");
  const path = `/categoria/${slug}/`;
  const title = `${label} — preços e histórico`;
  const description = `Compare preços de ${label} nas principais lojas portuguesas. Consulte histórico de preços, ofertas, promoções e disponibilidade no Lymiar.`;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: `${title} | Lymiar`,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Lymiar",
      locale: "pt_PT",
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og-default.png`,
          width: 1200,
          height: 630,
          alt: "Lymiar",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Lymiar`,
      description,
      images: [`${SITE_URL}/og-default.png`],
    },
  };
}

export default async function CategoriaSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <div className="catalog-premium">
      <SiteHeader />
      <div className="border-b border-[var(--hm-line)] bg-[var(--hm-bg-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:max-w-7xl">
          <SearchBar />
        </div>
      </div>
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-4 py-10 lg:max-w-7xl">
            <div className="h-40 animate-pulse rounded-2xl bg-[var(--hm-bg-soft)]" />
          </main>
        }
      >
        <CategoryPage slug={slug} />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
