import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-border/80 bg-card/50 ${
        className || ""
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mb-4 text-muted-foreground shadow-xs">
        <Icon className="h-7 w-7 text-primary/70" />
      </div>
      <h3 className="text-base font-semibold text-foreground tracking-tight">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1.5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" className="mt-5 font-semibold shadow-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
