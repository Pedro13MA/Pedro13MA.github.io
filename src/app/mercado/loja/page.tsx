import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { LojaDetailClient } from "@/components/mercado/LojaDetailClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Loja | Mercado Lymiar",
  description: "Dashboard factual de loja no Lymiar.",
  alternates: { canonical: `${SITE_URL}/mercado/loja/` },
};

export default function LojaPage() {
  return (
    <>
      <SiteHeader />
      <LojaDetailClient />
      <SiteFooter />
    </>
  );
}
