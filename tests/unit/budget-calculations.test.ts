import { describe, it, expect } from "vitest";
import { calculateBudgetStatus } from "../../src/lib/finance/calculations";
import { BudgetInputSchema } from "../../src/lib/validations/budget";

describe("BudgetInputSchema Validation", () => {
  it("validates valid category budget input", () => {
    const valid = {
      month: 10,
      year: 2026,
      amount: 500.0,
      categoryId: "cat-alimentacion",
    };
    const res = BudgetInputSchema.safeParse(valid);
    expect(res.success).toBe(true);
  });

  it("validates valid global monthly budget (categoryId null/undefined)", () => {
    const globalValid = {
      month: 10,
      year: 2026,
      amount: 3000.0,
      categoryId: null,
    };
    const res = BudgetInputSchema.safeParse(globalValid);
    expect(res.success).toBe(true);
  });

  it("rejects invalid month and year", () => {
    expect(
      BudgetInputSchema.safeParse({ month: 13, year: 2026, amount: 500 }).success
    ).toBe(false);

    expect(
      BudgetInputSchema.safeParse({ month: 0, year: 2026, amount: 500 }).success
    ).toBe(false);

    expect(
      BudgetInputSchema.safeParse({ month: 5, year: 1999, amount: 500 }).success
    ).toBe(false);
  });

  it("rejects non-positive budget amounts", () => {
    expect(
      BudgetInputSchema.safeParse({ month: 10, year: 2026, amount: 0 }).success
    ).toBe(false);

    expect(
      BudgetInputSchema.safeParse({ month: 10, year: 2026, amount: -100 }).success
    ).toBe(false);
  });
});

describe("Budget Threshold Status Engine", () => {
  it("computes NORMAL status when spend is below 80%", () => {
    // Presupuesto S/ 1000, Gasto S/ 750 (75%)
    const res = calculateBudgetStatus(1000, 750);
    expect(res.status).toBe("NORMAL");
    expect(res.percentageUsed).toBe(75.0);
    expect(res.remainingAmount).toBe(250.0);
    expect(res.overdraftAmount).toBe(0.0);
  });

  it("computes WARNING status when spend reaches or exceeds 80% but under 100%", () => {
    // Presupuesto S/ 500, Gasto S/ 420 (84%)
    const res = calculateBudgetStatus(500, 420);
    expect(res.status).toBe("WARNING");
    expect(res.percentageUsed).toBe(84.0);
    expect(res.remainingAmount).toBe(80.0);
    expect(res.overdraftAmount).toBe(0.0);
  });

  it("computes OVERDRAFT status and tracks exact excess when spend >= 100%", () => {
    // Presupuesto S/ 500, Gasto S/ 520 (104%)
    const res = calculateBudgetStatus(500, 520);
    expect(res.status).toBe("OVERDRAFT");
    expect(res.percentageUsed).toBe(104.0);
    expect(res.remainingAmount).toBe(-20.0);
    expect(res.overdraftAmount).toBe(20.0);
  });
});
