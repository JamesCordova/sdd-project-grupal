import { z } from "zod";

export const BudgetInputSchema = z.object({
  month: z.number().int().min(1, "El mes debe estar entre 1 y 12").max(12, "El mes debe estar entre 1 y 12"),
  year: z.number().int().min(2020, "Año no válido").max(2100, "Año no válido"),
  amount: z
    .number({ required_error: "El límite de presupuesto es obligatorio" })
    .positive("El presupuesto debe ser mayor a 0")
    .max(999999999.99, "El monto supera el límite permitido")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "El presupuesto no puede tener más de 2 decimales",
    }),
  categoryId: z.string().optional().nullable(), // null = Presupuesto Global
});

export type BudgetInput = z.infer<typeof BudgetInputSchema>;
