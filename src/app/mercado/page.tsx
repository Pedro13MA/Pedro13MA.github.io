import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { MercadoDashboardClient } from "@/components/mercado/MercadoDashboardClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mercado | Lymiar",
  description:
    "Visão factual do mercado Lymiar: produtos, marcas, lojas, preços e actividade observada.",
  alternates: { canonical: `${SITE_URL}/mercado/` },
  openGraph: {
    title: "Mercado | Lymiar",
    description: "Resumo factual do catálogo observado.",
    url: `${SITE_URL}/mercado/`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mercado | Lymiar",
    description: "Resumo factual do catálogo observado.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Mercado Lymiar",
  url: `${SITE_URL}/mercado/`,
  description: "Dashboard factual do mercado observado.",
  isPartOf: { "@type": "WebSite", name: "Lymiar", url: SITE_URL },
};

export default function MercadoPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader />
      <MercadoDashboardClient />
      <SiteFooter />
    </>
  );
}
