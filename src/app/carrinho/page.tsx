import type { Metadata } from "next";
import { CartPageClient } from "@/components/smart-cart/CartPageClient";

export const metadata: Metadata = {
  title: "Compra inteligente · Limiar",
  description:
    "Monte um carrinho e otimize automaticamente a combinação de lojas com menor custo total — só com preços observados.",
  alternates: { canonical: "/carrinho/" },
  openGraph: {
    title: "Compra inteligente Limiar",
    description:
      "Otimize a compra entre lojas: menor preço, menos lojas ou melhor equilíbrio.",
    url: "/carrinho/",
    type: "website",
  },
};

export default function CarrinhoPage() {
  return <CartPageClient />;
}
