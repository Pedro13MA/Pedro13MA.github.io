import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { TendenciasClient } from "@/components/mercado/TendenciasClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tendências | Mercado Lymiar",
  description:
    "Actividade observada no mercado Lymiar — sem previsões de futuro.",
  alternates: { canonical: `${SITE_URL}/mercado/tendencias/` },
  openGraph: {
    title: "Tendências | Mercado Lymiar",
    url: `${SITE_URL}/mercado/tendencias/`,
  },
};

export default function TendenciasPage() {
  return (
    <>
      <SiteHeader />
      <TendenciasClient />
      <SiteFooter />
    </>
  );
}
