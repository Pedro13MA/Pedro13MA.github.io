import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import CategoriasHubClient from "./CategoriasHubClient";
import { SITE_URL } from "@/lib/constants";
import "@/components/catalogo/catalog-premium.css";

export const metadata: Metadata = {
  title: "Categorias | Lymiar",
  description: "Navega o catálogo Lymiar por categorias Taxonomy v2.",
  alternates: { canonical: `${SITE_URL}/categorias/` },
};

export default function CategoriasPage() {
  return (
    <div className="catalog-premium">
      <SiteHeader />
      <div className="border-b border-[var(--hm-line)] bg-[var(--hm-bg-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:max-w-7xl">
          <SearchBar />
        </div>
      </div>
      <CategoriasHubClient />
      <SiteFooter />
    </div>
  );
}
