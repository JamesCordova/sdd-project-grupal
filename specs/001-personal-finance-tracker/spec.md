# Feature Specification: Sistema de Gestión de Finanzas Personales

**Feature Branch**: `001-personal-finance-tracker`  
**Created**: 2026-10-27  
**Status**: Draft  
**Input**: User description: "Quiero desarrollar una aplicación web de finanzas personales que me ayude a organizar mejor mi dinero, controlar mis gastos y entender en qué estoy gastando más. Busco algo práctico, fácil de usar y visualmente atractivo..."

## Clarifications

### Session 2026-10-27
- Q: ¿Cómo debe implementarse la gestión de usuarios y autenticación en la primera versión (v1) del sistema? (FR-015) → A: Multi-usuario desde la v1 con Auth.js (Email y contraseña local con aislamiento estricto por usuario en el servidor).
- Q: ¿Cómo deben comportarse los presupuestos mensuales al iniciar un nuevo mes de calendario? (FR-007) → A: Renovación automática del monto límite con reinicio a cero del consumo (cada mes nuevo conserva el límite fijado, iniciando el gasto acumulado en S/ 0.00 sin arrastre de remanente).
- Q: ¿Cuáles deben ser los umbrales para las alertas de presupuesto y cómo deben presentarse en la interfaz? (FR-009) → A: Umbrales estándar fijos al 80% para advertencia preventiva (ámbar) y al 100% para sobregiro crítico (rojo), reflejados con cambios de color y avisos visuales en el panel.

## User Scenarios & Testing *(mandatory)*




### User Story 1 - Registro y Gestión Rápida de Ingresos y Gastos (Priority: P1)

Como usuario particular, quiero registrar rápidamente mis ingresos y gastos especificando monto, fecha, categoría y descripción, así como poder editarlos, eliminarlos, buscarlos y filtrarlos, para mantener un registro confiable y actualizado de mis movimientos cotidianos sin fricción.

**Why this priority**: Es el pilar operativo indispensable de toda la aplicación. Sin la capacidad de registrar y consultar transacciones con precisión en moneda local (Soles - PEN), ninguna otra función (presupuestos, análisis, dashboard) puede existir.

**Independent Test**: Puede probarse de forma totalmente autónoma creando, modificando, buscando y eliminando transacciones de prueba de tipo ingreso y gasto, verificando que los totales y balances recalculados coincidan de inmediato.

**Acceptance Scenarios**:

1. **Given** que el usuario accede al formulario de nueva transacción, **When** ingresa un monto positivo (ej. S/ 45.50), una fecha, selecciona una categoría (ej. "Alimentación") y escribe una descripción breve, **Then** la transacción se guarda exitosamente y aparece listada en la vista de movimientos con formato de moneda peruana (S/ 45.50).
2. **Given** un listado de transacciones existentes, **When** el usuario filtra por rango de fechas, por categoría específica o busca por palabra clave en la descripción, **Then** la lista muestra únicamente los registros que cumplen los criterios solicitados.
3. **Given** una transacción previamente registrada, **When** el usuario modifica su monto o categoría, o la elimina, **Then** los totales acumulados y balances reflejan inmediatamente la actualización.

---

### User Story 2 - Categorización Predeterminada y Personalizada (Priority: P1)

Como usuario, quiero disponer de un catálogo básico de categorías predefinidas (alimentación, transporte, vivienda, salud, educación, entretenimiento, servicios, sueldo, otros ingresos) y tener la posibilidad de crear, modificar y renombrar mis propias categorías, para organizar mis finanzas según mi estilo de vida personal.

**Why this priority**: Las categorías son el mecanismo central que permite entender en qué se gasta el dinero. Sin categorías, los movimientos no pueden ser clasificados ni analizados.

**Independent Test**: Puede probarse creando una categoría personalizada (ej. "Mascotas"), asignándole un gasto y verificando que el total atribuido a dicha categoría se calcule y visualice correctamente.

**Acceptance Scenarios**:

1. **Given** un usuario que inicia por primera vez, **When** visualiza el catálogo de categorías, **Then** encuentra categorías estándar precargadas listas para usar tanto para gastos como para ingresos.
2. **Given** que el usuario necesita una categoría que no existe, **When** ingresa un nombre y selecciona un color o icono distintivo, **Then** la nueva categoría queda disponible inmediatamente para asociar a transacciones nuevas o existentes.
3. **Given** una categoría que ya tiene transacciones asociadas, **When** el usuario intenta eliminarla, **Then** el sistema impide la pérdida accidental de datos solicitando reasignar las transacciones asociadas o impidiendo el borrado.

