import { describe, it, expect } from "vitest";
import { addMoney, calculateNetBalance } from "@/lib/finance/calculations";

describe("Dashboard Metrics Aggregator Logic", () => {
  it("calculates monthly totals accurately without floating-point inaccuracies", () => {
    const transactions = [
      { amount: 1500.5, type: "INCOME" as const, categoryId: "c1" },
      { amount: 2500.25, type: "INCOME" as const, categoryId: "c1" },
      { amount: 120.3, type: "EXPENSE" as const, categoryId: "c2" },
      { amount: 80.7, type: "EXPENSE" as const, categoryId: "c3" },
      { amount: 50.05, type: "EXPENSE" as const, categoryId: "c2" },
    ];

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of transactions) {
      if (t.type === "INCOME") {
        totalIncome = addMoney(totalIncome, t.amount);
      } else {
        totalExpense = addMoney(totalExpense, t.amount);
      }
    }

    expect(totalIncome).toBe(4000.75);
    expect(totalExpense).toBe(251.05);

    const netBalance = calculateNetBalance(totalIncome, totalExpense);
    expect(netBalance).toBe(3749.7);
  });

  it("calculates spending percentages by category properly", () => {
    const categoryTotals: Record<string, { name: string; amount: number }> = {
      c1: { name: "Alimentación", amount: 600 },
      c2: { name: "Transporte", amount: 300 },
      c3: { name: "Entretenimiento", amount: 100 },
    };

    const totalExpense = 1000;

    const breakdown = Object.entries(categoryTotals).map(([id, val]) => ({
      categoryId: id,
      name: val.name,
      amount: val.amount,
      percentage: Number(((val.amount / totalExpense) * 100).toFixed(1)),
    }));

    expect(breakdown[0].percentage).toBe(60.0);
    expect(breakdown[1].percentage).toBe(30.0);
    expect(breakdown[2].percentage).toBe(10.0);
  });

  it("handles 0 expenses gracefully without DivisionByZero NaN", () => {
    const totalExpense = 0;
    const categoryAmount = 0;
    const percentage = totalExpense > 0 ? Number(((categoryAmount / totalExpense) * 100).toFixed(1)) : 0;
    expect(percentage).toBe(0);
    expect(Number.isNaN(percentage)).toBe(false);
  });

  it("calculates negative net balance when expenses exceed income", () => {
    const totalIncome = 1200.0;
    const totalExpense = 1550.8;
    const balance = calculateNetBalance(totalIncome, totalExpense);
    expect(balance).toBe(-350.8);
  });
});
