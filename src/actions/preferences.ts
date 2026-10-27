"use server";

import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface UserPreferencesDTO {
  currency: string;
  theme: string;
  warningThreshold: number;
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
  throw new Error("Usuario no autenticado");
}

export async function getUserPreferences(): Promise<{
  success: boolean;
  data?: UserPreferencesDTO;
  error?: string;
}> {
  try {
    const userId = await getCurrentUserId();
    let pref = await prisma.userPreference.findUnique({
      where: { userId },
    });

    if (!pref) {
      pref = await prisma.userPreference.create({
        data: {
          userId,
          currency: "PEN",
          theme: "system",
          warningThreshold: 80,
        },
      });
    }

    return {
      success: true,
      data: {
        currency: pref.currency,
        theme: pref.theme,
        warningThreshold: pref.warningThreshold,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al obtener preferencias de usuario",
    };
  }
}

export async function updateUserPreferences(input: {
  currency?: string;
  theme?: string;
  warningThreshold?: number;
}): Promise<{
  success: boolean;
  data?: UserPreferencesDTO;
  error?: string;
}> {
  try {
    const userId = await getCurrentUserId();

    const updated = await prisma.userPreference.upsert({
      where: { userId },
      update: {
        ...(input.currency && { currency: input.currency }),
        ...(input.theme && { theme: input.theme }),
        ...(input.warningThreshold !== undefined && { warningThreshold: input.warningThreshold }),
      },
      create: {
        userId,
        currency: input.currency || "PEN",
        theme: input.theme || "system",
        warningThreshold: input.warningThreshold || 80,
      },
    });

    revalidatePath("/dashboard");
    return {
      success: true,
      data: {
        currency: updated.currency,
        theme: updated.theme,
        warningThreshold: updated.warningThreshold,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Error al actualizar preferencias de usuario",
    };
  }
}
