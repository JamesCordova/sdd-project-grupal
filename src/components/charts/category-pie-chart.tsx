"use client";

import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatPEN } from "@/lib/finance/currency";
import type { CategorySpending } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart as PieIcon } from "lucide-react";

interface CategoryPieChartProps {
  data: CategorySpending[];
}

const DEFAULT_COLORS = [
  "#10B981",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#64748B",
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data || data.length === 0 || data.every((d) => d.amount === 0)) {
    return (
      <Card className="h-full flex flex-col justify-between">
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <PieIcon className="h-4 w-4 text-primary" />
            Gastos por Categoría
          </CardTitle>
          <CardDescription>Distribución porcentual del mes</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground min-h-[280px]">
          <div className="h-16 w-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-3">
            <PieIcon className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium">Sin gastos registrados en el periodo</p>
          <p className="text-xs text-muted-foreground mt-1">
            Los gastos categorizados aparecerán reflejados en este gráfico interactivo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-primary" />
          Gastos por Categoría
        </CardTitle>
        <CardDescription>Distribución porcentual acumulada</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                dataKey="amount"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.categoryId}`}
                    fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    stroke="var(--background)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as CategorySpending;
                    return (
                      <div className="bg-popover/95 border border-border shadow-lg rounded-lg p-3 text-xs backdrop-blur-sm">
                        <div className="flex items-center gap-2 font-medium">
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <div className="mt-1.5 flex justify-between gap-4">
                          <span className="text-muted-foreground">Monto:</span>
                          <span className="font-semibold text-foreground">
                            {formatPEN(item.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Participación:</span>
                          <span className="font-semibold text-primary">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                formatter={(value, entry: any) => (
                  <span className="text-xs text-muted-foreground font-medium">
                    {value}
                  </span>
                )}
                iconType="circle"
                iconSize={8}
                layout="horizontal"
                verticalAlign="bottom"
                wrapperStyle={{ paddingTop: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
