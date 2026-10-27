/**
 * Formatea un valor numérico a moneda oficial de Perú: Soles (PEN).
 * Ejemplo: 1250.5 -> "S/ 1,250.50"
 */
export function formatPEN(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return "S/ 0.00";
  }

  const num = Number(amount);
  const formatted = new Intl.NumberFormat("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);

  return `S/ ${formatted}`;
}

/**
 * Formatea una fecha en formato legible para Perú (DD/MM/AAAA)
 */
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Retorna el nombre del mes en español
 */
export function getMonthName(month: number): string {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Setiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return months[month - 1] || "";
}

/**
 * Retorna la abreviatura del mes en español (ej. Ene, Feb, Mar)
 */
export function getMonthNameShort(month: number): string {
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Oct",
    "Nov",
    "Dic",
  ];
  return months[month - 1] || "";
}

/**
 * Retorna el período "Mes Año" (ej. "Octubre 2026")
 */
export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}
