# Quickstart & Validation Guide: Personal Finance Tracker

**Feature**: `001-personal-finance-tracker`  
**Date**: 2026-10-27  

Esta guía documenta los pasos necesarios para levantar el entorno de desarrollo local, ejecutar las migraciones de base de datos y validar de extremo a extremo que las funcionalidades descritas en [spec.md](file:///c:/Users/Usuario/Desktop/Code/spec-kit/specs/001-personal-finance-tracker/spec.md) operan correctamente.

---

## 1. Prerrequisitos

* **Node.js**: Versión `20.x` o superior (`node -v`).
* **Docker Desktop**: Con soporte para Docker Compose (`docker compose version`).
* **NPM**: Gestor de paquetes oficial (`npm -v`).

---

## 2. Puesta en Marcha del Entorno (Paso a Paso)

### Paso 2.1: Levantar la Base de Datos PostgreSQL en Docker
```bash
# Iniciar el contenedor de PostgreSQL con volumen persistente en segundo plano
docker compose up -d

# Comprobar que el contenedor está activo y saludable
docker compose ps
```

### Paso 2.2: Configuración de Variables de Entorno
Asegurarse de contar con el archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/personal_finance?schema=public"
NEXTAUTH_SECRET="tu-clave-secreta-aleatoria-de-al-menos-32-caracteres"
NEXTAUTH_URL="http://localhost:3000"
```

### Paso 2.3: Instalación de Dependencias y Migraciones
```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Generar cliente de Prisma y aplicar migraciones SQL a PostgreSQL
npx prisma migrate dev --name init

# 3. Poblar categorías predeterminadas del sistema (Alimentación, Sueldo, etc.)
npx prisma db seed
```

### Paso 2.4: Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
Abrir el navegador en [http://localhost:3000](http://localhost:3000).

---

## 3. Escenarios de Validación de Extremo a Extremo (Smoke Tests)

### Escenario 1: Registro y Listado de Transacciones en Soles (PEN)
1. **Acción**: Ir al formulario de registro rápido y añadir un gasto:
   * Monto: `S/ 85.50`
   * Fecha: Día de hoy
   * Categoría: `Alimentación`
   * Descripción: `Compras del mercado semanal`
2. **Resultado esperado**:
   * El movimiento aparece listado de inmediato en la tabla de transacciones formateado como `S/ 85.50`.
   * El balance del mes y el total de gastos del Dashboard se actualizan en menos de 1 segundo.

### Escenario 2: Configuración de Presupuesto y Alerta Preventiva (80%)
1. **Acción**:
   * Configurar un presupuesto mensual de `S/ 500.00` en la categoría `Alimentación`.
   * Registrar gastos adicionales en `Alimentación` hasta sumar `S/ 420.00` (84% del presupuesto).
2. **Resultado esperado**:
   * La barra de progreso de `Alimentación` cambia a color ámbar.
   * Se muestra un indicador de estado `WARNING` y aparece una alerta preventiva en el panel principal.

### Escenario 3: Alerta de Sobregiro Crítico (100%+)
1. **Acción**:
   * Registrar un gasto adicional de `S/ 100.00` en `Alimentación` (total gastado: `S/ 520.00`, límite: `S/ 500.00`).
2. **Resultado esperado**:
   * La barra de progreso cambia a color rojo.
   * El saldo disponible muestra un valor negativo con el monto exacto del sobregiro (`S/ -20.00`).
   * Se genera una notificación crítica visible en la cabecera de alertas del Dashboard.

### Escenario 4: Exportación de Movimientos a CSV compatible con Excel
1. **Acción**:
   * Ir a la vista de reportes/transacciones y hacer clic en el botón `Exportar a CSV`.
2. **Resultado esperado**:
   * Se descarga un archivo `.csv` con prefijo BOM UTF-8.
   * Al abrirlo con Microsoft Excel, las tildes (ej. "Alimentación") se leen correctamente sin caracteres extraños y las columnas numéricas permiten sumas automáticas.

### Escenario 5: Persistencia tras Reinicio de Contenedor
1. **Acción**:
   ```bash
   docker compose down
   docker compose up -d
   ```
2. **Resultado esperado**:
   * Al recargar [http://localhost:3000](http://localhost:3000), todos los usuarios, transacciones, categorías y presupuestos siguen presentes intactos sin pérdida de datos.

---

## 4. Ejecución de la Suite de Pruebas Automatizadas

```bash
# Ejecutar pruebas unitarias de cálculo financiero y esquemas Zod con Vitest
npm run test

# Ejecutar pruebas de extremo a extremo en navegador con Playwright
npx playwright test
```

---

## 5. Referencias a Diseño Técnico
* Modelo de datos completo: [data-model.md](file:///c:/Users/Usuario/Desktop/Code/spec-kit/specs/001-personal-finance-tracker/data-model.md)
* Contratos de Server Actions:
  * [transactions.md](file:///c:/Users/Usuario/Desktop/Code/spec-kit/specs/001-personal-finance-tracker/contracts/transactions.md)
  * [budgets.md](file:///c:/Users/Usuario/Desktop/Code/spec-kit/specs/001-personal-finance-tracker/contracts/budgets.md)
  * [categories.md](file:///c:/Users/Usuario/Desktop/Code/spec-kit/specs/001-personal-finance-tracker/contracts/categories.md)
  * [export.md](file:///c:/Users/Usuario/Desktop/Code/spec-kit/specs/001-personal-finance-tracker/contracts/export.md)
