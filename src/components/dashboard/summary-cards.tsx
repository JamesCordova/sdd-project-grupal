import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPEN } from "@/lib/finance/currency";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export function SummaryCards({ totalIncome, totalExpense, netBalance }: SummaryCardsProps) {
  const isPositiveBalance = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Ingresos */}
      <Card className="border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-colors shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Ingresos</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {formatPEN(totalIncome)}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              <span>Entradas acumuladas este mes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos */}
      <Card className="border border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 transition-colors shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Total Gastos</span>
            <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {formatPEN(totalExpense)}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
              <span>Salidas devengadas este mes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Balance Neto */}
      <Card
        className={`border transition-colors shadow-sm ${
          isPositiveBalance
            ? "border-primary/20 bg-primary/5 hover:border-primary/40"
            : "border-destructive/30 bg-destructive/5 hover:border-destructive/50"
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">Balance Neto</span>
            <div
              className={`p-2 rounded-lg ${
                isPositiveBalance
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2">
            <p
              className={`text-2xl font-bold tracking-tight ${
                isPositiveBalance
                  ? "text-primary"
                  : "text-destructive font-extrabold"
              }`}
            >
              {formatPEN(netBalance)}
            </p>
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <span>
                {isPositiveBalance
                  ? "Superávit neto disponible"
                  : "Déficit mensual (gastos > ingresos)"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
