import { describe, it, expect } from "vitest";
import {
  calculatePercentageChange,
  analyzeMonthlyTrends,
} from "@/lib/finance/trend-analysis";

describe("Trend Analysis & Spending Habit Detection", () => {
  it("calculates percentage variations accurately", () => {
    // 500 to 700 -> +40.0%
    const inc = calculatePercentageChange(700, 500);
    expect(inc.percentageChange).toBe(40.0);
    expect(inc.direction).toBe("INCREASE");

    // 500 to 300 -> -40.0%
    const dec = calculatePercentageChange(300, 500);
    expect(dec.percentageChange).toBe(-40.0);
    expect(dec.direction).toBe("DECREASE");

    // 0 to 150 -> 100% NEW
    const newSpend = calculatePercentageChange(150, 0);
    expect(newSpend.percentageChange).toBe(100);
    expect(newSpend.direction).toBe("NEW");

    // 150 to 0 -> -100% ZERO
    const zeroSpend = calculatePercentageChange(0, 150);
    expect(zeroSpend.percentageChange).toBe(-100);
    expect(zeroSpend.direction).toBe("ZERO");
  });

  it("enforces sufficiency rule when user has fewer than 2 months of data", () => {
    const result = analyzeMonthlyTrends(
      [{ categoryId: "c1", categoryName: "Alimentación", amount: 400 }],
      [],
      "Octubre",
      "Setiembre",
      1 // Only 1 month available
    );

    expect(result.hasSufficientData).toBe(false);
    expect(result.message).toContain("al menos 2 meses");
    expect(result.categories).toHaveLength(0);
    expect(result.insights[0].type).toBe("info");
  });

  it("detects significant category increases (+40%) when 2 months are present", () => {
    const current = [
      { categoryId: "c1", categoryName: "Alimentación", amount: 700 },
      { categoryId: "c2", categoryName: "Transporte", amount: 200 },
    ];
    const previous = [
      { categoryId: "c1", categoryName: "Alimentación", amount: 500 },
      { categoryId: "c2", categoryName: "Transporte", amount: 300 },
    ];

    const result = analyzeMonthlyTrends(
      current,
      previous,
      "Octubre",
      "Setiembre",
      2 // 2 months
    );

    expect(result.hasSufficientData).toBe(true);
    expect(result.categories).toHaveLength(2);

    const alimentacion = result.categories.find((c) => c.categoryName === "Alimentación");
    expect(alimentacion?.percentageChange).toBe(40.0);
    expect(alimentacion?.isSignificant).toBe(true);

    const transporte = result.categories.find((c) => c.categoryName === "Transporte");
    expect(transporte?.percentageChange).toBe(-33.3);

    // Insight warning should mention Alimentación
    expect(result.insights.some((i) => i.title.includes("Alimentación"))).toBe(true);
  });
});
