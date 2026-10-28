import { test, expect } from "@playwright/test";

test.describe("Core User Journey - Personal Finance Tracker", () => {
  test("loads the dashboard and navigates smoothly between core sections", async ({ page }) => {
    // 1. Visitar el panel principal
    await page.goto("/dashboard");
    await expect(page).toHaveTitle(/Finanzas/i);
    await expect(page.locator("h1")).toContainText(/Panel Financiero|Resumen Financiero/i);

    // Verificar insignias de Soles Peruanos (PEN)
    await expect(page.getByText(/Soles Peruanos \(PEN\)/i)).toBeVisible();

    // 2. Navegar a Categorías
    await page.goto("/categories");
    await expect(page.locator("h1")).toContainText(/Categorías/i);
    await expect(page.getByText("Alimentación")).toBeVisible();
    await expect(page.getByText("Transporte")).toBeVisible();

    // 3. Navegar a Transacciones
    await page.goto("/transactions");
    await expect(page.locator("h1")).toContainText(/Transacciones/i);
    await expect(page.getByRole("button", { name: /Nuevo Movimiento/i })).toBeVisible();

    // 4. Navegar a Presupuestos
    await page.goto("/budgets");
    await expect(page.locator("h1")).toContainText(/Presupuestos/i);
    await expect(page.getByRole("button", { name: /Configurar Límite/i })).toBeVisible();

    // 5. Navegar a Reportes
    await page.goto("/reports");
    await expect(page.locator("h1")).toContainText(/Reportes/i);
    await expect(page.getByRole("button", { name: /Exportar a CSV/i }).first()).toBeVisible();

    // 6. Navegar a Tendencias
    await page.goto("/reports/trends");
    await expect(page.locator("h1")).toContainText(/Tendencias/i);
  });
});
