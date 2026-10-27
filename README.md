# 💰 Finanzas Perú — Control de Finanzas Personales

Aplicación web moderna, práctica y visualmente atractiva para el control de finanzas personales en **Soles Peruanos (`S/ #,##0.00`)**, diseñada bajo la metodología de especificación rigurosa **Spec Kit**.

---

## 🚀 Tecnologías Principales

- **Frontend & Framework**: Next.js 15 (App Router), React 19, TypeScript
- **Estilos & UI**: Tailwind CSS, shadcn/ui, soporte completo para tema Claro / Oscuro (HSL)
- **Visualización de Datos**: Recharts (Gráficos interactivos de dona y tendencias mensuales)
- **Base de Datos**: PostgreSQL 16 (Alpine) ejecutado en contenedor Docker con volumen persistente (`postgres_data`)
- **ORM & Migraciones**: Prisma ORM v6 con tipado estricto
- **Aritmética Financiera**: `decimal.js` (cero errores de redondeo de punto flotante IEEE 754)
- **Autenticación**: Auth.js v5 (NextAuth) con proveedor de credenciales y aislamiento multi-inquilino en servidor
- **Testing**: Vitest (pruebas unitarias e integrales) y Playwright (pruebas de extremo a extremo)

---

## 📦 Puesta en Marcha Rápida (Quickstart)

### 1. Clonar e Instalar Dependencias
```bash
git clone <repo-url>
cd spec-kit
npm install
```

### 2. Configurar Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Variables principales:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/personal_finance?schema=public"
NEXTAUTH_SECRET="super-secret-key-at-least-32-chars-long"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_CURRENCY="PEN"
```

### 3. Iniciar Contenedor PostgreSQL con Docker
```bash
docker compose up -d
```
Verifica que el contenedor `personal_finance_db` esté saludable:
```bash
docker compose ps
```

### 4. Ejecutar Migraciones y Carga Inicial de Datos (Seed)
```bash
npx prisma migrate dev
npm run db:seed
```

El script de seed crea:
- **Usuario Demo**: `demo@finanzas.pe` / Contraseña: `Demo123456!`
- **9 Categorías Base**: Alimentación, Transporte, Vivienda, Servicios, Salud, Educación, Entretenimiento, Salario, Otros Ingresos.

### 5. Iniciar Servidor de Desarrollo
```bash
npm run dev
```
Abre tu navegador en [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pruebas Automatizadas

### Pruebas Unitarias e Integración (Vitest)
Ejecuta los tests de validaciones Zod, motor decimal, cálculo de presupuestos, métricas del dashboard, exportación CSV y análisis de tendencias:
```bash
npm test
```

### Pruebas End-to-End (Playwright)
```bash
npx playwright test
```

---

## 💾 Respaldo y Restauración de Base de Datos (PostgreSQL)

### Crear Respaldo (Backup)
Para generar un dump SQL completo de la base de datos de producción o desarrollo local:
```bash
docker exec -t personal_finance_db pg_dump -U postgres -d personal_finance > backup_$(date +%Y%m%d_%H%M%S).sql
```

En PowerShell (Windows):
```powershell
docker exec -t personal_finance_db pg_dump -U postgres -d personal_finance | Out-File -Encoding utf8 backup.sql
```

### Restaurar Respaldo (Restore)
```bash
docker exec -i personal_finance_db psql -U postgres -d personal_finance < backup.sql
```

---

## 📊 Módulos y Funcionalidades

1. **Panel Principal (Dashboard)**:
   - Tarjetas KPI: Total Ingresos, Total Gastos y Balance Neto en Soles.
   - Gráfico de dona (Recharts) por categoría con desglose porcentual.
   - Gráfico comparativo de ingresos vs gastos de los últimos 6 meses.
   - Banners de alerta temprana (ámbar al 80%, rojo al 100%+ por sobregiro).
2. **Gestión de Transacciones (MVP)**:
   - Registro de ingresos y gastos con fecha, categoría, monto y descripción.
   - Filtros combinados por rango de fechas, categoría y tipo.
   - Paginación y búsqueda rápida.
3. **Control de Presupuestos**:
   - Presupuesto mensual global y límites por categoría.
   - Saldo disponible y cálculo de sobregiro negativo (`S/ -X.XX`).
   - Renovación automática al iniciar un nuevo mes sin arrastre de gasto.
4. **Categorías Personalizadas**:
   - Creación de categorías con selector de color e íconos Lucide.
   - Validación de integridad referencial: no se puede eliminar una categoría con movimientos activos.
5. **Tendencias y Hábitos**:
   - Comparación porcentual intermensual.
   - Regla de suficiencia: requiere al menos 2 meses con registros para evitar falsos análisis.
6. **Reportes y Exportación CSV**:
   - Resumen y balance anual mes por mes.
   - Exportación a CSV con marca de orden de bytes **UTF-8 BOM (`\uFEFF`)** para compatibilidad nativa con Microsoft Excel en español.
7. **Autenticación Multi-inquilino**:
   - Aislamiento estricto de datos en servidor (`where: { userId }`).
   - Registro, login y selección de tema claro/oscuro.

---

## 📄 Licencia

MIT © 2026 Finanzas Perú.
