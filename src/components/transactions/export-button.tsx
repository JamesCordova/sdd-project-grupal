"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";

interface ExportButtonProps {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ExportButton({
  startDate,
  endDate,
  categoryId,
  type,
  variant = "outline",
  size = "sm",
  className,
}: ExportButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleExport = async () => {
    try {
      setDownloading(true);

      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (categoryId && categoryId !== "ALL") params.set("categoryId", categoryId);
      if (type && type !== "ALL") params.set("type", type);

      const url = `/api/export/transactions${params.toString() ? `?${params.toString()}` : ""}`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Error al descargar archivo CSV");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const nowStr = new Date().toISOString().split("T")[0];
      a.download = `transacciones_${nowStr}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Error al exportar:", err);
      alert("No se pudo descargar el archivo CSV. Por favor intenta nuevamente.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={downloading}
      className={`gap-1.5 shadow-xs ${className || ""}`}
      title="Exportar movimientos a archivo CSV compatible con Excel"
    >
      {downloading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Generando CSV...</span>
        </>
      ) : (
        <>
          <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Exportar a CSV</span>
        </>
      )}
    </Button>
  );
}
