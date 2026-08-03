import { Suspense } from "react";
import { ListsPageClient } from "@/components/user-space/ListsPageClient";

export default function ListasPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <ListsPageClient />
    </Suspense>
  );
}
