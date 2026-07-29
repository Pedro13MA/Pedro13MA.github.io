import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { CatalogPageClient } from "@/components/catalog/CatalogPageClient";

export default function CatalogPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <div className="mb-6 h-10 w-64 animate-pulse rounded-lg bg-slate-100" />
            <div className="mb-4 h-12 animate-pulse rounded-xl bg-slate-100" />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl border border-slate-200/80 bg-slate-100"
                />
              ))}
            </div>
          </main>
        }
      >
        <CatalogPageClient />
      </Suspense>
      <SiteFooter />
    </>
  );
}
