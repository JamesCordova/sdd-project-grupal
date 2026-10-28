"use client";

import * as React from "react";
import { Search, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CategoryOption } from "@/components/categories/category-select";

export interface FilterState {
  search: string;
  type: string; // "ALL" | "INCOME" | "EXPENSE"
  categoryId: string; // "ALL" | id
  startDate: string;
  endDate: string;
}

interface TransactionFiltersProps {
  categories: CategoryOption[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function TransactionFilters({
  categories,
  filters,
  onChange,
  onReset,
}: TransactionFiltersProps) {
  const hasActiveFilters =
    filters.search !== "" ||
    filters.type !== "ALL" ||
    filters.categoryId !== "ALL" ||
    filters.startDate !== "" ||
    filters.endDate !== "";

  const availableCategories =
    filters.type === "ALL"
      ? categories
      : categories.filter((c) => c.type === filters.type);

  return (
    <div className="p-4 rounded-xl border bg-card/60 shadow-xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Buscador de texto */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descripción..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            className="pl-9 h-9"
          />
        </div>

        {/* Filtro por Tipo */}
        <Select
          value={filters.type}
          onValueChange={(val) => {
            onChange({
              ...filters,
              type: val,
              categoryId: "ALL", // reset category if type changes
            });
          }}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Tipo de movimiento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los tipos</SelectItem>
            <SelectItem value="EXPENSE">Solo Gastos</SelectItem>
            <SelectItem value="INCOME">Solo Ingresos</SelectItem>
          </SelectContent>
        </Select>

        {/* Filtro por Categoría */}
        <Select
          value={filters.categoryId}
          onValueChange={(val) => onChange({ ...filters, categoryId: val })}
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todas las categorías</SelectItem>
            {availableCategories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botón de limpiar filtros */}
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full sm:w-auto"
            >
              <FilterX className="h-4 w-4" />
              <span>Limpiar filtros</span>
            </Button>
          )}
        </div>
      </div>

      {/* Rango de fechas */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t text-xs text-muted-foreground">
        <span>Rango de fechas:</span>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="h-8 text-xs w-36"
            placeholder="Desde"
          />
          <span>hasta</span>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="h-8 text-xs w-36"
            placeholder="Hasta"
          />
        </div>
      </div>
    </div>
  );
}
