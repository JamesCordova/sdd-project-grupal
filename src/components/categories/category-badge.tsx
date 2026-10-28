import * as React from "react";
import * as LucideIcons from "lucide-react";

interface CategoryBadgeProps {
  name: string;
  icon?: string | null;
  color?: string | null;
  type?: "INCOME" | "EXPENSE";
  className?: string;
}

export function CategoryBadge({
  name,
  icon,
  color = "#64748B",
  type,
  className = "",
}: CategoryBadgeProps) {
  // Obtener dinámicamente el componente de icono de Lucide
  const IconComponent = (icon && (LucideIcons as any)[icon]) || LucideIcons.Tag;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs transition-colors ${className}`}
      style={{
        backgroundColor: `${color}15`,
        borderColor: `${color}40`,
        color: color || "currentColor",
      }}
    >
      <IconComponent className="h-3.5 w-3.5" style={{ color: color || "currentColor" }} />
      <span>{name}</span>
    </span>
  );
}
