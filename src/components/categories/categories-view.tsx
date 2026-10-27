"use client";

import * as React from "react";
import { Plus, Trash2, Edit2, ShieldAlert, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "./category-badge";
import { CategoryDialog } from "./category-dialog";
import { deleteCategory } from "@/actions/categories";

interface CategoryItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  userId: string | null;
  _count: {
    transactions: number;
  };
}

interface CategoriesViewProps {
  categories: CategoryItem[];
}

export function CategoriesView({ categories: initialCategories }: CategoriesViewProps) {
  const [categories, setCategories] = React.useState(initialCategories);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [categoryToEdit, setCategoryToEdit] = React.useState<CategoryItem | null>(null);
  const [defaultType, setDefaultType] = React.useState<"INCOME" | "EXPENSE">("EXPENSE");
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; error?: boolean } | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  const handleOpenCreate = (type: "INCOME" | "EXPENSE") => {
    setCategoryToEdit(null);
    setDefaultType(type);
    setIsDialogOpen(true);
    setStatusMessage(null);
  };

  const handleOpenEdit = (category: CategoryItem) => {
    setCategoryToEdit(category);
    setIsDialogOpen(true);
    setStatusMessage(null);
  };

  const handleDelete = async (category: CategoryItem) => {
    if (category.isDefault) {
      setStatusMessage({ text: "Las categorías predeterminadas del sistema no se pueden eliminar.", error: true });
      return;
    }

    if (category._count.transactions > 0) {
      setStatusMessage({
        text: `No se puede eliminar "${category.name}" porque tiene ${category._count.transactions} transacción(es) asociadas. Reasigna los movimientos primero.`,
        error: true,
      });
      return;
    }

    if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
      return;
    }

    setDeletingId(category.id);
    setStatusMessage(null);

    try {
      const res = await deleteCategory(category.id);
      if (!res.success) {
        setStatusMessage({ text: res.error || "Error al eliminar categoría", error: true });
      } else {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
        setStatusMessage({ text: `Categoría "${category.name}" eliminada correctamente.` });
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message || "Error al eliminar", error: true });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Catálogo de Categorías</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organiza tus gastos e ingresos con categorías del sistema o crea las tuyas propias.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => handleOpenCreate("EXPENSE")} className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Nueva Categoría</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${
            statusMessage.error
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {statusMessage.error ? (
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          ) : (
            <Sparkles className="h-5 w-5 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid de Secciones: Gastos e Ingresos */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Categorías de Gastos */}
        <Card className="border-t-4 border-t-destructive">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Categorías de Gastos</span>
                <Badge variant="destructive" className="ml-1 text-xs">
                  {expenseCategories.length}
                </Badge>
              </CardTitle>
              <CardDescription>Clasifican tus consumos y presupuestos</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenCreate("EXPENSE")}
              className="gap-1.5 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Añadir</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card/60 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} />
                  {cat.isDefault ? (
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Predeterminada
                    </span>
                  ) : (
                    <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Personalizada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-2">
                    {cat._count.transactions} mov.
                  </span>
                  {!cat.isDefault && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(cat)}
                        title="Editar categoría"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        title={
                          cat._count.transactions > 0
                            ? "Bloqueada: contiene transacciones asociadas"
                            : "Eliminar categoría"
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Categorías de Ingresos */}
        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Categorías de Ingresos</span>
                <Badge variant="success" className="ml-1 text-xs">
                  {incomeCategories.length}
                </Badge>
              </CardTitle>
              <CardDescription>Clasifican tus fuentes de dinero</CardDescription>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleOpenCreate("INCOME")}
              className="gap-1.5 text-xs h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Añadir</span>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeCategories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl border bg-card/60 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CategoryBadge name={cat.name} icon={cat.icon} color={cat.color} />
                  {cat.isDefault ? (
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Predeterminada
                    </span>
                  ) : (
                    <span className="text-[11px] text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Personalizada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground mr-2">
                    {cat._count.transactions} mov.
                  </span>
                  {!cat.isDefault && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(cat)}
                        title="Editar categoría"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(cat)}
                        disabled={deletingId === cat.id}
                        title="Eliminar categoría"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Creación / Edición */}
      <CategoryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoryToEdit={categoryToEdit}
        defaultType={defaultType}
        onSuccess={() => {
          // La página revalida automáticamente en el servidor
          window.location.reload();
        }}
      />
    </div>
  );
}
