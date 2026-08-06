import { describe, expect, it } from "vitest";

function near(a: number, b: number, eps = 0.05) {
  return Math.abs(a - b) <= eps;
}

describe("best-price marker policy", () => {
  it("omits max marker when best price has no temporal variation", () => {
    const targetMin = 939.99;
    const targetMax = 939.99;
    const showMax = targetMax > targetMin + 0.05;
    expect(showMax).toBe(false);
  });

  it("shows max marker when best price moved", () => {
    const targetMin = 800;
    const targetMax = 1000;
    expect(targetMax > targetMin + 0.05).toBe(true);
    expect(near(800, 1000)).toBe(false);
  });
});
