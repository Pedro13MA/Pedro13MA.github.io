import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import { CategoryPage } from "@/components/categoria/CategoryPage";
import { CATEGORY_STATIC_SLUGS } from "@/lib/category-slugs";
import { SITE_URL } from "@/lib/constants";

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
  const description = `Compare preços de ${label} nas principais lojas portuguesas. Consulte histórico de preços, ofertas, promoções e disponibilidade no Limiar.`;
  return {
    title,
    description,
    robots: { index: true, follow: true },
    alternates: { canonical: `${SITE_URL}${path}` },
    openGraph: {
      title: `${title} | Limiar`,
      description,
      url: `${SITE_URL}${path}`,
      siteName: "Limiar",
      locale: "pt_PT",
      type: "website",
      images: [{ url: `${SITE_URL}/og-default.svg` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Limiar`,
      description,
    },
  };
}

export default async function CategoriaSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <>
      <SiteHeader />
      <div className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <SearchBar />
        </div>
      </div>
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          </main>
        }
      >
        <CategoryPage slug={slug} />
      </Suspense>
      <SiteFooter />
    </>
  );
}