---

### User Story 3 - Establecimiento y Control de Presupuestos Mensuales (Priority: P2)

Como usuario, quiero definir presupuestos límite mensuales (tanto un monto general para todo el mes como presupuestos individuales por categoría), y visualizar el avance del gasto, saldo disponible y porcentaje consumido, con avisos preventivos cuando esté cerca de agotarse o lo haya superado.

**Why this priority**: Ayuda al usuario a cumplir sus metas de ahorro y prevenir gastos excesivos antes de que ocurran, transformando el registro pasivo en control activo del dinero.

**Independent Test**: Puede probarse configurando un presupuesto mensual de S/ 500 en "Alimentación", registrando gastos por S/ 420 y verificando que el sistema indique 84% de consumo y muestre una alerta preventiva de cercanía al límite.

**Acceptance Scenarios**:

1. **Given** un presupuesto configurado para una categoría en el mes actual, **When** el usuario consulta sus presupuestos, **Then** el sistema muestra: monto presupuestado, monto total gastado en el mes, monto remanente disponible y porcentaje utilizado.
2. **Given** un presupuesto con umbral de aviso configurado (ej. 80%), **When** los gastos registrados superan dicho umbral pero no el 100%, **Then** el sistema presenta un aviso visual de advertencia.
3. **Given** un presupuesto superado al 100% o más, **When** el usuario accede al sistema o registra un nuevo gasto en esa categoría, **Then** el sistema muestra un indicador crítico claro de presupuesto excedido indicando la cifra exacta del sobregiro.

---

### User Story 4 - Panel Principal (Dashboard) Financiero (Priority: P2)

Como usuario, quiero acceder a una vista panorámica limpia y atractiva al ingresar a la aplicación, que resuma mis ingresos del mes, gastos del mes, balance neto (ingresos - gastos), estado de mis presupuestos, categorías con mayor gasto, gráfico de evolución temporal y últimas transacciones con alertas relevantes.

**Why this priority**: Es la pantalla de inicio principal que proporciona claridad financiera inmediata al usuario en menos de 5 segundos sin obligarle a hacer cálculos manuales.

**Independent Test**: Puede probarse registrando un conjunto controlado de ingresos y gastos de prueba y verificando que todos los indicadores (KPIs), gráficos de distribución por categoría y balances reflejen matemáticamente los datos exactos.

**Acceptance Scenarios**:

1. **Given** transacciones registradas en el mes en curso, **When** el usuario abre el panel principal, **Then** visualiza las tarjetas de resumen (Total Ingresos, Total Gastos, Balance Neto) con formato en Soles (PEN) y actualización inmediata.
2. **Given** gastos repartidos en varias categorías, **When** el usuario visualiza el gráfico de distribución, **Then** observa con claridad qué categorías representan el mayor porcentaje del gasto mensual.
3. **Given** la presencia de presupuestos cercanos al límite o excedidos, **When** el usuario carga el panel, **Then** las alertas correspondientes se muestran de forma visible y priorizada en la parte superior o sección de avisos.

---

### User Story 5 - Análisis de Tendencias y Detección de Cambios de Hábito (Priority: P3)

Como usuario, quiero que la aplicación analice la evolución de mis gastos a lo largo de los meses y me informe si estoy gastando sustancialmente más en alguna categoría en comparación con el mes anterior o mi promedio, para tomar decisiones conscientes de consumo.

**Why this priority**: Aporta valor inteligente a mediano plazo, pero depende de contar previamente con un historial suficiente de transacciones para no emitir conclusiones erróneas.

**Independent Test**: Puede probarse registrando dos meses de historial y verificando que si el gasto en "Transporte" subió 40%, el sistema señale el incremento porcentual y monto adicional, mientras que para categorías sin historial previo indique que no hay suficientes datos para comparar.

**Acceptance Scenarios**:

1. **Given** datos de al menos dos meses consecutivos completos, **When** el usuario consulta la sección de análisis, **Then** el sistema compara el gasto mensual actual con el del período precedente por categoría y resalta variaciones significativas.
2. **Given** un usuario nuevo o con menos de un mes de registro, **When** accede a la sección de análisis, **Then** el sistema muestra un estado informativo amigable indicando que se requieren registros de períodos previos para activar las comparativas.

---

### User Story 6 - Reportes Periódicos y Exportación a Formato CSV (Priority: P3)

Como usuario, quiero consultar resúmenes detallados mensuales y anuales de mi flujo de dinero y poder descargar todas mis transacciones en un archivo CSV compatible con hojas de cálculo (Excel, Google Sheets), para realizar auditorías o respaldos personales por mi cuenta.

