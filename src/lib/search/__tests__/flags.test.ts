import { describe, expect, it, afterEach } from "vitest";
import { isP33SearchEnabled, P33_FLAG_NAME } from "@/lib/search/flags";

describe("P33 search flag", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_P33_SEARCH_ENGINE;
  });

  it("defaults off", () => {
    delete process.env.NEXT_PUBLIC_P33_SEARCH_ENGINE;
    expect(isP33SearchEnabled()).toBe(false);
    expect(P33_FLAG_NAME).toBe("P33_SEARCH_ENGINE");
  });

  it("enables on true", () => {
    process.env.NEXT_PUBLIC_P33_SEARCH_ENGINE = "true";
    expect(isP33SearchEnabled()).toBe(true);
  });
});
