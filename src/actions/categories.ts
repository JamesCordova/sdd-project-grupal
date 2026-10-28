"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { CategoryInputSchema, type CategoryInput } from "@/lib/validations/category";
import { TransactionType } from "@prisma/client";

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Obtiene el ID del usuario autenticado o del usuario demo para desarrollo
async function getCurrentUserId(): Promise<string> {
  const session = await auth();
  if (session?.user?.id) {
    return session.user.id;
  }
  // Fallback a usuario demo para desarrollo local
  const demoUser = await prisma.user.findFirst({
    where: { email: "demo@finanzas.pe" },
  });
  if (demoUser) {
    return demoUser.id;
  }
  throw new Error("No autenticado y no se encontró usuario demo.");
}

/**
 * Obtiene todas las categorías disponibles (las del sistema más las creadas por el usuario).
 */
export async function getCategories(type?: "INCOME" | "EXPENSE") {
  try {
    const userId = await getCurrentUserId();

    const categories = await prisma.category.findMany({
      where: {
        AND: [
          type ? { type: type as TransactionType } : {},
          {
            OR: [{ isDefault: true }, { userId }],
          },
        ],
      },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });

    return { success: true, data: categories };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al obtener categorías" };
  }
}

/**
 * Crea una categoría personalizada para el usuario actual.
 */
export async function createCategory(input: CategoryInput): Promise<ActionResult<any>> {
  try {
    const userId = await getCurrentUserId();
    const validated = CategoryInputSchema.safeParse(input);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(", "),
      };
    }

    const { name, type, icon, color } = validated.data;

    // Verificar si ya existe una categoría con el mismo nombre y tipo para este usuario
    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: name, mode: "insensitive" },
        type: type as TransactionType,
        OR: [{ isDefault: true }, { userId }],
      },
    });

    if (existing) {
      return {
        success: false,
        error: `Ya existe una categoría de ${type === "INCOME" ? "ingreso" : "gasto"} con el nombre "${name}".`,
      };
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        type: type as TransactionType,
        icon: icon || "Tag",
        color: color || "#64748B",
        isDefault: false,
        userId,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");

    return { success: true, data: newCategory };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al crear la categoría" };
  }
}

/**
 * Actualiza una categoría personalizada existente.
 */
export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<ActionResult<any>> {
  try {
    const userId = await getCurrentUserId();
    const validated = CategoryInputSchema.safeParse(input);

    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors.map((e) => e.message).join(", "),
      };
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return { success: false, error: "Categoría no encontrada" };
    }

    if (category.isDefault) {
      return {
        success: false,
        error: "No se pueden editar las categorías predeterminadas del sistema.",
      };
    }

    if (category.userId !== userId) {
      return { success: false, error: "No tienes permiso para modificar esta categoría." };
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        icon: validated.data.icon,
        color: validated.data.color,
      },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");

    return { success: true, data: updated };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al actualizar la categoría" };
  }
}

/**
 * Elimina una categoría personalizada garantizando la protección de integridad referencial.
 */
export async function deleteCategory(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await getCurrentUserId();

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!category) {
      return { success: false, error: "Categoría no encontrada" };
    }

    if (category.isDefault) {
      return {
        success: false,
        error: "No se pueden eliminar las categorías predeterminadas del sistema.",
      };
    }

    if (category.userId !== userId) {
      return { success: false, error: "No tienes permiso para eliminar esta categoría." };
    }

    if (category._count.transactions > 0) {
      return {
        success: false,
        error: `No se puede eliminar la categoría "${category.name}" porque tiene ${category._count.transactions} transacción(es) asociadas. Reasigna los movimientos primero.`,
      };
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/categories");
    revalidatePath("/transactions");
    revalidatePath("/dashboard");

    return { success: true, data: { id } };
  } catch (error: any) {
    return { success: false, error: error.message || "Error al eliminar la categoría" };
  }
}
