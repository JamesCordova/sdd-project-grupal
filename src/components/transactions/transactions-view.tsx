"use client";

import * as React from "react";
import { Plus, ArrowDownRight, ArrowUpRight, Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TransactionTable, type TransactionRow } from "./transaction-table";
import { TransactionFilters, type FilterState } from "./transaction-filters";
import { TransactionFormDialog } from "./transaction-form-dialog";
import { type CategoryOption } from "@/components/categories/category-select";
import { formatPEN } from "@/lib/finance/currency";
import { getTransactions } from "@/actions/transactions";

interface TransactionsViewProps {
  initialData: {
    items: TransactionRow[];
    total: number;
    summary: {
      totalIncome: number;
      totalExpense: number;
      netBalance: number;
    };
  };
  categories: CategoryOption[];
}

export function TransactionsView({ initialData, categories }: TransactionsViewProps) {
  const [data, setData] = React.useState(initialData);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [transactionToEdit, setTransactionToEdit] = React.useState<TransactionRow | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const [filters, setFilters] = React.useState<FilterState>({
    search: "",
    type: "ALL",
    categoryId: "ALL",
    startDate: "",
    endDate: "",
  });

  const fetchFilteredData = React.useCallback(async (activeFilters: FilterState) => {
    setIsLoading(true);
    try {
      const res = await getTransactions({
        search: activeFilters.search || undefined,
        type: activeFilters.type === "ALL" ? undefined : (activeFilters.type as any),
        categoryId: activeFilters.categoryId === "ALL" ? undefined : activeFilters.categoryId,
        startDate: activeFilters.startDate || undefined,
        endDate: activeFilters.endDate || undefined,
      });

      if (res.success && res.data) {
        setData(res.data as any);
      }
    } catch (e) {
      console.error("Error al filtrar transacciones", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    fetchFilteredData(newFilters);
  };

  const handleResetFilters = () => {
    const emptyFilters: FilterState = {
      search: "",
      type: "ALL",
      categoryId: "ALL",
      startDate: "",
      endDate: "",
    };
    setFilters(emptyFilters);
    fetchFilteredData(emptyFilters);
  };

  const handleOpenCreate = () => {
    setTransactionToEdit(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (t: TransactionRow) => {
    setTransactionToEdit(t);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y botón de acción rápida */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Transacciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historial de todos tus ingresos y gastos con recálculo de balance en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleOpenCreate} className="gap-2 shadow-sm font-semibold">
            <Plus className="h-4 w-4" />
            <span>Registrar Movimiento</span>
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen Financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Ingresos */}
        <Card className="border-l-4 border-l-emerald-500 shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Ingresos Totales</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                + {formatPEN(data.summary.totalIncome)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Total Gastos */}
        <Card className="border-l-4 border-l-destructive shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Gastos Totales</p>
              <h3 className="text-xl font-bold text-destructive mt-1 tabular-nums">
                - {formatPEN(data.summary.totalExpense)}
              </h3>
            </div>
            <div className="p-2.5 bg-destructive/10 rounded-xl text-destructive">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Balance Neto */}
        <Card
          className={`border-l-4 shadow-xs ${
            data.summary.netBalance >= 0 ? "border-l-primary" : "border-l-amber-500"
          }`}
        >
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Balance Neto</p>
              <h3
                className={`text-xl font-bold mt-1 tabular-nums ${
                  data.summary.netBalance >= 0 ? "text-foreground" : "text-amber-600 dark:text-amber-400"
                }`}
              >
                {formatPEN(data.summary.netBalance)}
              </h3>
            </div>
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Wallet className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros */}
      <TransactionFilters
        categories={categories}
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Tabla de Movimientos */}
      <div className={isLoading ? "opacity-60 transition-opacity pointer-events-none" : ""}>
        <TransactionTable
          transactions={data.items}
          onEdit={handleOpenEdit}
          onRefresh={() => fetchFilteredData(filters)}
        />
      </div>

      {/* Modal de Registro / Edición */}
      <TransactionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categories={categories}
        transactionToEdit={transactionToEdit}
        onSuccess={() => fetchFilteredData(filters)}
      />
    </div>
  );
}
