import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { SearchBarWithQuery } from "@/components/layout/SearchBarWithQuery";
import { SearchPageClient } from "@/components/search/SearchPageClient";

export default function SearchPage() {
  return (
    <>
      <SiteHeader />
      <div className="border-b border-slate-200/80 bg-gradient-to-b from-white to-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <SearchBarWithQuery />
        </div>
      </div>
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          </main>
        }
      >
        <SearchPageClient />
      </Suspense>
      <SiteFooter />
    </>
  );
}
