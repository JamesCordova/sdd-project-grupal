"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BudgetInputSchema, type BudgetInput } from "@/lib/validations/budget";
import { setBudget } from "@/actions/budgets";
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
import { getMonthName } from "@/lib/finance/currency";
import { CategorySelect, type CategoryOption } from "@/components/categories/category-select";

interface SetBudgetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: CategoryOption[];
  currentMonth: number;
  currentYear: number;
  initialItem?: {
    categoryId?: string;
    amount: number;
  } | null;
  onSuccess?: () => void;
}

export function SetBudgetDialog({
  open,
  onOpenChange,
  categories,
  currentMonth,
  currentYear,
  initialItem,
  onSuccess,
}: SetBudgetDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<BudgetInput>({
    resolver: zodResolver(BudgetInputSchema),
    defaultValues: {
      month: currentMonth,
      year: currentYear,
      amount: initialItem ? initialItem.amount : undefined,
      categoryId: initialItem?.categoryId || null,
    },
  });

  const selectedCategory = watch("categoryId");

  React.useEffect(() => {
    reset({
      month: currentMonth,
      year: currentYear,
      amount: initialItem ? initialItem.amount : undefined,
      categoryId: initialItem?.categoryId || null,
    });
    setServerError(null);
  }, [initialItem, currentMonth, currentYear, reset, open]);

  const onSubmit = async (data: BudgetInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await setBudget(data);
      if (!res.success) {
        setServerError(res.error || "Ocurrió un error al guardar el presupuesto");
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
          <DialogTitle>Establecer Límite de Presupuesto</DialogTitle>
          <DialogDescription>
            Período: {getMonthName(currentMonth)} {currentYear}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {serverError}
            </div>
          )}

          {/* Categoría objetivo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Categoría</label>
              <button
                type="button"
                onClick={() => setValue("categoryId", null)}
                className={`text-xs ${
                  selectedCategory === null
                    ? "text-primary font-bold underline"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                ¿Presupuesto general mensual?
              </button>
            </div>

            {selectedCategory === null ? (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary flex items-center justify-between">
                <span>Presupuesto General (Aplica a la suma de todos los gastos)</span>
                <button
                  type="button"
                  onClick={() => {
                    const firstCat = categories.find((c) => c.type === "EXPENSE");
                    setValue("categoryId", firstCat?.id || "");
                  }}
                  className="underline text-[11px]"
                >
                  Cambiar a categoría
                </button>
              </div>
            ) : (
              <CategorySelect
                categories={categories}
                type="EXPENSE"
                value={selectedCategory || ""}
                onChange={(val) => setValue("categoryId", val)}
              />
            )}
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Monto límite */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Límite Mensual (Soles - PEN)</label>
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
            <p className="text-[11px] text-muted-foreground">
              Recibirás un aviso de advertencia al alcanzar el 80% y una alerta crítica al 100%.
            </p>
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
              {isSubmitting ? "Guardando..." : "Guardar Presupuesto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
