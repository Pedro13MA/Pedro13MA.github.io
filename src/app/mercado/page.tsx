import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { MercadoDashboardClient } from "@/components/mercado/MercadoDashboardClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Mercado | Limiar",
  description:
    "Visão factual do mercado Limiar: produtos, marcas, lojas, preços e actividade observada.",
  alternates: { canonical: `${SITE_URL}/mercado/` },
  openGraph: {
    title: "Mercado | Limiar",
    description: "Resumo factual do catálogo observado.",
    url: `${SITE_URL}/mercado/`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Mercado | Limiar",
    description: "Resumo factual do catálogo observado.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Mercado Limiar",
  url: `${SITE_URL}/mercado/`,
  description: "Dashboard factual do mercado observado.",
  isPartOf: { "@type": "WebSite", name: "Limiar", url: SITE_URL },
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
