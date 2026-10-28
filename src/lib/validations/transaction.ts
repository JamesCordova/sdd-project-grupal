import { z } from "zod";

export const TransactionInputSchema = z.object({
  amount: z
    .number({ required_error: "El monto es obligatorio" })
    .positive("El monto debe ser mayor a 0")
    .max(999999999.99, "El monto supera el límite permitido")
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: "El monto no puede tener más de 2 decimales",
    }),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Debes seleccionar si es Ingreso o Gasto",
  }),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "La fecha debe tener formato YYYY-MM-DD",
  }),
  categoryId: z.string().min(1, "Debes seleccionar una categoría"),
  description: z
    .string()
    .trim()
    .max(255, "La descripción no puede superar los 255 caracteres")
    .optional()
    .nullable(),
});

export type TransactionInput = z.infer<typeof TransactionInputSchema>;
