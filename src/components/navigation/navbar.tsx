"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Tag,
  FileText,
  LogOut,
} from "lucide-react";

import { MobileNav } from "./mobile-nav";

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/budgets", label: "Presupuestos", icon: PieChart },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/reports", label: "Reportes", icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8 max-w-6xl mx-auto">
        {/* Logo / Marca */}
        <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg">
          <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Wallet className="h-5 w-5" />
          </div>
          <span className="tracking-tight">Finanzas Perú</span>
        </Link>

        {/* Enlaces de Navegación Desktop */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline-block">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Acciones de la derecha */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              signOut({ callbackUrl: "/login" });
            }}
            title="Cerrar Sesión"
            className="hidden sm:flex h-8 px-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-1.5 text-xs">Salir</span>
          </Button>
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
