import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-4 text-primary shadow-xs">
        <FileQuestion className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight">404 - Página no encontrada</h1>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        La ruta que intentas consultar no existe o ha sido movida. Puedes volver al panel financiero en cualquier momento.
      </p>
      <div className="flex items-center gap-3 mt-6">
        <Button asChild className="gap-2 shadow-xs">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            <span>Volver al Panel</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
