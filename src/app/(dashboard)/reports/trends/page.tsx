import Link from "next/link";
import { getSpendingTrends } from "@/actions/reports";
import { formatPEN } from "@/lib/finance/currency";
import { TrendComparisonTable } from "@/components/reports/trend-comparison-table";
import { InsightCard } from "@/components/reports/insight-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  ArrowLeft,
  ArrowRight,
  FileSpreadsheet,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface TrendsPageProps {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function TrendsPage(props: TrendsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const now = new Date();
  const selectedMonth = searchParams?.month ? parseInt(searchParams.month, 10) : now.getUTCMonth() + 1;
  const selectedYear = searchParams?.year ? parseInt(searchParams.year, 10) : now.getUTCFullYear();

  const trendsRes = await getSpendingTrends(selectedMonth, selectedYear);
  const trends = trendsRes.success && trendsRes.data ? trendsRes.data : null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs -ml-2 text-muted-foreground">
              <Link href="/reports">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Reportes
              </Link>
            </Button>
            <Badge variant="outline" className="text-xs text-primary border-primary/30">
              <TrendingUp className="h-3 w-3 mr-1" />
              Análisis Intermensual
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Tendencias y Hábitos de Gasto
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Compara tus salidas de dinero entre meses consecutivos y detecta variaciones significativas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/reports">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Reporte Anual y CSV</span>
            </Link>
          </Button>
        </div>
      </div>

      {!trends || !trends.hasSufficientData ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
              <Info className="h-5 w-5" />
              Información de Historial Insuficiente
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {trends?.message ||
                "Se requieren al menos 2 meses con registros para realizar comparativas de hábitos."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-card border text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">¿Cómo funciona este análisis?</p>
              <p>
                El motor analiza de forma automática tus gastos devengados mes a mes. En cuanto registres movimientos en un segundo periodo, podrás visualizar:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Alertas tempranas de incremento de consumo (+20% o más en categorías clave).</li>
                <li>Métricas de ahorro alcanzadas respecto a meses anteriores.</li>
                <li>Desglose comparativo exacto en Soles (PEN) y porcentajes.</li>
              </ul>
            </div>
            <Button asChild size="sm">
              <Link href="/transactions">Registrar Movimientos Ahora</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Tarjetas de Resumen Comparativo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Gasto Total en {trends.previousMonthName}
                </span>
                <p className="text-xl font-bold mt-1 text-muted-foreground tabular-nums">
                  {formatPEN(trends.totalPreviousExpense)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Gasto Total en {trends.currentMonthName}
                </span>
                <p className="text-xl font-bold mt-1 text-foreground tabular-nums">
                  {formatPEN(trends.totalCurrentExpense)}
                </p>
              </CardContent>
            </Card>

            <Card
              className={`border ${
                trends.totalExpenseDiff > 0
                  ? "border-rose-500/30 bg-rose-500/5"
                  : trends.totalExpenseDiff < 0
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <span className="text-xs text-muted-foreground font-medium">
                  Variación Neta Global
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p
                    className={`text-xl font-bold tabular-nums ${
                      trends.totalExpenseDiff > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : trends.totalExpenseDiff < 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {trends.totalExpenseDiff > 0 ? "+" : ""}
                    {formatPEN(trends.totalExpenseDiff)}
                  </p>
                  <span
                    className={`text-xs font-semibold ${
                      trends.totalExpenseDiff > 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    ({trends.totalPercentageChange > 0 ? `+${trends.totalPercentageChange}%` : `${trends.totalPercentageChange}%`})
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tarjetas de Insights Inteligentes */}
          {trends.insights && trends.insights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold tracking-tight">Hallazgos y Consejos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {trends.insights.map((insight, idx) => (
                  <InsightCard
                    key={idx}
                    type={insight.type}
                    title={insight.title}
                    description={insight.description}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tabla Comparativa */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold tracking-tight">
              Desglose Comparativo por Categoría ({trends.previousMonthName} vs {trends.currentMonthName})
            </h3>
            <TrendComparisonTable
              categories={trends.categories}
              currentMonthName={trends.currentMonthName}
              previousMonthName={trends.previousMonthName}
            />
          </div>
        </div>
      )}
    </div>
  );
}
