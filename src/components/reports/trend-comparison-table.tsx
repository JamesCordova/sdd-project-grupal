import React from "react";
import { formatPEN } from "@/lib/finance/currency";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, Minus, AlertTriangle, Sparkles } from "lucide-react";
import type { CategoryMonthSpend } from "@/lib/finance/trend-analysis";

interface TrendComparisonTableProps {
  categories: CategoryMonthSpend[];
  currentMonthName: string;
  previousMonthName: string;
}

export function TrendComparisonTable({
  categories,
  currentMonthName,
  previousMonthName,
}: TrendComparisonTableProps) {
  if (categories.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm border rounded-xl bg-card">
        No se registraron gastos en las categorías evaluadas.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[200px]">Categoría</TableHead>
            <TableHead className="text-right">{previousMonthName}</TableHead>
            <TableHead className="text-right">{currentMonthName}</TableHead>
            <TableHead className="text-right">Diferencia (S/)</TableHead>
            <TableHead className="text-right">Variación (%)</TableHead>
            <TableHead className="text-center w-[120px]">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => {
            const isIncrease = cat.direction === "INCREASE" || cat.direction === "NEW";
            const isDecrease = cat.direction === "DECREASE" || cat.direction === "ZERO";
            const isNew = cat.direction === "NEW";
            const isZero = cat.direction === "ZERO";

            return (
              <TableRow
                key={cat.categoryId}
                className={`hover:bg-muted/30 transition-colors ${
                  cat.isSignificant && isIncrease ? "bg-rose-500/5 dark:bg-rose-500/10" : ""
                }`}
              >
                <TableCell className="font-medium">
                  <CategoryBadge
                    name={cat.categoryName}
                    color={cat.categoryColor}
                    icon={cat.categoryIcon}
                  />
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground">
                  {formatPEN(cat.previousAmount)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-semibold">
                  {formatPEN(cat.currentAmount)}
                </TableCell>
                <TableCell
                  className={`text-right tabular-nums font-medium ${
                    cat.diffAmount > 0
                      ? "text-rose-600 dark:text-rose-400"
                      : cat.diffAmount < 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {cat.diffAmount > 0 ? "+" : ""}
                  {formatPEN(cat.diffAmount)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  <div className="flex items-center justify-end gap-1 font-semibold">
                    {isIncrease ? (
                      <ArrowUpRight className="h-4 w-4 text-rose-500" />
                    ) : isDecrease ? (
                      <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span
                      className={
                        isIncrease
                          ? "text-rose-600 dark:text-rose-400"
                          : isDecrease
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }
                    >
                      {cat.percentageChange > 0 ? `+${cat.percentageChange}%` : `${cat.percentageChange}%`}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {isNew ? (
                    <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Nuevo
                    </Badge>
                  ) : isZero ? (
                    <Badge variant="outline" className="text-[11px] text-muted-foreground">
                      Sin gasto
                    </Badge>
                  ) : cat.isSignificant && isIncrease ? (
                    <Badge variant="destructive" className="text-[11px]">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      +{cat.percentageChange}%
                    </Badge>
                  ) : cat.isSignificant && isDecrease ? (
                    <Badge variant="outline" className="text-[11px] border-emerald-500 text-emerald-600 dark:text-emerald-400">
                      Ahorro
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Estable</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
