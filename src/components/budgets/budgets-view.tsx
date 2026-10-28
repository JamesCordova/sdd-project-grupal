"use client";

import * as React from "react";
import { Plus, ChevronLeft, ChevronRight, AlertTriangle, AlertCircle, PieChart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPEN, getMonthName } from "@/lib/finance/currency";
import { BudgetProgressCard } from "./budget-progress-card";
import { SetBudgetDialog } from "./set-budget-dialog";
import { type CategoryOption } from "@/components/categories/category-select";
import type { MonthlyBudgetReport, CategoryBudgetProgress } from "@/actions/budgets";
import { getMonthlyBudgetReport } from "@/actions/budgets";

interface BudgetsViewProps {
  initialReport: MonthlyBudgetReport;
  categories: CategoryOption[];
  currentMonth: number;
  currentYear: number;
}

export function BudgetsView({
  initialReport,
  categories,
  currentMonth: initialMonth,
  currentYear: initialYear,
}: BudgetsViewProps) {
  const [report, setReport] = React.useState(initialReport);
  const [month, setMonth] = React.useState(initialMonth);
  const [year, setYear] = React.useState(initialYear);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedBudget, setSelectedBudget] = React.useState<{
    categoryId?: string;
    amount: number;
  } | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const fetchReport = async (m: number, y: number) => {
    setIsLoading(true);
    try {
      const res = await getMonthlyBudgetReport(m, y);
      if (res.success && res.data) {
        setReport(res.data);
      }
    } catch (e) {
      console.error("Error al cargar reporte de presupuestos", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevMonth = () => {
    let newM = month - 1;
    let newY = year;
    if (newM < 1) {
      newM = 12;
      newY -= 1;
    }
    setMonth(newM);
    setYear(newY);
    fetchReport(newM, newY);
  };

  const handleNextMonth = () => {
    let newM = month + 1;
    let newY = year;
    if (newM > 12) {
      newM = 1;
      newY += 1;
    }
    setMonth(newM);
    setYear(newY);
    fetchReport(newM, newY);
  };

  const handleOpenSetBudget = (item?: CategoryBudgetProgress) => {
    if (item) {
      setSelectedBudget({
        categoryId: item.categoryId,
        amount: item.budgetAmount,
      });
    } else {
      setSelectedBudget(null);
    }
    setIsDialogOpen(true);
  };

  const handleOpenSetOverall = () => {
    setSelectedBudget({
      categoryId: undefined,
      amount: report.overallBudget?.budgetAmount || 0,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Navegación de Mes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Presupuestos Mensuales</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Establece techos de gasto y recibe avisos automáticos al 80% y 100% de ejecución.
          </p>
        </div>

        {/* Selector de Mes/Año y Botón de Creación */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border bg-card p-1 shadow-xs">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevMonth}
              title="Mes anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-semibold tabular-nums min-w-[120px] text-center">
              {getMonthName(month)} {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextMonth}
              title="Mes siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={() => handleOpenSetBudget()} className="gap-2 shadow-xs">
            <Plus className="h-4 w-4" />
            <span>Configurar Presupuesto</span>
          </Button>
        </div>
      </div>

      {/* Banner de Alertas Activas en este mes */}
      {report.alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>Avisos de Presupuesto ({report.alerts.length})</span>
          </h2>
          <div className="grid gap-2">
            {report.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-sm transition-all ${
                  alert.severity === "destructive"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {alert.severity === "destructive" ? (
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-xs opacity-90 mt-0.5">{alert.description}</div>
                  </div>
                </div>
                <Badge
                  variant={alert.severity === "destructive" ? "destructive" : "warning"}
                  className="shrink-0 text-xs"
                >
                  {alert.percentageUsed}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tarjeta de Presupuesto General (Si está configurado) */}
      {report.overallBudget ? (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-xs">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Presupuesto General del Mes</span>
                <Badge
                  variant={
                    report.overallBudget.status === "OVERDRAFT"
                      ? "destructive"
                      : report.overallBudget.status === "WARNING"
                      ? "warning"
                      : "default"
                  }
                  className="text-xs"
                >
                  {report.overallBudget.percentageUsed}% Consumido
                </Badge>
              </CardTitle>
              <CardDescription>
                Límite total asignado para todos tus gastos de {getMonthName(month)}
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenSetOverall}
              className="h-8 gap-1.5 text-xs"
            >
              Ajustar Límite General
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-muted-foreground">Gasto Total Acumulado</span>
                <div className="text-2xl font-bold tabular-nums">
                  {formatPEN(report.overallBudget.spentAmount)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Límite Mensual</span>
                <div className="text-base font-semibold tabular-nums text-muted-foreground">
                  {formatPEN(report.overallBudget.budgetAmount)}
                </div>
              </div>
            </div>

            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  report.overallBudget.status === "OVERDRAFT"
                    ? "bg-destructive"
                    : report.overallBudget.status === "WARNING"
                    ? "bg-amber-500"
                    : "bg-primary"
                }`}
                style={{
                  width: `${Math.min(Math.max(report.overallBudget.percentageUsed, 0), 100)}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-medium pt-1">
              {report.overallBudget.status === "OVERDRAFT" ? (
                <span className="text-destructive">
                  Sobregiro total: {formatPEN(report.overallBudget.overdraftAmount)}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Saldo disponible para el resto del mes:{" "}
                  <strong className="text-foreground">
                    {formatPEN(report.overallBudget.remainingAmount)}
                  </strong>
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed bg-card/40">
          <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">¿Deseas fijar un presupuesto general mensual?</h3>
                <p className="text-xs text-muted-foreground">
                  Establece un techo global para todo el mes de {getMonthName(month)}.
                </p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleOpenSetOverall}>
              Fijar Presupuesto General
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Grid de Presupuestos por Categoría */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight">Presupuestos por Categoría</h2>
          <span className="text-xs text-muted-foreground">
            {report.categories.length} categorías con presupuesto o gasto
          </span>
        </div>

        {report.categories.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed bg-card/40 flex flex-col items-center">
            <div className="p-3 bg-muted rounded-full text-muted-foreground mb-3">
              <PieChart className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold">Sin presupuestos asignados</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
              Aún no has fijado ningún límite por categoría para {getMonthName(month)} {year}.
            </p>
            <Button onClick={() => handleOpenSetBudget()} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Crear Primer Presupuesto</span>
            </Button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${
              isLoading ? "opacity-60 pointer-events-none transition-opacity" : ""
            }`}
          >
            {report.categories.map((item) => (
              <BudgetProgressCard
                key={item.categoryId}
                item={item}
                onEdit={handleOpenSetBudget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Diálogo Modal */}
      <SetBudgetDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categories={categories}
        currentMonth={month}
        currentYear={year}
        initialItem={selectedBudget}
        onSuccess={() => fetchReport(month, year)}
      />
    </div>
  );
}
