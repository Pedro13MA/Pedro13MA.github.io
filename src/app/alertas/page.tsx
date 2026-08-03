import { Suspense } from "react";
import { AlertsPageClient } from "@/components/user-space/AlertsPageClient";

export default function AlertasPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <AlertsPageClient />
    </Suspense>
  );
}
