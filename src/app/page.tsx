import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { HomePageClient } from "@/components/home/v2/HomePageClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Limiar — Quando vale realmente a pena comprar",
  description:
    "Descobre oportunidades com histórico observado: descontos, categorias, marcas, lojas e cupões. Comprar agora, esperar, ou ainda não sabemos.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Limiar — Quando vale realmente a pena comprar",
    description:
      "Centro de descoberta com preços e histórico observados em Portugal.",
    url: SITE_URL,
    siteName: "Limiar",
    locale: "pt_PT",
    type: "website",
    images: [{ url: `${SITE_URL}/og-default.svg` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Limiar — Quando vale realmente a pena comprar",
    description:
      "Descobre se vale a pena comprar agora — com evidência de histórico.",
  },
};

function HomeJsonLd() {
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Limiar",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Limiar",
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
    </>
  );
}

export default function HomePage() {
  return (
    <>
      <HomeJsonLd />
      <SiteHeader />
      <main>
        <HomePageClient />
      </main>
      <SiteFooter />
    </>
  );
}
