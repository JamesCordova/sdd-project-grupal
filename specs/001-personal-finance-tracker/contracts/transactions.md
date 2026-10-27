# Interface Contract: Transactions Server Actions

**Feature**: `001-personal-finance-tracker`  
**Date**: 2026-10-27  
**Module**: `actions/transactions.ts`  

---

## 1. Esquema de Validación Zod (`TransactionInputSchema`)

```typescript
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
```

---

## 2. Server Actions

### `createTransaction(input: TransactionInput): Promise<ActionResult<TransactionDTO>>`
* **Autenticación**: Requerida (`auth()`). Extrae `userId` de la sesión.
* **Flujo**:
  1. Valida `input` con `TransactionInputSchema`. Si falla, retorna `{ success: false, errors }`.
  2. Comprueba que `categoryId` exista y pertenezca al usuario o sea de sistema (`isDefault: true`).
  3. Inserta registro en base de datos vía `prisma.transaction.create`.
  4. Llama a `revalidatePath('/dashboard')` y `revalidatePath('/transactions')`.
  5. Retorna `{ success: true, data: transaction }`.

### `updateTransaction(id: string, input: TransactionInput): Promise<ActionResult<TransactionDTO>>`
* **Autenticación**: Requerida.
* **Flujo**:
  1. Verifica que la transacción con `id` pertenezca a `session.user.id`. Si no pertenece, retorna error 403 Forbidden.
  2. Valida datos con `TransactionInputSchema`.
  3. Ejecuta `prisma.transaction.update`.
  4. Revalida rutas asociadas.

### `deleteTransaction(id: string): Promise<ActionResult<{ id: string }>>`
* **Autenticación**: Requerida.
* **Flujo**:
  1. Verifica pertenencia del registro (`where: { id, userId: session.user.id }`).
  2. Ejecuta `prisma.transaction.delete`.
  3. Revalida rutas.

### `getTransactions(filters: TransactionFilterInput): Promise<PaginatedResponse<TransactionDTO>>`
* **Parámetros**:
  ```typescript
  export interface TransactionFilterInput {
    startDate?: string;    // "YYYY-MM-DD"
    endDate?: string;      // "YYYY-MM-DD"
    type?: "INCOME" | "EXPENSE";
    categoryId?: string;
    search?: string;       // Búsqueda en descripción
    page?: number;         // Default: 1
    limit?: number;        // Default: 20
  }
  ```
* **Respuesta**:
  ```typescript
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    totalPages: number;
    summary: {
      totalIncome: string; // Formateado en PEN
      totalExpense: string;
      netBalance: string;
    };
  }
  ```
