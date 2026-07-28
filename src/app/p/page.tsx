"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { ProductPageClient } from "@/components/product/ProductPageClient";

function ProductFromQuery() {
  const params = useSearchParams();
  const id = (params.get("id") || params.get("slug") || "").trim();
  if (!id) {
    return (
      <main className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold text-slate-900">Produto</h1>
        <p className="mt-3 text-slate-500">Usa a pesquisa ou um link com ?id=slug-ou-ean.</p>
      </main>
    );
  }
  return <ProductPageClient slug={id} />;
}

export default function ProductQueryPage() {
  return (
    <>
      <SiteHeader />
      <Suspense
        fallback={
          <main className="mx-auto max-w-6xl px-4 py-10">
            <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          </main>
        }
      >
        <ProductFromQuery />
      </Suspense>
      <SiteFooter />
    </>
  );
}
