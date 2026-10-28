import { PrismaClient, TransactionType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultCategories = [
  // GASTOS (EXPENSE)
  {
    name: "Alimentación",
    type: TransactionType.EXPENSE,
    icon: "Utensils",
    color: "#F97316",
    isDefault: true,
  },
  {
    name: "Transporte",
    type: TransactionType.EXPENSE,
    icon: "Car",
    color: "#3B82F6",
    isDefault: true,
  },
  {
    name: "Vivienda",
    type: TransactionType.EXPENSE,
    icon: "Home",
    color: "#8B5CF6",
    isDefault: true,
  },
  {
    name: "Salud",
    type: TransactionType.EXPENSE,
    icon: "HeartPulse",
    color: "#EF4444",
    isDefault: true,
  },
  {
    name: "Educación",
    type: TransactionType.EXPENSE,
    icon: "GraduationCap",
    color: "#06B6D4",
    isDefault: true,
  },
  {
    name: "Entretenimiento",
    type: TransactionType.EXPENSE,
    icon: "Film",
    color: "#EC4899",
    isDefault: true,
  },
  {
    name: "Servicios",
    type: TransactionType.EXPENSE,
    icon: "Zap",
    color: "#EAB308",
    isDefault: true,
  },
  // INGRESOS (INCOME)
  {
    name: "Sueldo",
    type: TransactionType.INCOME,
    icon: "Briefcase",
    color: "#10B981",
    isDefault: true,
  },
  {
    name: "Otros Ingresos",
    type: TransactionType.INCOME,
    icon: "Coins",
    color: "#14B8A6",
    isDefault: true,
  },
];

async function main() {
  console.log("🌱 Iniciando seed de categorías base...");

  for (const cat of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: cat.name,
        type: cat.type,
        userId: null,
      },
    });

    if (!existing) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
          isDefault: true,
          userId: null,
        },
      });
      console.log(`  ✓ Creada categoría: ${cat.name} (${cat.type})`);
    } else {
      console.log(`  - Categoría existente: ${cat.name}`);
    }
  }

  // Crear usuario demo para desarrollo y pruebas
  const demoEmail = "demo@finanzas.pe";
  const existingUser = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!existingUser) {
    const passwordHash = await bcrypt.hash("Demo123456!", 10);
    const demoUser = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Usuario Demo",
        passwordHash,
        preference: {
          create: {
            currency: "PEN",
            theme: "system",
            warningThreshold: 80,
          },
        },
      },
    });
    console.log(`👤 Creado usuario demo: ${demoUser.email} (Contraseña: Demo123456!)`);
  }

  console.log("✅ Seed finalizado correctamente.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
