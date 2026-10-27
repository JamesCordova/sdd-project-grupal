# Implementation Plan: Sistema de Gestión de Finanzas Personales

**Branch**: `001-personal-finance-tracker` | **Date**: 2026-10-27 | **Spec**: [spec.md](file:///c:/Users/Usuario/Desktop/Code/spec-kit/specs/001-personal-finance-tracker/spec.md)

**Input**: Feature specification from `specs/001-personal-finance-tracker/spec.md`

## Summary

Desarrollar una aplicación web full-stack de finanzas personales moderna, accesible y visualmente atractiva en Soles peruanos (PEN), construida con Next.js 15 (App Router), React 19, Tailwind CSS y shadcn/ui. El backend utiliza Server Actions y Prisma ORM sobre PostgreSQL 16 en Docker Compose con persistencia de volumen. La aplicación ofrece registro ultra-rápido de ingresos y gastos, categorización personalizable con protección de borrado, presupuestos mensuales con alertas de advertencia (80%) y sobregiro (100%), panel principal con KPIs y gráficos de Recharts, y exportación a CSV compatible con Microsoft Excel. El acceso cuenta con aislamiento estricto multi-usuario mediante Auth.js v5.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 20 LTS  
**Primary Dependencies**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui (Radix UI), Recharts, Zod, React Hook Form, Auth.js v5 (NextAuth), decimal.js, bcryptjs, lucide-react  
**Storage**: PostgreSQL 16 (Alpine) ejecutado en Docker Compose con volumen persistente (`postgres_data`), gestionado mediante Prisma ORM  
**Testing**: Vitest (pruebas unitarias de cálculo financiero y esquemas Zod) y Playwright (pruebas de extremo a extremo en navegador)  
**Target Platform**: Navegadores web modernos (Chrome, Firefox, Safari, Edge) con diseño 100% responsivo para móviles y escritorio  
**Project Type**: Web Application Full-Stack (Next.js con Server Components y Server Actions)  
**Performance Goals**: Carga inicial del panel < 1.5s, tiempo de respuesta de mutaciones (Server Actions) < 200ms, actualización de balances en pantalla < 1s  
**Constraints**:
* Cero tolerancia a errores de redondeo en operaciones de céntimos (uso de `Decimal(12, 2)` y `decimal.js`).
* Moneda oficial: Sol peruano (`S/ #,##0.00`).
* Aislamiento multi-usuario estricto verificado en el servidor (`where: { userId: session.user.id }`).
* Integridad referencial: Bloqueo de eliminación de categorías con transacciones asociadas.  
**Scale/Scope**: Uso personal y familiar continuo; diseñado para procesar miles de transacciones anuales por usuario con consultas indexadas (`[userId, date]`, `[userId, categoryId]`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

* **I. Library-First & Modular Design**: PASSED. La lógica de cálculo financiero (balances, presupuestos, porcentajes) se aísla en servicios puros (`lib/finance/`) independientes del framework UI.
* **II. Test-First & Verification**: PASSED. Pruebas unitarias de Vitest validan las reglas de cálculo de centavos y sobregiros antes de su integración visual.
* **III. Zero Flaky Data / Zero Floating Math**: PASSED. Se adopta `Decimal(12, 2)` en PostgreSQL y `decimal.js` en TypeScript.
* **IV. Security & Data Isolation**: PASSED. Server Actions extraen la identidad del usuario exclusivamente de la sesión criptográfica del servidor.

## Project Structure

### Documentation (this feature)

```text
specs/001-personal-finance-tracker/
├── spec.md              # Especificación de requerimientos y casos de uso
├── checklists/
│   └── requirements.md  # Checklist de calidad de requerimientos (16/16 superados)
├── plan.md              # Este plan de implementación técnico
├── research.md          # Decisiones de arquitectura y alternativas evaluadas (Fase 0)
├── data-model.md        # Diagrama E-R, entidades y schema Prisma (Fase 1)
├── quickstart.md        # Guía de levantamiento, pruebas y smoke tests (Fase 1)
├── contracts/           # Contratos de interfaz y Server Actions (Fase 1)
│   ├── transactions.md
│   ├── budgets.md
│   ├── categories.md
│   └── export.md
└── tasks.md             # Tareas ordenadas por dependencia (Fase 2 - /speckit-tasks)
```

### Source Code Layout

```text
spec-kit/
├── .env.example
├── docker-compose.yml           # Contenedor PostgreSQL 16 con volumen 'postgres_data'
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── prisma/
│   ├── schema.prisma            # Modelos: User, UserPreference, Category, Transaction, Budget
│   ├── migrations/              # Migraciones versionadas en SQL
│   └── seed.ts                  # Categorías base (Alimentación, Transporte, Sueldo, etc.)
├── src/
│   ├── app/                     # Next.js 15 App Router
│   │   ├── (auth)/              # Rutas de login y registro
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/         # Rutas protegidas
│   │   │   ├── layout.tsx       # Sidebar, navbar, selector de tema claro/oscuro
│   │   │   ├── page.tsx         # Dashboard panorámico principal
│   │   │   ├── transactions/    # Gestión, listado y filtros de movimientos
│   │   │   ├── budgets/         # Configuración y avance de presupuestos mensuales
│   │   │   ├── categories/      # Catálogo de categorías
│   │   │   └── reports/         # Reportes y comparativas mensuales/anuales
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts  # Endpoint de Auth.js
│   │       └── export/transactions/route.ts # Descarga de archivo CSV
│   ├── actions/                 # Server Actions (mutaciones seguras)
│   │   ├── transactions.ts
│   │   ├── budgets.ts
│   │   └── categories.ts
│   ├── components/              # Componentes de interfaz de usuario
│   │   ├── ui/                  # Componentes base shadcn/ui (Button, Dialog, Table, Card, etc.)
│   │   ├── dashboard/           # KPIs, widgets de resumen y alertas
│   │   ├── charts/              # Gráficos Recharts (CategoryPieChart, MonthlyTrendChart)
│   │   ├── transactions/        # Formularios rápidos, tabla y filtros
│   │   └── budgets/             # Tarjetas de progreso de presupuesto y badges de advertencia
│   ├── lib/                     # Utilidades y lógica de dominio
│   │   ├── db.ts                # Instancia singleton de Prisma Client
│   │   ├── auth.ts              # Configuración de Auth.js v5
│   │   ├── finance/             # Cálculos puros de balance, presupuestos y precisión Decimal
│   │   │   ├── calculations.ts
│   │   │   └── currency.ts      # Formateador Soles (PEN)
│   │   └── validations/         # Esquemas Zod compartidos
│   │       ├── transaction.ts
│   │       ├── budget.ts
│   │       └── category.ts
└── tests/
    ├── unit/                    # Pruebas Vitest de cálculos financieros y Zod
    │   ├── calculations.test.ts
    │   └── validations.test.ts
    └── e2e/                     # Pruebas Playwright de flujos de usuario
        ├── auth.spec.ts
        ├── transactions.spec.ts
        └── budgets.spec.ts
```

**Structure Decision**: Se adopta la estructura estándar de Next.js 15 App Router con `src/`, separando claramente la capa de acceso a datos (`actions/` y `lib/db.ts`), la lógica financiera pura testeable (`lib/finance/`), y la capa de presentación modular (`components/` y `app/`).

## Complexity Tracking

*No se registran violaciones ni desvíos injustificados respecto a la arquitectura recomendada.*
