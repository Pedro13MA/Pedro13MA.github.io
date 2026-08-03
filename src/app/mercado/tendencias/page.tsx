import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { TendenciasClient } from "@/components/mercado/TendenciasClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Tendências | Mercado Limiar",
  description:
    "Actividade observada no mercado Limiar — sem previsões de futuro.",
  alternates: { canonical: `${SITE_URL}/mercado/tendencias/` },
  openGraph: {
    title: "Tendências | Mercado Limiar",
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
