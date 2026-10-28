"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-center mb-4 shadow-sm">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Ha ocurrido un error inesperado
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        {error.message ||
          "No pudimos completar la operación solicitada. Tus datos financieros permanecen seguros."}
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button onClick={reset} variant="default" className="gap-2 shadow-xs">
          <RefreshCw className="h-4 w-4" />
          <span>Reintentar</span>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            <span>Ir al Panel</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
