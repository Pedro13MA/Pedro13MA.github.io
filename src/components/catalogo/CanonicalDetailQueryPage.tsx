"use client";

import { useSearchParams } from "next/navigation";
import { CanonicalPageClient } from "@/components/catalogo/CanonicalPageClient";

export function CanonicalDetailQueryPage() {
  const params = useSearchParams();
  const id = (params.get("id") || "").trim();
  if (!id) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-slate-500">Indica um produto canónico (?id=…).</p>
      </main>
    );
  }
  return <CanonicalPageClient slug={id} />;
}
