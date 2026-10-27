import Decimal from "decimal.js";

export interface CategoryMonthSpend {
  categoryId: string;
  categoryName: string;
  categoryColor?: string | null;
  categoryIcon?: string | null;
  currentAmount: number;
  previousAmount: number;
  diffAmount: number;
  percentageChange: number;
  direction: "INCREASE" | "DECREASE" | "STABLE" | "NEW" | "ZERO";
  isSignificant: boolean; // Cambios mayores a +-20%
}

export interface TrendAnalysisResult {
  hasSufficientData: boolean;
  message?: string;
  currentMonthName: string;
  previousMonthName: string;
  totalCurrentExpense: number;
  totalPreviousExpense: number;
  totalExpenseDiff: number;
  totalPercentageChange: number;
  categories: CategoryMonthSpend[];
  insights: Array<{
    type: "warning" | "success" | "info";
    title: string;
    description: string;
  }>;
}

/**
 * Calcula la variación porcentual entre dos importes monetarios usando decimal.js
 */
export function calculatePercentageChange(current: number, previous: number): {
  percentageChange: number;
  direction: "INCREASE" | "DECREASE" | "STABLE" | "NEW" | "ZERO";
} {
  const dCurr = new Decimal(current || 0);
  const dPrev = new Decimal(previous || 0);

  if (dPrev.isZero()) {
    if (dCurr.isZero()) {
      return { percentageChange: 0, direction: "ZERO" };
    }
    return { percentageChange: 100, direction: "NEW" };
  }

  if (dCurr.isZero()) {
    return { percentageChange: -100, direction: "ZERO" };
  }

  // ((curr - prev) / prev) * 100
  const diff = dCurr.minus(dPrev);
  const pct = diff.dividedBy(dPrev).times(100).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toNumber();

  let direction: "INCREASE" | "DECREASE" | "STABLE" = "STABLE";
  if (pct > 0.5) direction = "INCREASE";
  else if (pct < -0.5) direction = "DECREASE";

  return { percentageChange: pct, direction };
}

/**
 * Analiza las variaciones intermensuales y genera insights amigables sobre hábitos de gasto
 */
export function analyzeMonthlyTrends(
  currentExpenses: Array<{ categoryId: string; categoryName: string; color?: string | null; icon?: string | null; amount: number }>,
  previousExpenses: Array<{ categoryId: string; categoryName: string; color?: string | null; icon?: string | null; amount: number }>,
  currentMonthName: string,
  previousMonthName: string,
  totalHistoricalMonthsCount: number
): TrendAnalysisResult {
  // Regla de suficiencia: se requieren al menos 2 meses con actividad registrada
  if (totalHistoricalMonthsCount < 2) {
    return {
      hasSufficientData: false,
      message:
        "Se requieren al menos 2 meses consecutivos con transacciones registradas para analizar tendencias comparativas y hábitos de consumo.",
      currentMonthName,
      previousMonthName,
      totalCurrentExpense: 0,
      totalPreviousExpense: 0,
      totalExpenseDiff: 0,
      totalPercentageChange: 0,
      categories: [],
      insights: [
        {
          type: "info",
          title: "Generando historial",
          description:
            "Continúa registrando tus gastos este mes. El próximo mes tendrás acceso completo a tus comparativas de hábitos y variaciones por categoría.",
        },
      ],
    };
  }

  // Mapear gastos previos por categoría
  const prevMap = new Map<string, { name: string; amount: number; color?: string | null; icon?: string | null }>();
  for (const p of previousExpenses) {
    prevMap.set(p.categoryId, {
      name: p.categoryName,
      amount: p.amount,
      color: p.color,
      icon: p.icon,
    });
  }

  const allCategoryIds = new Set<string>([
    ...currentExpenses.map((c) => c.categoryId),
    ...previousExpenses.map((p) => p.categoryId),
  ]);

  const categoriesResult: CategoryMonthSpend[] = [];
  let sumCurrent = new Decimal(0);
  let sumPrev = new Decimal(0);

  for (const catId of allCategoryIds) {
    const curItem = currentExpenses.find((c) => c.categoryId === catId);
    const prevItem = prevMap.get(catId);

    const cAmount = curItem?.amount || 0;
    const pAmount = prevItem?.amount || 0;
    const catName = curItem?.categoryName || prevItem?.name || "Categoría";
    const catColor = curItem?.color || prevItem?.color;
    const catIcon = curItem?.icon || prevItem?.icon;

    sumCurrent = sumCurrent.plus(cAmount);
    sumPrev = sumPrev.plus(pAmount);

    const diff = new Decimal(cAmount).minus(pAmount).toNumber();
    const { percentageChange, direction } = calculatePercentageChange(cAmount, pAmount);
    const isSignificant = Math.abs(percentageChange) >= 20;

    categoriesResult.push({
      categoryId: catId,
      categoryName: catName,
      categoryColor: catColor,
      categoryIcon: catIcon,
      currentAmount: cAmount,
      previousAmount: pAmount,
      diffAmount: diff,
      percentageChange,
      direction,
      isSignificant,
    });
  }

  // Ordenar de mayor a menor impacto de gasto actual
  categoriesResult.sort((a, b) => b.currentAmount - a.currentAmount);

  const totalCur = sumCurrent.toNumber();
  const totalPrev = sumPrev.toNumber();
  const totalDiff = sumCurrent.minus(sumPrev).toNumber();
  const totalPct = calculatePercentageChange(totalCur, totalPrev).percentageChange;

  // Generar Insights inteligentes
  const insights: Array<{ type: "warning" | "success" | "info"; title: string; description: string }> = [];

  const significantIncreases = categoriesResult.filter(
    (c) => c.direction === "INCREASE" && c.percentageChange >= 25 && c.currentAmount > 50
  );
  if (significantIncreases.length > 0) {
    const top = significantIncreases[0];
    insights.push({
      type: "warning",
      title: `Aumento notable en ${top.categoryName}`,
      description: `Has gastado un +${top.percentageChange}% más respecto al mes de ${previousMonthName} (+S/ ${top.diffAmount.toFixed(2)}).`,
    });
  }

  const significantSavings = categoriesResult.filter(
    (c) => c.direction === "DECREASE" && c.percentageChange <= -20 && c.previousAmount > 50
  );
  if (significantSavings.length > 0) {
    const topSave = significantSavings[0];
    insights.push({
      type: "success",
      title: `Excelente ahorro en ${topSave.categoryName}`,
      description: `Redujiste tu gasto en un ${Math.abs(topSave.percentageChange)}% en comparación con ${previousMonthName} (ahorro de S/ ${Math.abs(topSave.diffAmount).toFixed(2)}).`,
    });
  }

  if (totalDiff < 0) {
    insights.push({
      type: "success",
      title: "Gasto total inferior al mes anterior",
      description: `Tu gasto global en ${currentMonthName} se redujo un ${Math.abs(totalPct)}% frente a ${previousMonthName}.`,
    });
  } else if (totalDiff > 0) {
    insights.push({
      type: "info",
      title: "Gasto global en incremento",
      description: `El total de egresos es un +${totalPct}% mayor respecto al mes previo.`,
    });
  }

  return {
    hasSufficientData: true,
    currentMonthName,
    previousMonthName,
    totalCurrentExpense: totalCur,
    totalPreviousExpense: totalPrev,
    totalExpenseDiff: totalDiff,
    totalPercentageChange: totalPct,
    categories: categoriesResult,
    insights,
  };
}
