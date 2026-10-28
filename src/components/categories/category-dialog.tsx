"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategoryInputSchema, type CategoryInput } from "@/lib/validations/category";
import { createCategory, updateCategory } from "@/actions/categories";
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
import * as LucideIcons from "lucide-react";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    icon?: string | null;
    color?: string | null;
  } | null;
  defaultType?: "INCOME" | "EXPENSE";
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  "#F97316", // Naranja
  "#3B82F6", // Azul
  "#10B981", // Verde
  "#8B5CF6", // Púrpura
  "#EC4899", // Rosa
  "#EF4444", // Rojo
  "#EAB308", // Amarillo
  "#06B6D4", // Cyan
  "#64748B", // Pizarra
];

const PRESET_ICONS = [
  "Utensils",
  "Car",
  "Home",
  "HeartPulse",
  "GraduationCap",
  "Film",
  "Zap",
  "Briefcase",
  "Coins",
  "ShoppingBag",
  "Coffee",
  "Gift",
  "Plane",
  "Wifi",
  "Tag",
];

export function CategoryDialog({
  open,
  onOpenChange,
  categoryToEdit,
  defaultType = "EXPENSE",
  onSuccess,
}: CategoryDialogProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategoryInputSchema),
    defaultValues: {
      name: "",
      type: defaultType,
      icon: "Tag",
      color: "#F97316",
    },
  });

  const selectedColor = watch("color");
  const selectedIcon = watch("icon");
  const selectedType = watch("type");

  React.useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
        type: categoryToEdit.type,
        icon: categoryToEdit.icon || "Tag",
        color: categoryToEdit.color || "#F97316",
      });
    } else {
      reset({
        name: "",
        type: defaultType,
        icon: "Tag",
        color: defaultType === "INCOME" ? "#10B981" : "#F97316",
      });
    }
    setServerError(null);
  }, [categoryToEdit, defaultType, reset, open]);

  const onSubmit = async (data: CategoryInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      let res;
      if (categoryToEdit) {
        res = await updateCategory(categoryToEdit.id, data);
      } else {
        res = await createCategory(data);
      }

      if (!res.success) {
        setServerError(res.error || "Ocurrió un error inesperado");
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
            {categoryToEdit ? "Editar Categoría" : "Nueva Categoría Personalizada"}
          </DialogTitle>
          <DialogDescription>
            Crea una categoría para clasificar tus gastos o ingresos.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              {serverError}
            </div>
          )}

          {/* Tipo de categoría */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Tipo de Movimiento</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setValue("type", "EXPENSE")}
                className={`py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${
                  selectedType === "EXPENSE"
                    ? "bg-destructive/10 border-destructive text-destructive font-semibold"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => setValue("type", "INCOME")}
                className={`py-2 px-3 text-sm rounded-lg border font-medium transition-colors ${
                  selectedType === "INCOME"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "hover:bg-muted text-muted-foreground"
                }`}
              >
                Ingreso
              </button>
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Nombre de la Categoría</label>
            <Input
              {...register("name")}
              placeholder="Ej. Mascotas, Gimnasio, Cursos..."
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Color distintivo */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Color Distintivo</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue("color", c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    selectedColor === c ? "scale-110 border-foreground shadow-md" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Icono */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Icono Representativo</label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 border rounded-lg">
              {PRESET_ICONS.map((iconName) => {
                const IconComponent = (LucideIcons as any)[iconName] || LucideIcons.Tag;
                const isSelected = selectedIcon === iconName;
                return (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setValue("icon", iconName)}
                    className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                    title={iconName}
                  >
                    <IconComponent className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
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
              {isSubmitting ? "Guardando..." : categoryToEdit ? "Guardar Cambios" : "Crear Categoría"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
