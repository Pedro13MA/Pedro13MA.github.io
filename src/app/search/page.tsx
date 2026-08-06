import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBarWithQuery } from "@/components/layout/SearchBarWithQuery";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import "@/components/catalogo/catalog-premium.css";

export default function SearchPage() {
  return (
    <div className="catalog-premium">
      <SiteHeader />
      <div className="border-b border-[var(--hm-line)] bg-[var(--hm-bg-elevated)]">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:max-w-7xl">
          <SearchBarWithQuery />
        </div>
      </div>
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-4 py-10 lg:max-w-7xl">
            <div className="h-40 animate-pulse rounded-2xl bg-[var(--hm-bg-soft)]" />
          </main>
        }
      >
        <SearchPageClient />
      </Suspense>
      <SiteFooter />
    </div>
  );
}