**Why this priority**: Da libertad al usuario sobre su propia información y satisface necesidades de archivo y análisis externo.

**Independent Test**: Puede probarse generando una exportación con 50 transacciones filtradas por un rango de fechas y verificando que el archivo descargado contenga cabeceras claras, codificación adecuada para caracteres en español (acentos) y cifras numéricas estándar importables en Excel.

**Acceptance Scenarios**:

1. **Given** una lista de transacciones con filtros aplicados (ej. gastos de 2026 en "Servicios"), **When** el usuario presiona "Exportar a CSV", **Then** el navegador descarga un archivo estructurado con columnas: Fecha, Tipo, Categoría, Descripción y Monto (PEN).
2. **Given** la vista de reporte anual, **When** el usuario selecciona un año específico, **Then** se despliega una tabla y gráfico comparativo de ingresos vs gastos mes a mes con el balance anual consolidado.

---

### User Story 7 - Personalización, Modo Oscuro y Seguridad de Acceso (Priority: P2)

Como usuario, quiero crear mi cuenta e iniciar sesión de forma segura con email y contraseña (Auth.js), alternar entre tema claro y oscuro, y tener la garantía de que mis datos financieros están estrictamente aislados y se conservan de forma íntegra en el servidor.

**Why this priority**: Mejora la ergonomía visual del usuario diario y establece las bases de privacidad y persistencia indispensables para la confianza en una app de finanzas.

**Independent Test**: Puede probarse reiniciando el servicio de la aplicación y verificando que todas las categorías, transacciones y presupuestos previamente registrados permanezcan intactos sin pérdida de información.

**Acceptance Scenarios**:

1. **Given** la aplicación en tema claro, **When** el usuario conmuta al tema oscuro, **Then** la paleta visual cambia instantáneamente manteniendo alto contraste y legibilidad en gráficos y tablas, guardando la preferencia.
2. **Given** cualquier operación de lectura o mutación de datos financieros, **When** se procesa en el sistema, **Then** la integridad referencial y las reglas de validación se aplican en el servidor.

---

### Edge Cases

- **Manejo de precisión monetaria**: Ningún cálculo financiero debe sufrir pérdida de precisión por redondeo en coma flotante (ej. operaciones que involucren céntimos).
- **Importes inválidos**: El sistema no debe permitir transacciones con monto cero (S/ 0.00) ni montos negativos en el campo de valor; el sentido financiero se determina por el tipo (Ingreso o Gasto).
- **Fechas retroactivas o futuras**: Al registrar un gasto con fecha de un mes pasado, el sistema debe recalcular los balances históricos y el presupuesto de dicho mes sin alterar los presupuestos del mes en curso.
- **Eliminación de categorías en uso**: Si el usuario intenta eliminar una categoría que contiene movimientos asociados, el sistema debe bloquear el borrado o exigir una reasignación explícita para evitar registros huérfanos.
- **Cambio de mes en presupuestos**: Al iniciar un nuevo mes de calendario, los presupuestos configurados mantienen automáticamente el monto límite base asignado, pero el gasto acumulado reinicia en S/ 0.00 de forma independiente sin arrastre ("rollover") de saldos no ejecutados ni de sobregiros de meses previos.
- **Cero registros o estado inicial ("Empty States")**: Las vistas de dashboard, gráficos y reportes deben mostrar mensajes explicativos y botones de acción ("Registra tu primer gasto") en lugar de gráficos rotos o errores NaN.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE permitir registrar transacciones financieras con campos obligatorios: Tipo (Ingreso o Gasto), Monto (positivo con hasta 2 decimales), Fecha (formato estándar YYYY-MM-DD), Categoría y Descripción (texto descriptivo opcional u obligatorio de máx. 255 caracteres).
- **FR-002**: El sistema DEBE presentar todos los importes monetarios en formato oficial de Soles peruanos (`S/ #,##0.00`).
- **FR-003**: El sistema DEBE permitir editar cualquier campo de una transacción existente o eliminarla, actualizando de forma atómica e inmediata todos los totales acumulados, balances y estados de presupuesto vinculados.
- **FR-004**: El sistema DEBE permitir filtrar transacciones por rango de fechas, categoría, tipo (ingreso/gasto) y realizar búsquedas de texto por descripción.
- **FR-005**: El sistema DEBE incluir un conjunto de categorías iniciales precargadas: Alimentación, Transporte, Vivienda, Salud, Educación, Entretenimiento, Servicios, Sueldo, Otros Ingresos.
- **FR-006**: El sistema DEBE permitir al usuario crear, editar nombre, color o icono, y archivar/desactivar categorías personalizadas.
- **FR-007**: El sistema DEBE permitir definir presupuestos mensuales globales y por categoría para un período mensual determinado (mes y año), renovándose automáticamente con el mismo monto base al inicio de cada nuevo mes con el consumo acumulado reiniciado a cero.
- **FR-008**: El sistema DEBE calcular dinámicamente para cada presupuesto: Gasto Real Acumulado, Saldo Disponible (Presupuesto - Gasto) y Porcentaje Consumido `(Gasto / Presupuesto) * 100`.
- **FR-009**: El sistema DEBE generar avisos visuales basados en dos umbrales estándar fijos: advertencia preventiva al alcanzar o superar el 80% del presupuesto (destacado en ámbar) y sobregiro crítico al alcanzar o superar el 100% (destacado en rojo y listado como alerta prioritaria en el panel principal).
- **FR-010**: El sistema DEBE presentar un panel principal con tarjetas de métricas del mes en curso: Ingresos Totales, Gastos Totales, Balance Neto, Gráfico de Gastos por Categoría, Gráfico de Evolución Temporal y Listado de las últimas transacciones registradas.
- **FR-011**: El sistema DEBE contar con validación estricta de formularios tanto en la interfaz de usuario como en el servidor, rechazando datos incompletos o malformados con mensajes de error legibles en español.
- **FR-012**: El sistema DEBE permitir exportar el conjunto actual o filtrado de transacciones a un archivo en formato CSV, con cabeceras en español y codificación UTF-8 compatible con Microsoft Excel.
- **FR-013**: El sistema DEBE garantizar persistencia de datos en almacenamiento relacional con copias de seguridad realizables mediante comandos documentados.
- **FR-014**: El sistema DEBE ofrecer selector de tema visual (Claro / Oscuro) con persistencia de la preferencia del usuario.
- **FR-015**: El sistema DEBE aislar de forma estricta los datos a nivel de servidor mediante autenticación multi-usuario (Auth.js con email y contraseña), garantizando que todas las transacciones, categorías y presupuestos pertenezcan a un usuario autenticado y ningún usuario pueda leer, editar ni inferir datos de otro.

