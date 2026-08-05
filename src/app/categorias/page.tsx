import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBar } from "@/components/layout/SearchBar";
import CategoriasHubClient from "./CategoriasHubClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Categorias | Lymiar",
  description: "Navega o catálogo Lymiar por categorias Taxonomy v2.",
  alternates: { canonical: `${SITE_URL}/categorias/` },
};

export default function CategoriasPage() {
  return (
    <>
      <SiteHeader />
      <div className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <SearchBar />
        </div>
      </div>
      <CategoriasHubClient />
      <SiteFooter />
    </>
  );
}
