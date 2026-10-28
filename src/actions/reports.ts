"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getMonthName } from "@/lib/finance/currency";
import {
  analyzeMonthlyTrends,
  type TrendAnalysisResult,
} from "@/lib/finance/trend-analysis";
import { addMoney } from "@/lib/finance/calculations";

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
 * Obtiene el análisis de tendencias y hábitos de gasto intermensual
 */
export async function getSpendingTrends(
  selectedMonth?: number,
  selectedYear?: number
): Promise<{
  success: boolean;
  data?: TrendAnalysisResult;
  error?: string;
}> {
  try {
    const userId = await getCurrentUserId();
    const now = new Date();
    const month = selectedMonth || now.getUTCMonth() + 1;
    const year = selectedYear || now.getUTCFullYear();

    // Mes anterior
    const prevDate = new Date(Date.UTC(year, month - 2, 1));
    const prevMonth = prevDate.getUTCMonth() + 1;
    const prevYear = prevDate.getUTCFullYear();

    const startCurrent = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endCurrent = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const startPrev = new Date(Date.UTC(prevYear, prevMonth - 1, 1, 0, 0, 0));
    const endPrev = new Date(Date.UTC(prevYear, prevMonth, 0, 23, 59, 59, 999));

    const [currentTxs, prevTxs, allUserTxs] = await Promise.all([
      // Gastos del mes actual
      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startCurrent, lte: endCurrent },
        },
        include: { category: true },
      }),
      // Gastos del mes anterior
      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: { gte: startPrev, lte: endPrev },
        },
        include: { category: true },
      }),
      // Fechas de todas las transacciones para contar meses históricos
      prisma.transaction.findMany({
        where: { userId },
        select: { date: true },
      }),
    ]);

    // Calcular meses con actividad registrada
    const distinctMonths = new Set<string>();
    for (const t of allUserTxs) {
      const d = new Date(t.date);
      distinctMonths.add(`${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`);
    }

    // Agregar gastos actuales por categoría
    const currentCategoryMap = new Map<
      string,
      { categoryName: string; color?: string | null; icon?: string | null; amount: number }
    >();
    for (const t of currentTxs) {
      const amt = Number(t.amount);
      const existing = currentCategoryMap.get(t.categoryId);
      if (existing) {
        existing.amount = addMoney(existing.amount, amt);
      } else {
        currentCategoryMap.set(t.categoryId, {
          categoryName: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
          amount: amt,
        });
      }
    }

    // Agregar gastos previos por categoría
    const prevCategoryMap = new Map<
      string,
      { categoryName: string; color?: string | null; icon?: string | null; amount: number }
    >();
    for (const t of prevTxs) {
      const amt = Number(t.amount);
      const existing = prevCategoryMap.get(t.categoryId);
      if (existing) {
        existing.amount = addMoney(existing.amount, amt);
      } else {
        prevCategoryMap.set(t.categoryId, {
          categoryName: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
          amount: amt,
        });
      }
    }

    const currentArray = Array.from(currentCategoryMap.entries()).map(([catId, val]) => ({
      categoryId: catId,
      categoryName: val.categoryName,
      color: val.color,
      icon: val.icon,
      amount: val.amount,
    }));

    const prevArray = Array.from(prevCategoryMap.entries()).map(([catId, val]) => ({
      categoryId: catId,
      categoryName: val.categoryName,
      color: val.color,
      icon: val.icon,
      amount: val.amount,
    }));

    const result = analyzeMonthlyTrends(
      currentArray,
      prevArray,
      getMonthName(month),
      getMonthName(prevMonth),
      distinctMonths.size
    );

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al generar análisis de tendencias",
    };
  }
}

export interface AnnualMonthSummary {
  month: number;
  monthName: string;
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
}

export interface AnnualReportDTO {
  year: number;
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  overallSavingsRate: number;
  monthlyBreakdown: AnnualMonthSummary[];
}

/**
 * Genera el reporte anual consolidado por meses con tasas de ahorro y flujos netos
 */
export async function getAnnualSummary(
  targetYear?: number
): Promise<{
  success: boolean;
  data?: AnnualReportDTO;
  error?: string;
}> {
  try {
    const userId = await getCurrentUserId();
    const year = targetYear || new Date().getUTCFullYear();

    const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfYear, lte: endOfYear },
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const monthlyBreakdown: AnnualMonthSummary[] = [];
    let yearIncome = 0;
    let yearExpense = 0;

    for (let m = 1; m <= 12; m++) {
      let mIncome = 0;
      let mExpense = 0;

      for (const t of transactions) {
        const d = new Date(t.date);
        if (d.getUTCMonth() + 1 === m) {
          const amt = Number(t.amount);
          if (t.type === "INCOME") {
            mIncome = addMoney(mIncome, amt);
          } else {
            mExpense = addMoney(mExpense, amt);
          }
        }
      }

      yearIncome = addMoney(yearIncome, mIncome);
      yearExpense = addMoney(yearExpense, mExpense);

      const mBalance = mIncome - mExpense;
      const savingsRate = mIncome > 0 ? Number((((mIncome - mExpense) / mIncome) * 100).toFixed(1)) : 0;

      monthlyBreakdown.push({
        month: m,
        monthName: getMonthName(m),
        income: mIncome,
        expense: mExpense,
        balance: mBalance,
        savingsRate,
      });
    }

    const yearBalance = yearIncome - yearExpense;
    const overallSavingsRate =
      yearIncome > 0 ? Number((((yearIncome - yearExpense) / yearIncome) * 100).toFixed(1)) : 0;

    return {
      success: true,
      data: {
        year,
        totalIncome: yearIncome,
        totalExpense: yearExpense,
        netBalance: yearBalance,
        overallSavingsRate,
        monthlyBreakdown,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al calcular el reporte anual",
    };
  }
}
