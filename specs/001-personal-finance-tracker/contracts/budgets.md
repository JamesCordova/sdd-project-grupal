# Interface Contract: Budgets & Dashboard Server Actions

**Feature**: `001-personal-finance-tracker`  
**Date**: 2026-10-27  
**Module**: `actions/budgets.ts` & `actions/dashboard.ts`  

---

## 1. Esquema de Validación Zod (`BudgetInputSchema`)

```typescript
import { z } from "zod";

export const BudgetInputSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  amount: z
    .number({ required_error: "El límite de presupuesto es obligatorio" })
    .positive("El presupuesto debe ser mayor a 0")
    .max(999999999.99, "El monto supera el límite permitido"),
  categoryId: z.string().optional().nullable(), // null = Presupuesto Global
});

export type BudgetInput = z.infer<typeof BudgetInputSchema>;
```

---

## 2. Server Actions de Presupuesto

### `setBudget(input: BudgetInput): Promise<ActionResult<BudgetDTO>>`
* **Autenticación**: Requerida (`auth()`).
* **Lógica**: Realiza un `upsert` en Prisma utilizando la clave única compuesta `[userId, month, year, categoryId]`.
* **Revalidación**: `revalidatePath('/budgets')` y `revalidatePath('/dashboard')`.

### `getMonthlyBudgetReport(month: number, year: number): Promise<BudgetReportDTO>`
* **Cálculo y respuesta**:
```typescript
export interface CategoryBudgetProgress {
  budgetId: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: "NORMAL" | "WARNING" | "OVERDRAFT"; // <80%, 80-99%, >=100%
}

export interface BudgetReportDTO {
  month: number;
  year: number;
  overallBudget?: {
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentageUsed: number;
    status: "NORMAL" | "WARNING" | "OVERDRAFT";
  };
  categories: CategoryBudgetProgress[];
  alerts: Array<{
    severity: "warning" | "destructive";
    title: string;
    description: string;
    categoryName: string;
    overdraftAmount?: number;
  }>;
}
```

---

## 3. Server Actions de Dashboard

### `getDashboardMetrics(month: number, year: number): Promise<DashboardMetricsDTO>`
* **Resumen financiero**:
```typescript
export interface DashboardMetricsDTO {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  spendingByCategory: Array<{
    categoryId: string;
    name: string;
    color: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    description: string | null;
    categoryName: string;
    categoryColor: string;
  }>;
  monthlyTrend: Array<{
    monthName: string; // ej. "Ene", "Feb", "Mar"
    income: number;
    expense: number;
    balance: number;
  }>;
  activeAlerts: Array<{
    id: string;
    message: string;
    severity: "warning" | "destructive";
  }>;
}
```
