import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { MarcaDetailClient } from "@/components/mercado/MarcaDetailClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Marca | Mercado Lymiar",
  description: "Dashboard factual de marca no Lymiar.",
  alternates: { canonical: `${SITE_URL}/mercado/marca/` },
};

export default function MarcaPage() {
  return (
    <>
      <SiteHeader />
      <MarcaDetailClient />
      <SiteFooter />
    </>
  );
}
