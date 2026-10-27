"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { RegisterInputSchema, type RegisterInput } from "@/lib/validations/auth";
import { signIn, signOut } from "@/lib/auth";
import { AuthError } from "next-auth";

import { TransactionType } from "@prisma/client";

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

const DEFAULT_USER_CATEGORIES = [
  { name: "Alimentación", type: TransactionType.EXPENSE, icon: "Utensils", color: "#10B981", isDefault: true },
  { name: "Transporte", type: TransactionType.EXPENSE, icon: "Car", color: "#3B82F6", isDefault: true },
  { name: "Vivienda", type: TransactionType.EXPENSE, icon: "Home", color: "#8B5CF6", isDefault: true },
  { name: "Servicios", type: TransactionType.EXPENSE, icon: "Zap", color: "#F59E0B", isDefault: true },
  { name: "Salud", type: TransactionType.EXPENSE, icon: "HeartPulse", color: "#EF4444", isDefault: true },
  { name: "Entretenimiento", type: TransactionType.EXPENSE, icon: "Film", color: "#EC4899", isDefault: true },
  { name: "Educación", type: TransactionType.EXPENSE, icon: "GraduationCap", color: "#06B6D4", isDefault: true },
  { name: "Salario", type: TransactionType.INCOME, icon: "Briefcase", color: "#10B981", isDefault: true },
  { name: "Otros Ingresos", type: TransactionType.INCOME, icon: "Coins", color: "#84CC16", isDefault: true },
];

/**
 * Registra un nuevo usuario en la base de datos con contraseña cifrada (bcrypt),
 * sus preferencias iniciales en Soles (PEN) y el catálogo base de categorías.
 */
export async function registerUser(input: RegisterInput): Promise<ActionResult<{ userId: string; email: string }>> {
  try {
    const validated = RegisterInputSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Datos de registro inválidos",
      };
    }

    const { name, email, password } = validated.data;

    // Verificar si el correo ya existe
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya existe una cuenta registrada con este correo electrónico",
      };
    }

    // Hashear contraseña con bcrypt
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario en transacción con sus preferencias y categorías por defecto
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          preference: {
            create: {
              currency: "PEN",
              theme: "system",
            },
          },
        },
      });

      // Crear categorías iniciales para el nuevo usuario
      await tx.category.createMany({
        data: DEFAULT_USER_CATEGORIES.map((cat) => ({
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          isDefault: cat.isDefault,
          userId: user.id,
        })),
      });

      return user;
    });

    return {
      success: true,
      data: {
        userId: newUser.id,
        email: newUser.email,
      },
    };
  } catch (error: any) {
    console.error("Error en registerUser:", error);
    return {
      success: false,
      error: error.message || "Error al procesar el registro de la cuenta",
    };
  }
}

/**
 * Autentica al usuario mediante credenciales NextAuth v5
 */
export async function authenticateCredentials(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    await signIn("credentials", {
      email,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Credenciales inválidas. Verifica tu correo y contraseña.";
        default:
          return "Ocurrió un error al iniciar sesión. Inténtalo de nuevo.";
      }
    }
    throw error;
  }
}

/**
 * Cierra la sesión activa
 */
export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
