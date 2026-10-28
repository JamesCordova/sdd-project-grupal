# Interface Contract: Categories Server Actions

**Feature**: `001-personal-finance-tracker`  
**Date**: 2026-10-27  
**Module**: `actions/categories.ts`  

---

## 1. Esquema de Validación Zod (`CategoryInputSchema`)

```typescript
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
    .regex(/^#([0-9A-F]{3}){1,2}$/i, "Debe ser un código hexadecimal válido (ej. #3B82F6)")
    .optional()
    .default("#64748B"),
});

export type CategoryInput = z.infer<typeof CategoryInputSchema>;
```

---

## 2. Server Actions

### `getCategories(type?: "INCOME" | "EXPENSE"): Promise<CategoryDTO[]>`
* Retorna categorías predeterminadas del sistema (`isDefault: true`) más las categorías creadas por el usuario autenticado (`userId: session.user.id`).

### `createCategory(input: CategoryInput): Promise<ActionResult<CategoryDTO>>`
* Verifica que el usuario no tenga ya una categoría con el mismo nombre y tipo.
* Inserta con `userId: session.user.id` e `isDefault: false`.

### `deleteCategory(id: string): Promise<ActionResult<{ success: boolean; message: string }>>`
* **Protección de integridad**:
  1. Consulta `prisma.transaction.count({ where: { categoryId: id } })`.
  2. Si el recuento es mayor a 0, **rechaza la eliminación** retornando:
     ```json
     {
       "success": false,
       "error": "No se puede eliminar la categoría porque contiene transacciones asociadas. Reasigna los movimientos primero."
     }
     ```
  3. Si no tiene transacciones asociadas y pertenece al usuario, ejecuta `prisma.category.delete`.
