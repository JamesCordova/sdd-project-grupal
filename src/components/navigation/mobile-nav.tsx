"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Menu,
  X,
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Tag,
  FileText,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/dashboard", label: "Panel Principal", icon: LayoutDashboard },
  { href: "/transactions", label: "Transacciones", icon: ArrowLeftRight },
  { href: "/budgets", label: "Presupuestos", icon: PieChart },
  { href: "/categories", label: "Categorías", icon: Tag },
  { href: "/reports", label: "Reportes y Exportación", icon: FileText },
];

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label="Abrir menú de navegación"
        className="h-9 w-9 text-foreground"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-md animate-in fade-in-20">
          <div className="flex flex-col h-[calc(100vh-4rem)] p-6 justify-between max-w-sm mx-auto">
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
                <Wallet className="h-4 w-4 text-primary" />
                <span>Finanzas Perú — Soles (PEN)</span>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  close();
                  signOut({ callbackUrl: "/login" });
                }}
                className="w-full justify-center gap-2 text-destructive border-destructive/20 hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Cerrar Sesión</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
