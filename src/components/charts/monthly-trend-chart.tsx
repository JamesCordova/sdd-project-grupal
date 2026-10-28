"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatPEN } from "@/lib/finance/currency";
import type { MonthTrendItem } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface MonthlyTrendChartProps {
  data: MonthTrendItem[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Tendencia de Ingresos vs Gastos
          </CardTitle>
          <CardDescription>Evolución de los últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground min-h-[280px]">
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-3">
            <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium">Sin datos históricos suficientes</p>
          <p className="text-xs text-muted-foreground mt-1">
            Conforme registres tus ingresos y gastos mes a mes, verás aquí su evolución comparada.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Tendencia de Ingresos vs Gastos
        </CardTitle>
        <CardDescription>Comparativa de flujos en los últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis
                dataKey="monthName"
                tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => (value >= 1000 ? `S/${(value / 1000).toFixed(0)}k` : `S/${value}`)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const incomeItem = payload.find((p) => p.dataKey === "income");
                    const expenseItem = payload.find((p) => p.dataKey === "expense");
                    const incomeVal = Number(incomeItem?.value || 0);
                    const expenseVal = Number(expenseItem?.value || 0);
                    const netVal = incomeVal - expenseVal;

                    return (
                      <div className="bg-popover/95 border border-border shadow-lg rounded-lg p-3 text-xs backdrop-blur-sm">
                        <p className="font-semibold text-foreground border-b border-border/50 pb-1 mb-2">
                          {label}
                        </p>
                        <div className="space-y-1">
                          <div className="flex justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                              Ingresos:
                            </span>
                            <span className="font-semibold">{formatPEN(incomeVal)}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                              Gastos:
                            </span>
                            <span className="font-semibold">{formatPEN(expenseVal)}</span>
                          </div>
                          <div className="border-t border-border/50 pt-1.5 flex justify-between gap-4">
                            <span className="text-muted-foreground">Flujo Neto:</span>
                            <span
                              className={`font-bold ${
                                netVal >= 0 ? "text-primary" : "text-destructive"
                              }`}
                            >
                              {formatPEN(netVal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground font-medium">
                    {value === "income" ? "Ingresos" : "Gastos"}
                  </span>
                )}
                iconType="circle"
                iconSize={8}
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: "12px" }}
              />
              <Bar
                dataKey="income"
                name="income"
                fill="#10B981"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
              <Bar
                dataKey="expense"
                name="expense"
                fill="#EF4444"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
