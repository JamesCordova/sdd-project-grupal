import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL debe ser una URL de conexión válida"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET debe tener al menos 16 caracteres"),
  NEXTAUTH_URL: z.string().url().default("http://localhost:3000"),
  AUTH_SECRET: z.string().optional(),
  DEFAULT_CURRENCY: z.string().default("PEN"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  DEFAULT_CURRENCY: process.env.DEFAULT_CURRENCY || "PEN",
});
