import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { LojasListClient } from "@/components/mercado/LojasListClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Lojas | Mercado Lymiar",
  description: "Lojas com ofertas observadas no Lymiar.",
  alternates: { canonical: `${SITE_URL}/mercado/lojas/` },
  openGraph: {
    title: "Lojas | Mercado Lymiar",
    url: `${SITE_URL}/mercado/lojas/`,
  },
};

export default function LojasPage() {
  return (
    <>
      <SiteHeader />
      <LojasListClient />
      <SiteFooter />
    </>
  );
}
