# Technical Research & Architecture Decisions: Personal Finance Tracker

**Feature**: `001-personal-finance-tracker`  
**Date**: 2026-10-27  
**Status**: Completed  

---

## 1. Full-Stack Web Architecture

### Decision
Utilizar **Next.js 15 (App Router)** con **React 19**, **TypeScript** y **Server Actions** como arquitectura full-stack unificada.

### Rationale
* **Server Components (RSC)**: Permiten cargar datos financieros directamente desde la base de datos en el servidor, eliminando "waterfalls" de peticiones en el cliente y protegiendo la lógica de negocio.
* **Server Actions**: Permiten realizar mutaciones de datos (crear/editar/eliminar transacciones, presupuestos y categorías) mediante funciones asíncronas fuertemente tipadas de extremo a extremo, ejecutando validaciones con Zod en el servidor sin necesidad de mantener rutas API REST redundantes.
* **Cohesión de tipos**: El cliente y el servidor comparten las mismas interfaces de TypeScript y esquemas Zod en un único repositorio.

### Alternatives Considered
* **Vite + React SPA + Backend separado en Express/Fastify**:
  * *Descartado porque*: Exige orquestar dos servidores de desarrollo distintos, duplicar interfaces de TypeScript o configurar monorepos complejos (Turborepo), aumentando la fricción innecesariamente para una app de finanzas personales.
* **Remix / React Router v7**:
  * *Descartado porque*: El ecosistema de shadcn/ui y Auth.js v5 tiene soporte y documentación de primer nivel optimizados específicamente para Next.js App Router.

---

## 2. Precisión Numérica y Manejo Monetario (Soles - PEN)

### Decision
* **Almacenamiento**: Columna PostgreSQL de tipo `DECIMAL(12, 2)` mapeada en Prisma como `@db.Decimal(12, 2)` (tipo `Decimal` de `Prisma.Decimal`).
* **Operaciones aritméticas**: Uso de `decimal.js` en servicios del servidor para todas las operaciones de suma, resta y cálculo de porcentajes de presupuesto.
* **Formato y presentación**: Utilizar la API estándar del navegador y Node.js `Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })`, produciendo la convención oficial peruana: `S/ #,##0.00` (ejemplo: `S/ 1,450.50`).

### Rationale
* En JavaScript, el punto flotante binario IEEE-754 introduce imprecisiones inaceptables para balances contables (ej. `0.1 + 0.2 = 0.30000000000000004`).
* El tipo `Decimal(12, 2)` en PostgreSQL garantiza almacenamiento exacto hasta 9,999,999,999.99 Soles sin pérdida de céntimos.

### Alternatives Considered
* **Guardar importes como enteros en céntimos (ej. S/ 45.50 $\rightarrow$ 4550)**:
  * *Evaluado*: Es un patrón común en pasarelas como Stripe, pero añade carga cognitiva al desarrollador (dividir/multiplicar por 100 constantemente en cada query y vista) y complica la visualización directa en herramientas de base de datos o reportes SQL directos.
* **Usar `number` flotante de JS**:
  * *Descartado categóricamente*: Produce errores acumulativos de redondeo y balances descuadrados con el tiempo.

---

## 3. Base de Datos y Persistencia Local (Docker Compose + Prisma)

### Decision
Ejecutar **PostgreSQL 16 (Alpine)** en un contenedor Docker gestionado por **Docker Compose** con un volumen persistente nombrado (`postgres_data`), interactuando mediante **Prisma ORM**.

### Rationale
* **Persistencia garantizada**: El volumen `postgres_data` asegura que reiniciar contenedores o el equipo no borra transacciones ni presupuestos.
* **Integridad referencial en motor**: Las relaciones de categorías con transacciones usan `onDelete: Restrict`, impidiendo que el borrado accidental de una categoría deje movimientos huérfanos.
* **Migraciones controladas y reproducibles**: `prisma migrate dev` genera archivos SQL versionados en Git.
* **Respaldos sencillos**: Se documentan comandos `pg_dump` y `pg_restore` ejecutables a través de `docker exec`.

### Alternatives Considered
* **SQLite local**:
  * *Descartado porque*: Presenta bloqueos de concurrencia en escrituras y dificulta la replicación fiel de entornos de producción basados en PostgreSQL.
