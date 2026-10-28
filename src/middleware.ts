import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Rutas públicas de autenticación
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isApiRoute = pathname.startsWith("/api");

  // Si ya está autenticado e intenta ir a /login o /register, redirigir a /dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas excepto archivos estáticos:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (icono)
     * - imágenes públicas (.png, .jpg, .svg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
