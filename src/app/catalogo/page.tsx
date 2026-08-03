import type { Metadata } from "next";
import { Suspense } from "react";
import { CanonicalListClient } from "@/components/catalogo/CanonicalListClient";
import { SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Catálogo canónico · Limiar",
  description:
    "Famílias de produtos com variantes observadas — escolhe capacidade, marca, cor ou edição.",
  alternates: { canonical: `${SITE_URL}/catalogo/` },
  openGraph: {
    title: "Catálogo canónico Limiar",
    description: "Produtos canónicos e variantes factuais.",
    url: `${SITE_URL}/catalogo/`,
    type: "website",
  },
};

export default function CatalogoPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-6xl px-4 py-10">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        </main>
      }
    >
      <CanonicalListClient />
    </Suspense>
  );
}