* **Bases de datos serverless en la nube (Neon / Supabase)**:
  * *Descartado*: Requiere conectividad a internet obligatoria, cuentas de terceros y configuración de credenciales externas para desarrollar localmente.

---

## 4. Sistema de Diseño e Interfaz de Usuario (Tailwind CSS + shadcn/ui)

### Decision
Utilizar **Tailwind CSS**, componentes de **shadcn/ui** (basados en primitivas accesibles de Radix UI) y **next-themes** para soporte de tema Claro y Oscuro.

### Rationale
* **Estética moderna y limpia**: shadcn/ui ofrece componentes pulidos (diálogos modales para transacciones, calendarios con popover, tarjetas de KPIs, selectores de categorías) sin dependencias monolíticas.
* **Control total**: El código de los componentes se aloja en el propio proyecto (`components/ui`), permitiendo personalización completa.
* **Accesibilidad (a11y)**: Primitivas Radix con soporte completo de navegación por teclado y lectores de pantalla.
* **Tema Claro/Oscuro dinámico**: Configurado mediante variables CSS HSL de Tailwind que conmutan fluidamente sin destellos (*flash of unstyled content*).

### Alternatives Considered
* **Material UI (MUI)**:
  * *Descartado*: Dependencia pesada de CSS-in-JS (Emotion), mayor impacto en bundle y estética genérica de Google que se aleja del diseño minimalista buscado.

---

## 5. Visualización de Datos y Gráficos (Recharts)

### Decision
Utilizar **Recharts** encapsulando los gráficos en componentes de cliente (`'use client'`).
* **Gráfico de dona/pastel (`PieChart`)**: Para la distribución porcentual de gastos por categoría en el mes.
* **Gráfico de barras/área (`BarChart` / `AreaChart`)**: Para la evolución temporal de ingresos vs gastos a lo largo de los meses.

### Rationale
* Diseñado específicamente para React utilizando SVG interactivo.
* Contenedor responsivo nativo (`ResponsiveContainer`) que se adapta a pantallas móviles y de escritorio.
* Integración fluida con la paleta de colores de Tailwind usando variables CSS para mantener contraste tanto en modo claro como en modo oscuro.

### Alternatives Considered
* **Chart.js**:
  * *Descartado*: Basado en HTML Canvas, lo que dificulta la estilización directa con variables CSS y el manejo de temas reactivos en Next.js.

---

## 6. Autenticación y Aislamiento de Datos (Auth.js / NextAuth v5)

### Decision
Implementar **Auth.js v5** con proveedor de credenciales locales (Email + Password hasheado con `bcryptjs`) y sesiones seguras en cookies HTTP-only basadas en JWT.

### Rationale
* **Aislamiento estricto en servidor**: Toda consulta en Server Actions extrae el `userId` desde la sesión verificada criptográficamente (`auth()`), aplicando siempre `where: { userId }`. El cliente jamás puede inyectar o modificar el `userId`.
* **Privacidad**: Permite que varios usuarios utilicen la misma instancia local sin ver ni inferir la información financiera de los demás.
* **Preparado para producción**: El esquema soporta añadir proveedores OAuth (Google, GitHub) en el futuro sin modificar la arquitectura base.

### Alternatives Considered
* **JWT manual / tokens custom**:
  * *Descartado*: Reinventar la rueda en seguridad de cookies, rotación de sesiones y protección CSRF introduce riesgos innecesarios.

---

## 7. Estrategia de Pruebas Automatizadas (Vitest + Playwright)

### Decision
* **Vitest**: Pruebas unitarias y de integración para la lógica de cálculo financiero (balance neto, sumatorias por categoría, cálculo de porcentaje consumido de presupuestos, detección de sobregiro y validadores Zod).
* **Playwright**: Pruebas de extremo a extremo (E2E) simulando los flujos críticos del usuario en el navegador (crear transacción $\rightarrow$ validar balance en dashboard $\rightarrow$ ver advertencia de presupuesto).

### Rationale
* **Velocidad**: Vitest ejecuta pruebas de TypeScript nativas instantáneamente sin compilación previa con Babel o ts-jest.
* **Garantía operativa**: Playwright comprueba la experiencia real del usuario en navegadores Chromium/WebKit/Firefox.
