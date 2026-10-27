import React from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary selection:text-primary-foreground">
      {/* Header simplificado con logo y theme toggle */}
      <header className="w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container max-w-5xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="tracking-tight">Finanzas Perú</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Contenido principal centrado */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        {children}
      </main>

      {/* Footer simplificado */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        <p>© 2026 Finanzas Perú — Control de Finanzas Personales en Soles (PEN)</p>
      </footer>
    </div>
  );
}
