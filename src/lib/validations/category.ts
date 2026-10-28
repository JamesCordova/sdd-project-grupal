import { z } from "zod";

export const CategoryInputSchema = z.object({
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede superar los 50 caracteres"),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Debes seleccionar si es categoría de Ingreso o Gasto",
  }),
  icon: z.string().optional().default("Tag"),
  color: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, "Debe ser un código hexadecimal válido (ej. #3B82F6)")
    .optional()
    .default("#64748B"),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;
