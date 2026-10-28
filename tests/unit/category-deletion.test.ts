import { describe, it, expect } from "vitest";

// Función pura que encapsula la regla de protección referencial para pruebas unitarias
export function canDeleteCategory(
  transactionCount: number,
  isDefault: boolean
): { canDelete: boolean; error?: string } {
  if (isDefault) {
    return {
      canDelete: false,
      error: "No se pueden eliminar categorías predeterminadas del sistema.",
    };
  }

  if (transactionCount > 0) {
    return {
      canDelete: false,
      error:
        "No se puede eliminar la categoría porque contiene transacciones asociadas. Reasigna los movimientos primero.",
    };
  }

  return { canDelete: true };
}

describe("Category Deletion Protection Logic", () => {
  it("allows deletion when category is custom and has zero transactions", () => {
    const result = canDeleteCategory(0, false);
    expect(result.canDelete).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("blocks deletion when category has 1 or more associated transactions", () => {
    const resultWithOne = canDeleteCategory(1, false);
    expect(resultWithOne.canDelete).toBe(false);
    expect(resultWithOne.error).toContain("contiene transacciones asociadas");

    const resultWithMany = canDeleteCategory(15, false);
    expect(resultWithMany.canDelete).toBe(false);
  });

  it("blocks deletion when category is marked as system default", () => {
    const result = canDeleteCategory(0, true);
    expect(result.canDelete).toBe(false);
    expect(result.error).toContain("categorías predeterminadas");
  });
});
