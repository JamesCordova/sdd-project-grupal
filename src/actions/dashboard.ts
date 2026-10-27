"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { addMoney, calculateNetBalance } from "@/lib/finance/calculations";
import { getMonthNameShort } from "@/lib/finance/currency";
import { getMonthlyBudgetReport } from "./budgets";
import type { BudgetAlert } from "./budgets";

export interface CategorySpending {
  categoryId: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface MonthTrendItem {
  monthName: string;
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
}

export interface DashboardMetricsDTO {
  month: number;
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  spendingByCategory: CategorySpending[];
  monthlyTrend: MonthTrendItem[];
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    description: string | null;
    categoryId: string;
    category: {
      id: string;
      name: string;
      icon: string | null;
      color: string | null;
    };
  }>;
  alerts: BudgetAlert[];
}

async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }
  const demoUser = await prisma.user.findFirst({
    where: { email: "demo@finanzas.pe" },
  });
  if (demoUser) {
    return demoUser.id;
  }
  throw new Error("No autenticado y no se encontró usuario demo.");
}

/**
 * Agrega y calcula todas las métricas para el panel financiero del mes especificado.
 */
export async function getDashboardMetrics(
  selectedMonth?: number,
  selectedYear?: number
): Promise<{ success: boolean; data?: DashboardMetricsDTO; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const now = new Date();
    const month = selectedMonth || now.getUTCMonth() + 1;
    const year = selectedYear || now.getUTCFullYear();

    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Fecha de inicio para la tendencia histórica (últimos 6 meses)
    const trendStartDate = new Date(Date.UTC(year, month - 6, 1, 0, 0, 0));

    // Ejecutar consultas concurrentes
    const [monthTransactions, trendTransactions, recentTransactions, budgetReportRes] =
      await Promise.all([
        // Movimientos del mes seleccionado
        prisma.transaction.findMany({
          where: {
            userId,
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          include: { category: true },
        }),
        // Movimientos de los últimos 6 meses para tendencia
        prisma.transaction.findMany({
          where: {
            userId,
            date: { gte: trendStartDate, lte: endOfMonth },
          },
          select: {
            amount: true,
            type: true,
            date: true,
          },
        }),
        // Últimas 5 transacciones
        prisma.transaction.findMany({
          where: { userId },
          include: { category: true },
          orderBy: { date: "desc" },
          take: 5,
        }),
        // Reporte de presupuestos y alertas
        getMonthlyBudgetReport(month, year),
      ]);

    // 1. Calcular Totales del Mes
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryExpenseMap: Record<
      string,
      { name: string; color: string; amount: number }
    > = {};

    for (const t of monthTransactions) {
      const amt = Number(t.amount);
      if (t.type === "INCOME") {
        totalIncome = addMoney(totalIncome, amt);
      } else {
        totalExpense = addMoney(totalExpense, amt);
        if (!categoryExpenseMap[t.categoryId]) {
          categoryExpenseMap[t.categoryId] = {
            name: t.category.name,
            color: t.category.color || "#64748B",
            amount: 0,
          };
        }
        categoryExpenseMap[t.categoryId].amount = addMoney(
          categoryExpenseMap[t.categoryId].amount,
          amt
        );
      }
    }

    const netBalance = calculateNetBalance(totalIncome, totalExpense);

    // 2. Desglose porcentual por categoría (para gráfico de dona)
    const spendingByCategory: CategorySpending[] = Object.entries(categoryExpenseMap)
      .map(([categoryId, val]) => ({
        categoryId,
        name: val.name,
        color: val.color,
        amount: val.amount,
        percentage:
          totalExpense > 0 ? Number(((val.amount / totalExpense) * 100).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 3. Tendencia mensual de los últimos 6 meses (para gráfico de barras)
    const monthlyTrend: MonthTrendItem[] = [];
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(Date.UTC(year, month - 1 - i, 1));
      const tMonth = targetDate.getUTCMonth() + 1;
      const tYear = targetDate.getUTCFullYear();
      const mName = getMonthNameShort(tMonth);

      let mIncome = 0;
      let mExpense = 0;

      for (const t of trendTransactions) {
        const itemDate = new Date(t.date);
        if (
          itemDate.getUTCMonth() + 1 === tMonth &&
          itemDate.getUTCFullYear() === tYear
        ) {
          const amt = Number(t.amount);
          if (t.type === "INCOME") {
            mIncome = addMoney(mIncome, amt);
          } else {
            mExpense = addMoney(mExpense, amt);
          }
        }
      }

      monthlyTrend.push({
        monthName: `${mName} ${tYear.toString().slice(-2)}`,
        month: tMonth,
        year: tYear,
        income: mIncome,
        expense: mExpense,
        balance: calculateNetBalance(mIncome, mExpense),
      });
    }

    const alerts = budgetReportRes.success && budgetReportRes.data ? budgetReportRes.data.alerts : [];

    return {
      success: true,
      data: {
        month,
        year,
        totalIncome,
        totalExpense,
        netBalance,
        spendingByCategory,
        monthlyTrend,
        recentTransactions: recentTransactions.map((t) => ({
          id: t.id,
          amount: Number(t.amount),
          type: t.type,
          date: t.date.toISOString().split("T")[0],
          description: t.description,
          categoryId: t.categoryId,
          category: t.category,
        })),
        alerts,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al calcular métricas del panel" };
  }
}
