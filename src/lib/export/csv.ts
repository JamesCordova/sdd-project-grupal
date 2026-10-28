/**
 * Genera contenido CSV con codificación UTF-8 y marca de orden de bytes (BOM: \uFEFF)
 * para asegurar total compatibilidad con Microsoft Excel en español sin caracteres dañados.
 */

export interface ExportTransactionRow {
  date: string;
  type: "INCOME" | "EXPENSE";
  categoryName: string;
  amount: number;
  description: string | null;
}

/**
 * Escapa valores para cumplir el estándar RFC 4180
 */
function escapeCSVValue(val: string | number | null | undefined): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  // Si contiene comas, comillas dobles o saltos de línea, se encierra entre comillas y se duplican las comillas internas
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Convierte un arreglo de transacciones a una cadena CSV con UTF-8 BOM
 */
export function generateTransactionsCSV(rows: ExportTransactionRow[]): string {
  const BOM = "\uFEFF";
  const headers = ["Fecha", "Tipo", "Categoría", "Monto (PEN)", "Descripción"];

  const headerLine = headers.map(escapeCSVValue).join(",");

  const dataLines = rows.map((r) => {
    const formattedType = r.type === "INCOME" ? "Ingreso" : "Gasto";
    const formattedAmount = r.amount.toFixed(2);
    return [
      escapeCSVValue(r.date),
      escapeCSVValue(formattedType),
      escapeCSVValue(r.categoryName),
      escapeCSVValue(formattedAmount),
      escapeCSVValue(r.description || ""),
    ].join(",");
  });

  return BOM + [headerLine, ...dataLines].join("\r\n");
}
