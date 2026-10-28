"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { TransactionInputSchema, type TransactionInput } from "@/lib/validations/transaction";
import { addMoney, calculateNetBalance } from "@/lib/finance/calculations";
import { TransactionType, Prisma } from "@prisma/client";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface TransactionFilterInput {
  startDate?: string;
  endDate?: string;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }
  // Fallback para desarrollo local
  const demoUser = await prisma.user.findFirst({
    where: { email: "demo@finanzas.pe" },
  });
  if (demoUser) {
    return demoUser.id;
  }
  throw new Error("No autenticado y no se encontró usuario demo.");
}

/**
 * Registra una nueva transacción financiera (Ingreso o Gasto).
 */
export async function createTransaction(input: TransactionInput): Promise<ActionResult<any>> {
  try {
    const userId = await getCurrentUserId();
    const validated = TransactionInputSchema.safeParse(input);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { amount, type, date, categoryId, description } = validated.data;

    // Verificar que la categoría exista y sea accesible para este usuario
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ isDefault: true }, { userId }],
      },
    });

    if (!category) {
      return { success: false, error: "Categoría no válida o no encontrada" };
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: new Prisma.Decimal(amount.toFixed(2)),
        type: type as TransactionType,
        date: new Date(`${date}T00:00:00.000Z`),
        categoryId,
        description: description?.trim() || null,
        userId,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return {
      success: true,
      data: {
        ...transaction,
        amount: Number(transaction.amount),
        date: transaction.date.toISOString().split("T")[0],
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al registrar la transacción" };
  }
}

/**
 * Modifica una transacción existente garantizando aislamiento de usuario.
 */
export async function updateTransaction(
  id: string,
  input: TransactionInput
): Promise<ActionResult<any>> {
  try {
    const userId = await getCurrentUserId();
    const validated = TransactionInputSchema.safeParse(input);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(", "),
      };
    }

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Transacción no encontrada o no tienes permiso para editarla" };
    }

    const { amount, type, date, categoryId, description } = validated.data;

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        amount: new Prisma.Decimal(amount.toFixed(2)),
        type: type as TransactionType,
        date: new Date(`${date}T00:00:00.000Z`),
        categoryId,
        description: description?.trim() || null,
      },
      include: {
        category: true,
      },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return {
      success: true,
      data: {
        ...updated,
        amount: Number(updated.amount),
        date: updated.date.toISOString().split("T")[0],
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar la transacción" };
  }
}

/**
 * Elimina una transacción con recálculo atómico de balances.
 */
export async function deleteTransaction(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await getCurrentUserId();

    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return { success: false, error: "Transacción no encontrada o sin permiso para eliminarla" };
    }

    await prisma.transaction.delete({
      where: { id },
    });

    revalidatePath("/transactions");
    revalidatePath("/dashboard");
    revalidatePath("/budgets");
    revalidatePath("/reports");

    return { success: true, data: { id } };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar la transacción" };
  }
}

/**
 * Obtiene transacciones paginadas y filtradas para el usuario actual.
 */
export async function getTransactions(filters: TransactionFilterInput = {}) {
  try {
    const userId = await getCurrentUserId();
    const { startDate, endDate, type, categoryId, search, page = 1, limit = 20 } = filters;

    const where: Prisma.TransactionWhereInput = {
      userId,
      AND: [
        type ? { type: type as TransactionType } : {},
        categoryId ? { categoryId } : {},
        startDate ? { date: { gte: new Date(`${startDate}T00:00:00.000Z`) } } : {},
        endDate ? { date: { lte: new Date(`${endDate}T23:59:59.999Z`) } } : {},
        search
          ? {
              description: {
                contains: search,
                mode: "insensitive",
              },
            }
          : {},
      ],
    };

    const [items, total, allTransactionsForSummary] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        select: { amount: true, type: true },
      }),
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of allTransactionsForSummary) {
      const numAmount = Number(t.amount);
      if (t.type === "INCOME") {
        totalIncome = addMoney(totalIncome, numAmount);
      } else {
        totalExpense = addMoney(totalExpense, numAmount);
      }
    }

    const netBalance = calculateNetBalance(totalIncome, totalExpense);

    return {
      success: true,
      data: {
        items: items.map((t) => ({
          id: t.id,
          amount: Number(t.amount),
          type: t.type,
          date: t.date.toISOString().split("T")[0],
          description: t.description,
          categoryId: t.categoryId,
          category: t.category,
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
        summary: {
          totalIncome,
          totalExpense,
          netBalance,
        },
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al obtener transacciones" };
  }
}
