import { describe, it, expect } from "vitest";
import {
  addMoney,
  subtractMoney,
  calculateNetBalance,
  calculateBudgetStatus,
  sumAmounts,
} from "../../src/lib/finance/calculations";
import {
  formatPEN,
  formatDate,
  getMonthName,
  formatMonthYear,
} from "../../src/lib/finance/currency";

describe("Financial Calculations Engine", () => {
  it("avoids binary floating point inaccuracies (0.1 + 0.2 = 0.30)", () => {
    // En JS estándar, 0.1 + 0.2 = 0.30000000000000004
    const result = addMoney(0.1, 0.2);
    expect(result).toBe(0.3);
  });

  it("calculates accurate subtractions down to the exact centavo", () => {
    const result = subtractMoney(100.0, 45.55);
    expect(result).toBe(54.45);
  });

  it("calculates net balance (income - expenses)", () => {
    const balance = calculateNetBalance(4500.0, 1850.75);
    expect(balance).toBe(2649.25);

    const negativeBalance = calculateNetBalance(1000.0, 1250.0);
    expect(negativeBalance).toBe(-250.0);
  });

  it("sums an array of diverse transactions with exact precision", () => {
    const amounts = [10.25, 20.35, 5.4, 0.05, 100.95];
    const total = sumAmounts(amounts);
    expect(total).toBe(137.0);
  });

  describe("Budget Status and Thresholds", () => {
    it("returns NORMAL status when spent amount is below 80%", () => {
      // 350 / 500 = 70%
      const status = calculateBudgetStatus(500, 350);
      expect(status.status).toBe("NORMAL");
      expect(status.percentageUsed).toBe(70.0);
      expect(status.remainingAmount).toBe(150.0);
      expect(status.overdraftAmount).toBe(0.0);
    });

    it("returns WARNING status when spent amount reaches or exceeds 80% but under 100%", () => {
      // 400 / 500 = 80.0%
      const statusAt80 = calculateBudgetStatus(500, 400);
      expect(statusAt80.status).toBe("WARNING");
      expect(statusAt80.percentageUsed).toBe(80.0);
      expect(statusAt80.remainingAmount).toBe(100.0);
      expect(statusAt80.overdraftAmount).toBe(0.0);

      // 475 / 500 = 95.0%
      const statusAt95 = calculateBudgetStatus(500, 475);
      expect(statusAt95.status).toBe("WARNING");
      expect(statusAt95.percentageUsed).toBe(95.0);
      expect(statusAt95.remainingAmount).toBe(25.0);
    });

    it("returns OVERDRAFT status when spent amount reaches or exceeds 100%", () => {
      // 500 / 500 = 100.0%
      const statusAt100 = calculateBudgetStatus(500, 500);
      expect(statusAt100.status).toBe("OVERDRAFT");
      expect(statusAt100.percentageUsed).toBe(100.0);
      expect(statusAt100.remainingAmount).toBe(0.0);
      expect(statusAt100.overdraftAmount).toBe(0.0);

      // 550 / 500 = 110.0% (Sobregiro de S/ 50.00)
      const statusOver = calculateBudgetStatus(500, 550);
      expect(statusOver.status).toBe("OVERDRAFT");
      expect(statusOver.percentageUsed).toBe(110.0);
      expect(statusOver.remainingAmount).toBe(-50.0);
      expect(statusOver.overdraftAmount).toBe(50.0);
    });

    it("handles zero budget without throwing division by zero errors", () => {
      const status = calculateBudgetStatus(0, 50);
      expect(status.percentageUsed).toBe(0);
      expect(status.remainingAmount).toBe(-50);
    });
  });
});

describe("Peruvian Sol (PEN) Currency and Date Formatting", () => {
  it("formats numbers to official Peruvian currency format", () => {
    // Debe contener 'S/' y el monto con separadores de miles y 2 decimales
    const formatted = formatPEN(1250.5);
    expect(formatted).toMatch(/S\/\s*1[,\s\.]250[\.,]50/);

    const zero = formatPEN(0);
    expect(zero).toMatch(/S\/\s*0[\.,]00/);
  });

  it("handles null or undefined amounts gracefully", () => {
    expect(formatPEN(null)).toMatch(/S\/\s*0[\.,]00/);
    expect(formatPEN(undefined)).toMatch(/S\/\s*0[\.,]00/);
  });

  it("formats dates and months in Spanish", () => {
    expect(getMonthName(10)).toBe("Octubre");
    expect(formatMonthYear(10, 2026)).toBe("Octubre 2026");
    expect(formatDate("2026-10-27")).toContain("27");
  });
});
