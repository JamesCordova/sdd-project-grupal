import Link from "next/link";
import { getDashboardMetrics } from "@/actions/dashboard";
import { formatPEN, getMonthName } from "@/lib/finance/currency";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { ActiveAlertsBanner } from "@/components/dashboard/active-alerts-banner";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeftRight,
  Plus,
  Tag,
  PieChart as PieIcon,
  Sparkles,
  Calendar,
  ExternalLink,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams?: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const now = new Date();
  const selectedMonth = searchParams?.month ? parseInt(searchParams.month, 10) : now.getUTCMonth() + 1;
  const selectedYear = searchParams?.year ? parseInt(searchParams.year, 10) : now.getUTCFullYear();

  const metricsRes = await getDashboardMetrics(selectedMonth, selectedYear);

  const metrics = metricsRes.success && metricsRes.data
    ? metricsRes.data
    : {
        month: selectedMonth,
        year: selectedYear,
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        spendingByCategory: [],
        monthlyTrend: [],
        recentTransactions: [],
        alerts: [],
      };

  return (
    <div className="space-y-6">
      {/* Encabezado con selector de periodo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-primary border-primary/30 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Soles Peruanos (PEN)
            </Badge>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>{getMonthName(selectedMonth)} {selectedYear}</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Panel Financiero
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Visión panorámica de tus ingresos, gastos, presupuestos y salud financiera en Soles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/budgets">
              <PieIcon className="h-4 w-4" />
              <span>Presupuestos</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-1.5 font-semibold shadow-xs">
            <Link href="/transactions">
              <Plus className="h-4 w-4" />
              <span>Registrar Movimiento</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Alertas Activas de Presupuesto */}
      <ActiveAlertsBanner alerts={metrics.alerts} />

      {/* Tarjetas de Resumen KPI */}
      <SummaryCards
        totalIncome={metrics.totalIncome}
        totalExpense={metrics.totalExpense}
        netBalance={metrics.netBalance}
      />

      {/* Gráficos Recharts en Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart data={metrics.spendingByCategory} />
        <MonthlyTrendChart data={metrics.monthlyTrend} />
      </div>

      {/* Sección Inferior: Movimientos Recientes y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimas Transacciones */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Últimos Movimientos
                </CardTitle>
                <CardDescription>
                  Transacciones más recientes registradas
                </CardDescription>
              </div>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Ver todas
                <ExternalLink className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {metrics.recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <ArrowLeftRight className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                  <p>Aún no hay transacciones registradas.</p>
                  <Button asChild variant="link" size="sm" className="mt-1">
                    <Link href="/transactions">Crear tu primera transacción</Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {metrics.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            tx.type === "INCOME"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"}
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium truncate">
                            {tx.description || tx.category.name}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <CategoryBadge
                              name={tx.category.name}
                              color={tx.category.color}
                              icon={tx.category.icon}
                            />
                            <span className="text-[11px] text-muted-foreground">
                              {tx.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-4">
                        <span
                          className={`text-sm font-bold tabular-nums ${
                            tx.type === "INCOME"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {tx.type === "INCOME" ? "+" : "-"} {formatPEN(tx.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Acciones Rápidas */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
              <CardDescription>Accesos directos a la gestión de finanzas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                <Link href="/transactions">
                  <ArrowLeftRight className="h-5 w-5 text-primary" />
                  <div className="text-left">
                    <div className="text-xs font-semibold">Gestionar Transacciones</div>
                    <div className="text-[11px] text-muted-foreground">Ver historial y filtros por fecha</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                <Link href="/budgets">
                  <PieIcon className="h-5 w-5 text-amber-500" />
                  <div className="text-left">
                    <div className="text-xs font-semibold">Límites y Presupuestos</div>
                    <div className="text-[11px] text-muted-foreground">Alertas al 80% y sobregiros</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-start gap-3 h-12">
                <Link href="/categories">
                  <Tag className="h-5 w-5 text-emerald-500" />
                  <div className="text-left">
                    <div className="text-xs font-semibold">Categorías Personalizadas</div>
                    <div className="text-[11px] text-muted-foreground">Organiza tus gastos a tu medida</div>
                  </div>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
