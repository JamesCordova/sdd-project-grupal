# Interface Contract: CSV Export API Route

**Feature**: `001-personal-finance-tracker`  
**Date**: 2026-10-27  
**Endpoint**: `GET /api/export/transactions`  

---

## 1. Parámetros de Consulta (Query Parameters)

| Parámetro | Tipo | Requerido | Ejemplo | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| `startDate` | String (YYYY-MM-DD) | No | `2026-01-01` | Filtrar desde esta fecha |
| `endDate` | String (YYYY-MM-DD) | No | `2026-12-31` | Filtrar hasta esta fecha |
| `type` | String | No | `EXPENSE` | `"INCOME" \| "EXPENSE"` |
| `categoryId`| String | No | `cm2...` | Filtrar por categoría específica |

---

## 2. Formato de Cabeceras HTTP de Respuesta

* **Content-Type**: `text/csv; charset=utf-8`
* **Content-Disposition**: `attachment; filename="transacciones-[YYYYMMDD-HHmmss].csv"`
* **BOM UTF-8**: Se prefija `\uFEFF` (Byte Order Mark) al inicio del flujo para garantizar que Microsoft Excel en Windows abra el archivo reconociendo automáticamente los acentos, la letra ñ y caracteres especiales sin requerir importar manualmente como texto.

---

## 3. Estructura de Columnas del Archivo CSV

```csv
"Fecha","Tipo","Categoría","Descripción","Monto (PEN)"
"2026-10-27","Gasto","Alimentación","Supermercado Wong","145.50"
"2026-10-26","Ingreso","Sueldo","Honorarios Profesionales","4200.00"
"2026-10-25","Gasto","Transporte","Recarga tarjeta Metropolitano","30.00"
```

* **Separador**: Coma (`,`) con campos de texto escapados entre comillas dobles (`"..."`).
* **Formato numérico**: Punto decimal (`.`) estándar con dos decimales para compatibilidad de fórmulas.