### Key Entities

- **User**: Representa la cuenta del propietario de los datos financieros (identificador, email/nombre, fecha de registro, preferencias de interfaz).
- **Category**: Representa la clasificación de un movimiento (identificador, nombre, tipo [ingreso o gasto], icono/color, si es predeterminada o creada por el usuario, propietario asociado).
- **Transaction**: Representa un movimiento de dinero registrado (identificador, tipo [ingreso o gasto], monto con precisión exacta de centavos, fecha de la operación, descripción, identificador de categoría, propietario asociado, marcas de tiempo de creación/actualización).
- **Budget**: Representa un objetivo o límite de gasto para un mes y año determinados (identificador, mes, año, categoría asociada [opcional si es presupuesto global], monto límite asignado, umbral de advertencia porcentual, propietario asociado).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede completar el registro de un nuevo gasto en menos de 10 segundos desde cualquier pantalla mediante un acceso directo visible.
- **SC-002**: El 100% de los cálculos de balances, totales de categoría y porcentajes de presupuesto coinciden de manera exacta con la suma matemática de las transacciones registradas (margen de error de redondeo: 0.00).
- **SC-003**: La actualización del balance y estado del presupuesto tras registrar, editar o borrar una transacción se refleja en pantalla en menos de 1 segundo.
- **SC-004**: El archivo CSV exportado puede abrirse directamente en Microsoft Excel y Google Sheets reconociendo de forma inmediata las columnas, caracteres con tilde y formato de fecha y monto.
- **SC-005**: La interfaz se adapta de manera completamente responsiva y funcional en dispositivos móviles (pantallas desde 360px de ancho) y pantallas de escritorio.
- **SC-006**: Ante cualquier escenario de red o base de datos no disponible, el sistema informa con un mensaje amigable en español en lugar de colapsar o mostrar errores técnicos crudos.

## Assumptions

- **Moneda base**: La moneda oficial del sistema para la primera fase es el Sol peruano (PEN / S/.), sin conversión multimoneda automática inicial.
- **Zona horaria y fechas**: Las operaciones se registran y agrupan según la zona horaria de Perú (America/Lima, UTC-5).
- **Registro manual**: La entrada de datos es manual por parte del usuario (sin integración directa con APIs bancarias cerradas ni pasarelas de pago externas).
- **Persistencia**: La base de datos relacional se aloja en un contenedor Docker con volumen montado, lo que asegura que los datos sobreviven a reinicios del contenedor o del equipo.
