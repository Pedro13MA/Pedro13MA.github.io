import { Suspense } from "react";
import { FavoritesPageClient } from "@/components/user-space/FavoritesPageClient";

export default function FavoritosPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <FavoritesPageClient />
    </Suspense>
  );
}
