import React from "react";
import Link from "next/link";
import { AlertTriangle, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";
import type { BudgetAlert } from "@/actions/budgets";

interface ActiveAlertsBannerProps {
  alerts: BudgetAlert[];
}

export function ActiveAlertsBanner({ alerts }: ActiveAlertsBannerProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="h-4 w-4" />
          <span>Todos tus presupuestos se encuentran dentro del margen saludable.</span>
        </div>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          Ver presupuestos
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  const overdraftAlerts = alerts.filter((a) => a.severity === "destructive");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");

  return (
    <div className="space-y-2">
      {overdraftAlerts.length > 0 && (
        <div className="flex items-start justify-between p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">
                ¡Límite excedido en {overdraftAlerts.length} presupuesto{overdraftAlerts.length > 1 ? "s" : ""}!
              </p>
              <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc list-inside">
                {overdraftAlerts.map((a) => (
                  <li key={a.id}>{a.description}</li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-destructive hover:underline shrink-0 ml-3 flex items-center gap-0.5"
          >
            Ajustar
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {warningAlerts.length > 0 && (
        <div className="flex items-start justify-between p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-600 dark:text-amber-400">
                Atención: {warningAlerts.length} categoría{warningAlerts.length > 1 ? "s" : ""} ha{warningAlerts.length > 1 ? "n" : ""} superado el 80% de su límite
              </p>
              <ul className="mt-1 space-y-0.5 text-muted-foreground list-disc list-inside">
                {warningAlerts.map((a) => (
                  <li key={a.id}>{a.description}</li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/budgets"
            className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline shrink-0 ml-3 flex items-center gap-0.5"
          >
            Revisar
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
