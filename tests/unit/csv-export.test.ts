import { describe, it, expect } from "vitest";
import { generateTransactionsCSV } from "@/lib/export/csv";

describe("CSV Export Generation & UTF-8 BOM", () => {
  it("prefixes output with UTF-8 BOM character for Excel compatibility", () => {
    const csv = generateTransactionsCSV([]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
  });

  it("formats header and transaction rows accurately", () => {
    const rows = [
      {
        date: "2026-10-27",
        type: "EXPENSE" as const,
        categoryName: "Alimentación",
        amount: 85.5,
        description: "Almuerzo ejecutivo en menú criollo",
      },
      {
        date: "2026-10-28",
        type: "INCOME" as const,
        categoryName: "Salario",
        amount: 3500.0,
        description: null,
      },
    ];

    const csv = generateTransactionsCSV(rows);
    expect(csv).toContain('"Fecha","Tipo","Categoría","Monto (PEN)","Descripción"');
    expect(csv).toContain('"2026-10-27","Gasto","Alimentación","85.50","Almuerzo ejecutivo en menú criollo"');
    expect(csv).toContain('"2026-10-28","Ingreso","Salario","3500.00",""');
  });

  it("escapes quotes, commas and special characters in descriptions properly", () => {
    const rows = [
      {
        date: "2026-10-29",
        type: "EXPENSE" as const,
        categoryName: "Educación",
        amount: 120.0,
        description: 'Libro de "Cálculo", tomo 1',
      },
    ];

    const csv = generateTransactionsCSV(rows);
    // Escaped double quotes should appear as ""
    expect(csv).toContain('"Libro de ""Cálculo"", tomo 1"');
  });
});
