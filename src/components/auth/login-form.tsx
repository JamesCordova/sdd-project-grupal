"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle, Lock, Mail, Loader2, Sparkles, Check } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fillDemoCredentials = () => {
    setEmail("demo@finanzas.pe");
    setPassword("Demo123456!");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Correo o contraseña incorrectos. Por favor verifica tus datos.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error inesperado al iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-border/60">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Iniciar Sesión</CardTitle>
        <CardDescription>
          Ingresa a tu cuenta para gestionar tus finanzas personales en Soles (PEN)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Banner para cargar credenciales Demo */}
        <div className="mb-5 p-3 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-primary font-medium">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span>Cuenta demo lista para pruebas</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillDemoCredentials}
            className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/10"
          >
            Usar Demo
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Correo Electrónico</span>
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              autoComplete="email"
              className="h-10"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Contraseña</span>
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="h-10"
            />
          </div>

          <Button type="submit" className="w-full h-10 font-semibold shadow-xs" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Ingresando...
              </span>
            ) : (
              "Ingresar al Panel"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t py-4 text-xs text-muted-foreground">
        ¿No tienes una cuenta aún?{" "}
        <Link href="/register" className="ml-1 text-primary font-semibold hover:underline">
          Regístrate gratis
        </Link>
      </CardFooter>
    </Card>
  );
}
