import { describe, expect, it } from "vitest";
import {
  bestPriceExtremes,
  fillPeriodWindow,
  formatTickDayMonth,
  nicePriceDomain,
  todayKey,
} from "@/lib/price-history-chart";

describe("nicePriceDomain", () => {
  it("zooms around product price instead of starting at 0", () => {
    const { min, max, ticks } = nicePriceDomain([900, 1000]);
    expect(min).toBeGreaterThan(500);
    expect(max).toBeLessThan(1500);
    expect(ticks[0]).toBe(min);
    expect(ticks[ticks.length - 1]).toBe(max);
  });
});

describe("fillPeriodWindow", () => {
  it("marks carry-forward days as imputed", () => {
    const now = new Date(2026, 7, 6);
    const points = fillPeriodWindow(
      [
        { date: "2026-07-29", price: 900 },
        { date: "2026-08-01", price: 1000 },
        { date: "2026-08-04", price: 950 },
      ],
      7,
      950,
      now,
    );
    expect(points[0]?.date).toBe("2026-07-30");
    expect(points[points.length - 1]?.date).toBe(todayKey(now));
    const observed = points.filter((p) => !p.isImputed).map((p) => p.date);
    expect(observed).toContain("2026-08-01");
    expect(observed).toContain("2026-08-04");
    expect(points.find((p) => p.date === "2026-07-31")?.isImputed).toBe(true);
    expect(points.find((p) => p.date === "2026-07-31")?.price).toBe(900);
  });
});

describe("bestPriceExtremes", () => {
  it("uses only best-price series, ignoring market spread", () => {
    const points = fillPeriodWindow(
      [
        {
          date: "2026-07-26",
          price: 800,
          maxMarketPrice: 1200,
        },
        {
          date: "2026-07-28",
          price: 1000,
          maxMarketPrice: 1200,
        },
        {
          date: "2026-08-06",
          price: 840,
          maxMarketPrice: 1100,
        },
      ],
      14,
      840,
      new Date(2026, 7, 6),
    );
    const ex = bestPriceExtremes(points);
    expect(ex.min).toBe(800);
    expect(ex.max).toBe(1000);
    expect(ex.minDate).toBe("2026-07-26");
    expect(ex.maxDate).toBe("2026-07-28");
  });

  it("excludes imputed points from extremes", () => {
    const points = [
      { date: "2026-08-01", price: 900, isImputed: false },
      { date: "2026-08-02", price: 900, isImputed: true },
      { date: "2026-08-03", price: 850, isImputed: false },
    ];
    const ex = bestPriceExtremes(points);
    expect(ex.min).toBe(850);
    expect(ex.max).toBe(900);
    expect(ex.minDate).toBe("2026-08-03");
  });

  it("does not treat store max as historical max when best price is flat", () => {
    const points = [
      { date: "2026-08-01", price: 939.99, maxMarketPrice: 989, isImputed: false },
      { date: "2026-08-02", price: 939.99, maxMarketPrice: 989, isImputed: false },
      { date: "2026-08-03", price: 939.99, maxMarketPrice: 989, isImputed: false },
    ];
    const ex = bestPriceExtremes(points);
    expect(ex.min).toBe(939.99);
    expect(ex.max).toBe(939.99);
  });
});

describe("formatTickDayMonth", () => {
  it("formats as d/m", () => {
    expect(formatTickDayMonth("2026-08-06")).toBe("6/8");
    expect(formatTickDayMonth("2026-07-30")).toBe("30/7");
  });
});
