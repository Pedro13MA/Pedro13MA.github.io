import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/layout/SiteHeader";
import { PriceHistoryChart } from "@/components/charts/PriceHistoryChart";
import { DecisionCard } from "@/components/product/DecisionCard";
import { PriceAlertForm } from "@/components/product/PriceAlertForm";
import { ProductHeader } from "@/components/product/ProductHeader";
import { StoreCompareTable } from "@/components/product/StoreCompareTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProductBySlug, MOCK_PRODUCTS } from "@/lib/mock-data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return MOCK_PRODUCTS.flatMap((p) => [{ slug: p.slug }, { slug: p.ean }]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Produto" };
  return {
    title: product.name,
    description: `${product.name} — ${product.decision.semaphore === "buy" ? "Comprar agora" : product.decision.semaphore === "fair" ? "Preço razoável" : "Espera"} · média 30d e comparação multi-loja.`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10 sm:px-6">
        <ProductHeader product={product} />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de preço</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceHistoryChart
                history={product.history}
                historicalMin={product.historicalMin}
                historicalMax={product.historicalMax}
              />
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-zinc-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" /> Mínimo
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" /> Máximo
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <DecisionCard decision={product.decision} />
            <PriceAlertForm
              productName={product.name}
              currentPrice={product.currentPrice}
              suggestedThreshold={Math.round(product.historicalMin * 100) / 100}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Comparação multi-loja</CardTitle>
          </CardHeader>
          <CardContent>
            <StoreCompareTable offers={product.offers} />
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
