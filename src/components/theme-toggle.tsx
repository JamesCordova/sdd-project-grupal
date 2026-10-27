"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Cargando tema"
        className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:bg-muted"
        disabled
      >
        <Sun className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Alternar tema claro y oscuro"
      className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      title={`Cambiar a modo ${theme === "dark" ? "claro" : "oscuro"}`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-transform duration-200 rotate-0" />
      ) : (
        <Moon className="h-5 w-5 transition-transform duration-200 rotate-0" />
      )}
    </button>
  );
}
