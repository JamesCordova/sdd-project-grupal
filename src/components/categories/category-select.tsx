"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryBadge } from "./category-badge";

export interface CategoryOption {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  icon?: string | null;
  color?: string | null;
  isDefault?: boolean;
}

interface CategorySelectProps {
  categories: CategoryOption[];
  value?: string;
  onChange: (value: string) => void;
  type?: "INCOME" | "EXPENSE";
  placeholder?: string;
  disabled?: boolean;
}

export function CategorySelect({
  categories,
  value,
  onChange,
  type,
  placeholder = "Selecciona una categoría",
  disabled = false,
}: CategorySelectProps) {
  const filtered = type ? categories.filter((c) => c.type === type) : categories;
  const selected = categories.find((c) => c.id === value);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-full">
        {selected ? (
          <div className="flex items-center gap-2">
            <CategoryBadge
              name={selected.name}
              icon={selected.icon}
              color={selected.color}
            />
          </div>
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Categorías de {type === "INCOME" ? "Ingreso" : "Gasto"}</SelectLabel>
          {filtered.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <div className="flex items-center gap-2 py-0.5">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || "#64748B" }}
                />
                <span className="font-medium">{cat.name}</span>
                {cat.isDefault && (
                  <span className="text-[10px] text-muted-foreground ml-auto bg-muted px-1.5 py-0.5 rounded">
                    Sistema
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
