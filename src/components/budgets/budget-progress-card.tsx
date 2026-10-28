"use client";

import * as React from "react";
import { formatPEN } from "@/lib/finance/currency";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";
import type { CategoryBudgetProgress } from "@/actions/budgets";

interface BudgetProgressCardProps {
  item: CategoryBudgetProgress;
  onEdit: (item: CategoryBudgetProgress) => void;
}

export function BudgetProgressCard({ item, onEdit }: BudgetProgressCardProps) {
  const isOverdraft = item.status === "OVERDRAFT";
  const isWarning = item.status === "WARNING";
  const isNormal = item.status === "NORMAL";

  // Porcentaje visual para la barra (máximo 100% de ancho)
  const barWidth = Math.min(Math.max(item.percentageUsed, 0), 100);

  let barColorClass = "bg-emerald-500";
  let badgeVariant: "default" | "secondary" | "destructive" | "warning" | "success" = "success";

  if (isOverdraft) {
    barColorClass = "bg-destructive";
    badgeVariant = "destructive";
  } else if (isWarning) {
    barColorClass = "bg-amber-500";
    badgeVariant = "warning";
  }

  return (
    <Card
      className={`border transition-all shadow-xs ${
        isOverdraft
          ? "border-destructive/40 bg-destructive/5"
          : isWarning
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-border hover:border-primary/40"
      }`}
    >
      <CardContent className="p-5 space-y-4">
        {/* Cabecera de la tarjeta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CategoryBadge
              name={item.categoryName}
              icon={item.categoryIcon}
              color={item.categoryColor}
            />
            {item.isAutoRenewed && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Renovado
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={badgeVariant} className="text-xs font-bold tabular-nums">
              {item.percentageUsed}%
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(item)}
              title="Ajustar límite de presupuesto"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Montos: Gastado / Presupuesto */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs text-muted-foreground">Gastado</span>
            <div className="text-lg font-bold tabular-nums text-foreground">
              {formatPEN(item.spentAmount)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground">Límite Mensual</span>
            <div className="text-sm font-semibold tabular-nums text-muted-foreground">
              {formatPEN(item.budgetAmount)}
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${barColorClass}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        {/* Pie de estado y saldo disponible o sobregiro */}
        <div className="pt-1 flex items-center justify-between text-xs">
          {isOverdraft ? (
            <div className="flex items-center gap-1.5 text-destructive font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Sobregiro: {formatPEN(item.overdraftAmount)}</span>
            </div>
          ) : isWarning ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Cerca del límite: quedan {formatPEN(item.remainingAmount)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Disponible: {formatPEN(item.remainingAmount)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
