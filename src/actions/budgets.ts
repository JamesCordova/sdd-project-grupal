"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { BudgetInputSchema, type BudgetInput } from "@/lib/validations/budget";
import { calculateBudgetStatus, addMoney } from "@/lib/finance/calculations";
import { formatPEN, getMonthName } from "@/lib/finance/currency";
import { Prisma } from "@prisma/client";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CategoryBudgetProgress {
  budgetId?: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
  categoryColor: string | null;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  status: "NORMAL" | "WARNING" | "OVERDRAFT";
  overdraftAmount: number;
  isAutoRenewed?: boolean;
}

export interface BudgetAlert {
  id: string;
  severity: "warning" | "destructive";
  title: string;
  description: string;
  categoryName: string;
  overdraftAmount: number;
  percentageUsed: number;
}

export interface MonthlyBudgetReport {
  month: number;
  year: number;
  overallBudget?: {
    budgetId?: string;
    budgetAmount: number;
    spentAmount: number;
    remainingAmount: number;
    percentageUsed: number;
    status: "NORMAL" | "WARNING" | "OVERDRAFT";
    overdraftAmount: number;
  };
  categories: CategoryBudgetProgress[];
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
 * Establece o actualiza el límite de presupuesto (global o por categoría) para un mes.
 */
export async function setBudget(input: BudgetInput): Promise<ActionResult<any>> {
  try {
    const userId = await getCurrentUserId();
    const validated = BudgetInputSchema.safeParse(input);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { month, year, amount, categoryId } = validated.data;
    const catId = categoryId || null;

    // Buscar si ya existe presupuesto para este período y categoría
    const existing = await prisma.budget.findFirst({
      where: {
        userId,
        month,
        year,
        categoryId: catId,
      },
    });

    let savedBudget;
    if (existing) {
      savedBudget = await prisma.budget.update({
        where: { id: existing.id },
        data: {
          amount: new Prisma.Decimal(amount.toFixed(2)),
        },
      });
    } else {
      savedBudget = await prisma.budget.create({
        data: {
          userId,
          month,
          year,
          amount: new Prisma.Decimal(amount.toFixed(2)),
          categoryId: catId,
        },
      });
    }

    revalidatePath("/budgets");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...savedBudget,
        amount: Number(savedBudget.amount),
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al configurar el presupuesto" };
  }
}

/**
 * Obtiene el reporte consolidado de presupuestos del mes con avance y alertas.
 */
export async function getMonthlyBudgetReport(
  month: number,
  year: number
): Promise<ActionResult<MonthlyBudgetReport>> {
  try {
    const userId = await getCurrentUserId();

    // Rango de fechas del mes en UTC
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Consultas concurrentes
    const [categories, transactions, budgetsThisMonth, previousBudgets] = await Promise.all([
      // Categorías de Gasto accesibles
      prisma.category.findMany({
        where: {
          type: "EXPENSE",
          OR: [{ isDefault: true }, { userId }],
        },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      }),
      // Gastos del mes
      prisma.transaction.findMany({
        where: {
          userId,
          type: "EXPENSE",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          categoryId: true,
          amount: true,
        },
      }),
      // Presupuestos creados para este mes
      prisma.budget.findMany({
        where: {
          userId,
          month,
          year,
        },
      }),
      // Presupuestos más recientes de meses previos para renovación automática de base
      prisma.budget.findMany({
        where: {
          userId,
          OR: [{ year: { lt: year } }, { year, month: { lt: month } }],
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      }),
    ]);

    // Sumar gastos agrupados por categoría
    const spentByCategory: Record<string, number> = {};
    let totalMonthlyExpense = 0;

    for (const t of transactions) {
      const amt = Number(t.amount);
      totalMonthlyExpense = addMoney(totalMonthlyExpense, amt);
      spentByCategory[t.categoryId] = addMoney(spentByCategory[t.categoryId] || 0, amt);
    }

    // Identificar presupuesto global del mes (categoryId = null)
    const globalBudget = budgetsThisMonth.find((b) => b.categoryId === null);
    let overallBudgetProgress = undefined;

    if (globalBudget) {
      const globalStatus = calculateBudgetStatus(Number(globalBudget.amount), totalMonthlyExpense);
      overallBudgetProgress = {
        budgetId: globalBudget.id,
        ...globalStatus,
      };
    }

    // Construir mapa de presupuestos por categoría (incluyendo auto-renovación base)
    const categoryBudgetMap: Record<string, { id?: string; amount: number; isAutoRenewed: boolean }> =
      {};

    // 1. Presupuestos creados explícitamente para este mes
    for (const b of budgetsThisMonth) {
      if (b.categoryId) {
        categoryBudgetMap[b.categoryId] = {
          id: b.id,
          amount: Number(b.amount),
          isAutoRenewed: false,
        };
      }
    }

    // 2. Para categorías sin presupuesto en este mes, heredar el monto base del último mes configurado (sin rollover)
    for (const b of previousBudgets) {
      if (b.categoryId && !categoryBudgetMap[b.categoryId]) {
        categoryBudgetMap[b.categoryId] = {
          id: undefined, // no es un registro en este mes aún
          amount: Number(b.amount),
          isAutoRenewed: true,
        };
      }
    }

    const categoryProgressList: CategoryBudgetProgress[] = [];
    const alerts: BudgetAlert[] = [];

    for (const cat of categories) {
      const budgetConfig = categoryBudgetMap[cat.id];
      const spent = spentByCategory[cat.id] || 0;
      const budgetAmount = budgetConfig ? budgetConfig.amount : 0;

      // Si tiene presupuesto asignado o gasto en el mes
      if (budgetAmount > 0 || spent > 0) {
        const status = calculateBudgetStatus(budgetAmount, spent);

        categoryProgressList.push({
          budgetId: budgetConfig?.id,
          categoryId: cat.id,
          categoryName: cat.name,
          categoryIcon: cat.icon,
          categoryColor: cat.color,
          budgetAmount,
          spentAmount: status.spentAmount,
          remainingAmount: status.remainingAmount,
          percentageUsed: status.percentageUsed,
          status: status.status,
          overdraftAmount: status.overdraftAmount,
          isAutoRenewed: budgetConfig?.isAutoRenewed,
        });

        // Generar alertas visuales estandarizadas (80% advertencia y 100% sobregiro)
        if (budgetAmount > 0) {
          if (status.status === "OVERDRAFT") {
            alerts.push({
              id: `alert-overdraft-${cat.id}`,
              severity: "destructive",
              title: `Presupuesto de ${cat.name} excedido`,
              description: `Has superado el límite de ${formatPEN(budgetAmount)} gastando ${formatPEN(
                spent
              )} (exceso de ${formatPEN(status.overdraftAmount)}).`,
              categoryName: cat.name,
              overdraftAmount: status.overdraftAmount,
              percentageUsed: status.percentageUsed,
            });
          } else if (status.status === "WARNING") {
            alerts.push({
              id: `alert-warning-${cat.id}`,
              severity: "warning",
              title: `Presupuesto de ${cat.name} al ${status.percentageUsed}%`,
              description: `Has consumido ${formatPEN(spent)} de tu límite de ${formatPEN(
                budgetAmount
              )}. Te quedan disponibles ${formatPEN(status.remainingAmount)}.`,
              categoryName: cat.name,
              overdraftAmount: 0,
              percentageUsed: status.percentageUsed,
            });
          }
        }
      }
    }

    // Alerta de presupuesto global si fue superado o está cerca
    if (overallBudgetProgress && overallBudgetProgress.budgetAmount > 0) {
      if (overallBudgetProgress.status === "OVERDRAFT") {
        alerts.unshift({
          id: "alert-global-overdraft",
          severity: "destructive",
          title: "Presupuesto General del Mes Excedido",
          description: `El gasto total (${formatPEN(totalMonthlyExpense)}) superó el límite general (${formatPEN(
            overallBudgetProgress.budgetAmount
          )}) por ${formatPEN(overallBudgetProgress.overdraftAmount)}.`,
          categoryName: "Presupuesto General",
          overdraftAmount: overallBudgetProgress.overdraftAmount,
          percentageUsed: overallBudgetProgress.percentageUsed,
        });
      } else if (overallBudgetProgress.status === "WARNING") {
        alerts.unshift({
          id: "alert-global-warning",
          severity: "warning",
          title: `Presupuesto General al ${overallBudgetProgress.percentageUsed}%`,
          description: `Has alcanzado el ${overallBudgetProgress.percentageUsed}% de tu presupuesto global de ${getMonthName(
            month
          )}. Saldo disponible: ${formatPEN(overallBudgetProgress.remainingAmount)}.`,
          categoryName: "Presupuesto General",
          overdraftAmount: 0,
          percentageUsed: overallBudgetProgress.percentageUsed,
        });
      }
    }

    return {
      success: true,
      data: {
        month,
        year,
        overallBudget: overallBudgetProgress,
        categories: categoryProgressList,
        alerts,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al obtener reporte de presupuestos",
    };
  }
}
