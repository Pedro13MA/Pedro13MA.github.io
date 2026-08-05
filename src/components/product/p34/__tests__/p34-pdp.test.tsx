import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  ProductActionPlaceholders,
  ProductTelegramStrip,
} from "@/components/product/p34/ProductActionPlaceholders";
import {
  ProductRelatedInterestSection,
  ProductSimilarSection,
} from "@/components/product/p34/ProductDiscoveryPlaceholders";
import {
  ProductCouponsSection,
  ProductStoresEmpty,
} from "@/components/product/p34/ProductCouponsSection";
import { ProductPdpSkeleton } from "@/components/product/p34/ProductPdpSkeleton";
import type { Product } from "@/lib/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const baseProduct = {
  ean: "1",
  slug: "test",
  name: "Test Product",
  brand: "Brand",
  category: "ssd",
  currentPrice: 10,
  offers: [],
  history: [],
  recommendations: {},
} as unknown as Product;

describe("P34 PDP placeholders", () => {
  it("renders disabled compare and alert placeholders", () => {
    render(<ProductActionPlaceholders />);
    const compare = screen.getByRole("button", { name: /Comparar/i });
    const alert = screen.getByRole("button", { name: /Criar alerta/i });
    expect((compare as HTMLButtonElement).disabled).toBe(true);
    expect((alert as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders telegram strip with link", () => {
    render(<ProductTelegramStrip />);
    expect(screen.getByLabelText(/Telegram/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Telegram/i })).toBeTruthy();
  });

  it("similar empty placeholder", () => {
    render(<ProductSimilarSection products={[]} />);
    expect(screen.getByText(/semelhantes suficientes/i)).toBeTruthy();
  });

  it("related interest placeholder", () => {
    render(<ProductRelatedInterestSection />);
    expect(screen.getByText(/Também pode interessar/i)).toBeTruthy();
  });

  it("coupons empty state", () => {
    render(<ProductCouponsSection product={baseProduct} />);
    expect(screen.getByText(/Sem cupões/i)).toBeTruthy();
  });

  it("stores empty", () => {
    render(<ProductStoresEmpty />);
    expect(screen.getByText(/não há lojas/i)).toBeTruthy();
  });

  it("skeleton has aria-busy", () => {
    render(<ProductPdpSkeleton />);
    const el = screen.getByLabelText(/A carregar produto/i);
    expect(el.getAttribute("aria-busy")).toBe("true");
  });
});