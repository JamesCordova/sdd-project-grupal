import { describe, it, expect } from "vitest";
import { addMoney, subtractMoney, calculateNetBalance } from "../../src/lib/finance/calculations";

interface MockTransaction {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
}

function calculateSummary(transactions: MockTransaction[]) {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") {
      income = addMoney(income, t.amount);
    } else {
      expense = addMoney(expense, t.amount);
    }
  }

  const net = calculateNetBalance(income, expense);
  return { income, expense, net };
}

describe("Transaction Balance Recalculation", () => {
  it("calculates initial totals for a list of transactions", () => {
    const list: MockTransaction[] = [
      { id: "1", amount: 3500.0, type: "INCOME" },
      { id: "2", amount: 150.5, type: "EXPENSE" },
      { id: "3", amount: 80.25, type: "EXPENSE" },
    ];

    const summary = calculateSummary(list);
    expect(summary.income).toBe(3500.0);
    expect(summary.expense).toBe(230.75);
    expect(summary.net).toBe(3269.25);
  });

  it("updates totals correctly when a transaction is edited", () => {
    let list: MockTransaction[] = [
      { id: "1", amount: 3500.0, type: "INCOME" },
      { id: "2", amount: 150.5, type: "EXPENSE" },
    ];

    expect(calculateSummary(list).net).toBe(3349.5);

    // Editar la transacción 2 de 150.50 a 200.00
    list = list.map((t) => (t.id === "2" ? { ...t, amount: 200.0 } : t));

    const updatedSummary = calculateSummary(list);
    expect(updatedSummary.expense).toBe(200.0);
    expect(updatedSummary.net).toBe(3300.0);
  });

  it("updates totals correctly when a transaction is deleted", () => {
    let list: MockTransaction[] = [
      { id: "1", amount: 3500.0, type: "INCOME" },
      { id: "2", amount: 150.5, type: "EXPENSE" },
      { id: "3", amount: 50.0, type: "EXPENSE" },
    ];

    expect(calculateSummary(list).expense).toBe(200.5);

    // Eliminar transacción 2
    list = list.filter((t) => t.id !== "2");

    const afterDelete = calculateSummary(list);
    expect(afterDelete.expense).toBe(50.0);
    expect(afterDelete.net).toBe(3450.0);
  });
});
