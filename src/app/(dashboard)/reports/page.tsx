import Link from "next/link";
import { getAnnualSummary } from "@/actions/reports";
import { formatPEN } from "@/lib/finance/currency";
import { ExportButton } from "@/components/transactions/export-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileSpreadsheet,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  ChevronRight,
  Calendar,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface ReportsPageProps {
  searchParams?: Promise<{
    year?: string;
  }>;
}

export default async function ReportsPage(props: ReportsPageProps) {
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const currentYear = new Date().getUTCFullYear();
  const selectedYear = searchParams?.year ? parseInt(searchParams.year, 10) : currentYear;

  const reportRes = await getAnnualSummary(selectedYear);
  const report = reportRes.success && reportRes.data ? reportRes.data : null;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="outline" className="text-xs text-primary border-primary/30">
              <FileSpreadsheet className="h-3 w-3 mr-1" />
              Consolidado Anual en Soles (PEN)
            </Badge>
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span>Año {selectedYear}</span>
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Reportes y Balances
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Consulta el desempeño anual de tus finanzas y descarga tus transacciones a Excel en CSV con codificación UTF-8.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/reports/trends">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Análisis de Tendencias</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>

          <ExportButton
            startDate={`${selectedYear}-01-01`}
            endDate={`${selectedYear}-12-31`}
          />
        </div>
      </div>

      {report && (
        <>
          {/* Tarjetas de Métricas Anuales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ingresos Anuales */}
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Ingresos Anuales</span>
                  <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatPEN(report.totalIncome)}
                </p>
              </CardContent>
            </Card>

            {/* Gastos Anuales */}
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Gastos Anuales</span>
                  <ArrowDownRight className="h-4 w-4 text-rose-500" />
                </div>
                <p className="text-xl font-bold mt-1 text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatPEN(report.totalExpense)}
                </p>
              </CardContent>
            </Card>

            {/* Balance Anual */}
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Balance Neto Anual</span>
                  <Wallet className="h-4 w-4 text-primary" />
                </div>
                <p
                  className={`text-xl font-bold mt-1 tabular-nums ${
                    report.netBalance >= 0 ? "text-primary" : "text-destructive"
                  }`}
                >
                  {formatPEN(report.netBalance)}
                </p>
              </CardContent>
            </Card>

            {/* Tasa de Ahorro */}
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Tasa de Ahorro Global</span>
                  <PiggyBank className="h-4 w-4 text-amber-500" />
                </div>
                <p className="text-xl font-bold mt-1 text-foreground tabular-nums">
                  {report.overallSavingsRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Desglose Mes a Mes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">
                Desglose Mensual ({selectedYear})
              </h2>
              <div className="flex items-center gap-1.5">
                {[selectedYear - 1, selectedYear].map((yr) => (
                  <Button
                    key={yr}
                    asChild
                    variant={yr === selectedYear ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                  >
                    <Link href={`/reports?year=${yr}`}>{yr}</Link>
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="w-[180px]">Mes</TableHead>
                    <TableHead className="text-right">Ingresos (S/)</TableHead>
                    <TableHead className="text-right">Gastos (S/)</TableHead>
                    <TableHead className="text-right">Balance (S/)</TableHead>
                    <TableHead className="text-right">Tasa de Ahorro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.monthlyBreakdown.map((row) => {
                    const hasActivity = row.income > 0 || row.expense > 0;
                    return (
                      <TableRow
                        key={row.month}
                        className={`hover:bg-muted/30 transition-colors ${
                          !hasActivity ? "opacity-60" : ""
                        }`}
                      >
                        <TableCell className="font-semibold">{row.monthName}</TableCell>
                        <TableCell className="text-right tabular-nums text-emerald-600 dark:text-emerald-400 font-medium">
                          {formatPEN(row.income)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-rose-600 dark:text-rose-400 font-medium">
                          {formatPEN(row.expense)}
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums font-bold ${
                            row.balance >= 0 ? "text-primary" : "text-destructive"
                          }`}
                        >
                          {formatPEN(row.balance)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {hasActivity ? (
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                row.savingsRate >= 20
                                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                  : row.savingsRate > 0
                                  ? "border-primary text-primary"
                                  : "border-destructive text-destructive"
                              }`}
                            >
                              {row.savingsRate}%
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {/* Banner de Exportación Completa y Respaldo */}
      <Card className="border-border bg-muted/20">
        <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Respaldo y Descarga de Información</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
              Descarga todas tus transacciones en formato CSV con caracteres especiales y tildes preservados (UTF-8 con BOM), listo para abrir de inmediato en Microsoft Excel o Google Sheets.
            </p>
          </div>
          <ExportButton />
        </CardContent>
      </Card>
    </div>
  );
}
