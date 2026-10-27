import { Decimal } from "decimal.js";

// Configuración de precisión decimal
Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export type BudgetStatusType = "NORMAL" | "WARNING" | "OVERDRAFT";

export interface BudgetStatusResult {
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: BudgetStatusType;
  overdraftAmount: number;
}

/**
 * Suma dos cantidades monetarias garantizando precisión exacta de céntimos.
 */
export function addMoney(a: number | string | Decimal, b: number | string | Decimal): number {
  return new Decimal(a.toString()).plus(new Decimal(b.toString())).toNumber();
}

/**
 * Resta dos cantidades monetarias.
 */
export function subtractMoney(a: number | string | Decimal, b: number | string | Decimal): number {
  return new Decimal(a.toString()).minus(new Decimal(b.toString())).toNumber();
}

/**
 * Calcula el balance neto: Ingresos - Gastos
 */
export function calculateNetBalance(
  totalIncome: number | string | Decimal,
  totalExpense: number | string | Decimal
): number {
  return subtractMoney(totalIncome, totalExpense);
}

/**
 * Evalúa el progreso del presupuesto mensual frente a los umbrales estándar:
 * - NORMAL: Gasto < 80% del presupuesto
 * - WARNING: 80% <= Gasto < 100% del presupuesto (Ámbar)
 * - OVERDRAFT: Gasto >= 100% del presupuesto (Rojo)
 */
export function calculateBudgetStatus(
  budgetAmountInput: number | string | Decimal,
  spentAmountInput: number | string | Decimal,
  warningThresholdPercentage = 80
): BudgetStatusResult {
  const budget = new Decimal(budgetAmountInput.toString());
  const spent = new Decimal(spentAmountInput.toString());

  const remaining = budget.minus(spent);
  const overdraft = spent.greaterThan(budget) ? spent.minus(budget) : new Decimal(0);

  let percentage = new Decimal(0);
  if (budget.greaterThan(0)) {
    percentage = spent.dividedBy(budget).times(100);
  }

  let status: BudgetStatusType = "NORMAL";
  if (budget.greaterThan(0)) {
    if (spent.greaterThanOrEqualTo(budget)) {
      status = "OVERDRAFT";
    } else if (percentage.greaterThanOrEqualTo(warningThresholdPercentage)) {
      status = "WARNING";
    }
  }

  return {
    budgetAmount: Number(budget.toFixed(2)),
    spentAmount: Number(spent.toFixed(2)),
    remainingAmount: Number(remaining.toFixed(2)),
    percentageUsed: Number(percentage.toFixed(1)),
    status,
    overdraftAmount: Number(overdraft.toFixed(2)),
  };
}

/**
 * Suma un array de números o strings de monto de forma exacta.
 */
export function sumAmounts(amounts: Array<number | string | Decimal>): number {
  return amounts
    .reduce<Decimal>(
      (acc, curr) => acc.plus(new Decimal(curr.toString())),
      new Decimal(0)
    )
    .toNumber();

}
