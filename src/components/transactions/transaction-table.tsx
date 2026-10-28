"use client";

import * as React from "react";
import { formatPEN, formatDate } from "@/lib/finance/currency";
import { CategoryBadge } from "@/components/categories/category-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit2, Trash2, ArrowUpRight, ArrowDownRight, Inbox } from "lucide-react";
import { deleteTransaction } from "@/actions/transactions";

export interface TransactionRow {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  date: string;
  description: string | null;
  categoryId: string;
  category: {
    id: string;
    name: string;
    icon: string | null;
    color: string | null;
  };
}

interface TransactionTableProps {
  transactions: TransactionRow[];
  onEdit: (transaction: TransactionRow) => void;
  onRefresh?: () => void;
}

export function TransactionTable({
  transactions,
  onEdit,
  onRefresh,
}: TransactionTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (t: TransactionRow) => {
    if (
      !confirm(
        `¿Deseas eliminar la transacción de ${t.type === "INCOME" ? "ingreso" : "gasto"} por ${formatPEN(
          t.amount
        )}?`
      )
    ) {
      return;
    }

    setDeletingId(t.id);
    try {
      const res = await deleteTransaction(t.id);
      if (res.success) {
        if (onRefresh) onRefresh();
      } else {
        alert(res.error || "Error al eliminar la transacción");
      }
    } catch (e: any) {
      alert(e.message || "Error al conectar con el servidor");
    } finally {
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed bg-card/50">
        <div className="p-3 bg-muted rounded-full text-muted-foreground mb-3">
          <Inbox className="h-8 w-8" />
        </div>
        <h3 className="text-base font-semibold">No se encontraron movimientos</h3>
        <p className="text-sm text-muted-foreground max-w-sm mt-1">
          No hay transacciones que coincidan con los filtros aplicados o aún no has registrado ningún gasto o ingreso.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-[120px]">Fecha</TableHead>
            <TableHead className="w-[100px]">Tipo</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Monto (PEN)</TableHead>
            <TableHead className="text-right w-[100px]">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => {
            const isExpense = t.type === "EXPENSE";
            return (
              <TableRow key={t.id} className="hover:bg-muted/40 transition-colors">
                {/* Fecha */}
                <TableCell className="font-medium text-xs text-muted-foreground">
                  {formatDate(t.date)}
                </TableCell>

                {/* Tipo */}
                <TableCell>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                      isExpense
                        ? "text-destructive bg-destructive/10"
                        : "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                    }`}
                  >
                    {isExpense ? (
                      <ArrowDownRight className="h-3 w-3" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3" />
                    )}
                    {isExpense ? "Gasto" : "Ingreso"}
                  </span>
                </TableCell>

                {/* Categoría */}
                <TableCell>
                  <CategoryBadge
                    name={t.category?.name || "Sin categoría"}
                    icon={t.category?.icon}
                    color={t.category?.color}
                  />
                </TableCell>

                {/* Descripción */}
                <TableCell className="max-w-[220px] truncate text-sm">
                  {t.description || (
                    <span className="text-muted-foreground italic text-xs">Sin detalle</span>
                  )}
                </TableCell>

                {/* Monto */}
                <TableCell
                  className={`text-right font-bold text-sm tabular-nums ${
                    isExpense ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isExpense ? `- ${formatPEN(t.amount)}` : `+ ${formatPEN(t.amount)}`}
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => onEdit(t)}
                      title="Editar transacción"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(t)}
                      disabled={deletingId === t.id}
                      title="Eliminar transacción"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
