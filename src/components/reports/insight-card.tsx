import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Info, Sparkles } from "lucide-react";

interface InsightCardProps {
  type: "warning" | "success" | "info";
  title: string;
  description: string;
}

export function InsightCard({ type, title, description }: InsightCardProps) {
  const config = {
    warning: {
      border: "border-amber-500/30",
      bg: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
      icon: AlertTriangle,
    },
    success: {
      border: "border-emerald-500/30",
      bg: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: CheckCircle2,
    },
    info: {
      border: "border-primary/30",
      bg: "bg-primary/10",
      text: "text-primary",
      icon: Info,
    },
  }[type];

  const Icon = config.icon;

  return (
    <Card className={`border ${config.border} ${config.bg} shadow-xs`}>
      <CardContent className="p-4 flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-background/50 ${config.text} shrink-0 mt-0.5`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h4 className={`text-sm font-semibold ${config.text}`}>{title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
