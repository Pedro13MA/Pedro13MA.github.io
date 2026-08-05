import type { Metadata } from "next";
import { Suspense } from "react";
import { CanonicalDetailQueryPage } from "@/components/catalogo/CanonicalDetailQueryPage";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Produto canónico · Lymiar",
  description: "Escolhe a variante com preços observados.",
  alternates: { canonical: `${SITE_URL}/catalogo/grupo/` },
  robots: { index: true, follow: true },
};

export default function CatalogoGrupoPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <CanonicalDetailQueryPage />
    </Suspense>
  );
}
