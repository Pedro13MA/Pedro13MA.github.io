import { describe, expect, it, afterEach } from "vitest";
import { isP34ProductPageEnabled, P34_FLAG_NAME } from "@/lib/product/flags";

describe("P34 product page flag", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_P34_PRODUCT_PAGE;
  });

  it("defaults off", () => {
    delete process.env.NEXT_PUBLIC_P34_PRODUCT_PAGE;
    expect(isP34ProductPageEnabled()).toBe(false);
    expect(P34_FLAG_NAME).toBe("P34_PRODUCT_PAGE");
  });

  it("enables on true", () => {
    process.env.NEXT_PUBLIC_P34_PRODUCT_PAGE = "true";
    expect(isP34ProductPageEnabled()).toBe(true);
  });
});
