import type { Metadata } from "next";
import { Suspense } from "react";
import { ComparePageClient } from "@/components/product/ComparePageClient";

export const metadata: Metadata = {
  title: "Comparador de produtos · Lymiar",
  description:
    "Compare até 4 produtos lado a lado: preço, histórico, índice Lymiar e especificações reais do catálogo.",
  alternates: {
    canonical: "/comparar/",
  },
  openGraph: {
    title: "Comparador Lymiar",
    description:
      "Comparação profissional com destaque automático do melhor preço, score e lojas — só com dados observados.",
    type: "website",
    url: "/comparar/",
  },
};

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Comparador Lymiar",
            applicationCategory: "ShoppingApplication",
            description:
              "Compare produtos com preço, histórico e índice Lymiar observados.",
            url: "https://lymiar.com/comparar/",
          }),
        }}
      />
    </Suspense>
  );
}
