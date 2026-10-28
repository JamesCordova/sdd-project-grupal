"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionInputSchema, type TransactionInput } from "@/lib/validations/transaction";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategorySelect, type CategoryOption } from "@/components/categories/category-select";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryOption[];
  transactionToEdit?: {
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    date: string;
    categoryId: string;
    description: string | null;
  } | null;
  onSuccess?: () => void;
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  categories,
  transactionToEdit,
  onSuccess,
}: TransactionFormDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TransactionInput>({
    resolver: zodResolver(TransactionInputSchema),
    defaultValues: {
      amount: undefined,
      type: "EXPENSE",
      date: todayStr,
      categoryId: "",
      description: "",
    },
  });

  const selectedType = watch("type");
  const selectedCategory = watch("categoryId");

  React.useEffect(() => {
    if (transactionToEdit) {
      reset({
        amount: transactionToEdit.amount,
        type: transactionToEdit.type,
        date: transactionToEdit.date,
        categoryId: transactionToEdit.categoryId,
        description: transactionToEdit.description || "",
      });
    } else {
      // Si no hay edición, predeterminar la primera categoría de ese tipo si existe
      const firstCat = categories.find((c) => c.type === "EXPENSE");
      reset({
        amount: undefined,
        type: "EXPENSE",
        date: todayStr,
        categoryId: firstCat?.id || "",
        description: "",
      });
    }
    setServerError(null);
  }, [transactionToEdit, reset, open, todayStr, categories]);

  const handleTypeChange = (newType: "INCOME" | "EXPENSE") => {
    setValue("type", newType);
    // Cambiar categoría a una del nuevo tipo
    const firstCat = categories.find((c) => c.type === newType);
    if (firstCat) {
      setValue("categoryId", firstCat.id);
    } else {
      setValue("categoryId", "");
    }
  };

  const onSubmit = async (data: TransactionInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      let res;
      if (transactionToEdit) {
        res = await updateTransaction(transactionToEdit.id, data);
      } else {
        res = await createTransaction(data);
      }

      if (!res.success) {
        setServerError(res.error || "Ocurrió un error al guardar la transacción");
      } else {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    } catch (e: any) {
      setServerError(e.message || "Error al conectar con el servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transactionToEdit ? "Editar Transacción" : "Registrar Movimiento"}
          </DialogTitle>
          <DialogDescription>
            {transactionToEdit
              ? "Modifica los detalles del movimiento seleccionado."
              : "Registra rápidamente un gasto o ingreso en Soles (PEN)."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {serverError}
            </div>
          )}

          {/* Selector de Tipo (Gasto / Ingreso) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                selectedType === "EXPENSE"
                  ? "bg-destructive/10 border-destructive text-destructive font-semibold shadow-xs"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("INCOME")}
              className={`py-2 px-3 text-sm rounded-lg border font-medium transition-all ${
                selectedType === "INCOME"
                  ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold shadow-xs"
                  : "hover:bg-muted text-muted-foreground"
              }`}
            >
              Ingreso
            </button>
          </div>

          {/* Monto (Soles) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Monto (Soles - PEN)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-muted-foreground text-sm">
                S/
              </span>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                className="pl-9 text-base font-semibold"
                {...register("amount", { valueAsNumber: true })}
                autoFocus
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Fecha */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Fecha de la Operación</label>
            <Input type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Categoría</label>
            <CategorySelect
              categories={categories}
              type={selectedType}
              value={selectedCategory}
              onChange={(val) => setValue("categoryId", val, { shouldValidate: true })}
            />
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Descripción <span className="text-muted-foreground font-normal">(Opcional)</span>
            </label>
            <Input
              placeholder="Ej. Supermercado, Almuerzo, Recarga de saldo..."
              maxLength={255}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : transactionToEdit ? "Actualizar" : "Guardar Movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
