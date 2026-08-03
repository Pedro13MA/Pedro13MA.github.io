import { Suspense } from "react";
import { ComparePageClient } from "@/components/product/ComparePageClient";

export default function CompararPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <ComparePageClient />
    </Suspense>
  );
}
