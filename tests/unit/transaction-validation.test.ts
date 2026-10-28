import { describe, it, expect } from "vitest";
import { TransactionInputSchema } from "../../src/lib/validations/transaction";

describe("TransactionInputSchema Validation", () => {
  it("validates valid expense transaction", () => {
    const validData = {
      amount: 45.5,
      type: "EXPENSE",
      date: "2026-10-27",
      categoryId: "cat-123",
      description: "Almuerzo en restaurante",
    };
    const result = TransactionInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("validates valid income transaction", () => {
    const validData = {
      amount: 4200.0,
      type: "INCOME",
      date: "2026-10-25",
      categoryId: "cat-income-1",
      description: "Pago quincenal de sueldo",
    };
    const result = TransactionInputSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects zero and negative amounts", () => {
    const zeroAmount = {
      amount: 0,
      type: "EXPENSE",
      date: "2026-10-27",
      categoryId: "cat-123",
    };
    expect(TransactionInputSchema.safeParse(zeroAmount).success).toBe(false);

    const negativeAmount = {
      amount: -25.5,
      type: "EXPENSE",
      date: "2026-10-27",
      categoryId: "cat-123",
    };
    expect(TransactionInputSchema.safeParse(negativeAmount).success).toBe(false);
  });

  it("rejects numbers with more than 2 decimal places", () => {
    const threeDecimals = {
      amount: 45.555,
      type: "EXPENSE",
      date: "2026-10-27",
      categoryId: "cat-123",
    };
    const result = TransactionInputSchema.safeParse(threeDecimals);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain("más de 2 decimales");
    }
  });

  it("rejects invalid date format", () => {
    const invalidDate = {
      amount: 100,
      type: "EXPENSE",
      date: "27/10/2026", // Debe ser YYYY-MM-DD
      categoryId: "cat-123",
    };
    expect(TransactionInputSchema.safeParse(invalidDate).success).toBe(false);
  });

  it("rejects descriptions exceeding 255 characters", () => {
    const longDesc = {
      amount: 100,
      type: "EXPENSE",
      date: "2026-10-27",
      categoryId: "cat-123",
      description: "A".repeat(256),
    };
    expect(TransactionInputSchema.safeParse(longDesc).success).toBe(false);
  });
});
