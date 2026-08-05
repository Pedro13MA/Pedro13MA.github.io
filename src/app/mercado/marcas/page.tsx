import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { MarcasListClient } from "@/components/mercado/MarcasListClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Marcas | Mercado Lymiar",
  description: "Marcas observadas no catálogo Lymiar — estatísticas factuais.",
  alternates: { canonical: `${SITE_URL}/mercado/marcas/` },
  openGraph: {
    title: "Marcas | Mercado Lymiar",
    url: `${SITE_URL}/mercado/marcas/`,
  },
};

export default function MarcasPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Marcas Lymiar",
            url: `${SITE_URL}/mercado/marcas/`,
          }),
        }}
      />
      <SiteHeader />
      <MarcasListClient />
      <SiteFooter />
    </>
  );
}
