# SISTEMA DE INFORMACIÓN PARA LA GESTIÓN INTEGRAL DE GRANJA AGROPECUARIA

**Especificación de Requerimientos de Software**  
**Versión 2.0 — Corregida y alineada con objetivos del sistema**

---

## 1. Objetivos del Sistema

### 1.1 Objetivo General
Desarrollar un sistema de información para la gestión integral de una granja agropecuaria, que permita registrar, controlar y hacer seguimiento a los procesos de crianza, salud animal y producción de vacas, cerdos y gallinas, con el fin de optimizar la toma de decisiones y los procesos pecuarios.

### 1.2 Objetivos Específicos

| ID | Descripción |
|----|-------------|
| **OE1** | **Inventario pecuario** — Registrar y hacer seguimiento al inventario de animales, documentando el ingreso, egreso y estado actual de cada individuo por especie, raza y categoría productiva. |
| **OE2** | **Reproducción** — Gestionar el proceso reproductivo de los animales, controlando los eventos de celo, monta, gestación y nacimiento de crías, con el fin de mantener la trazabilidad del pie de cría. |
| **OE3** | **Insumos y medicamentos** — Controlar el uso y consumo de insumos y medicamentos, registrando existencias, fechas de vencimiento y movimientos, para reducir pérdidas y desperdicios. |
| **OE4** | **Producción** — Monitorear la producción pecuaria registrando y consolidando datos de leche y huevos por animal y por lote, para facilitar el análisis de rendimiento productivo. |
| **OE5** | **Salud animal** — Gestionar la salud de los animales controlando el cumplimiento de esquemas de vacunación, tratamientos veterinarios y eventos sanitarios por individuo. |

---

## 2. Mapa de Módulos y Alineación con Objetivos

| Módulo | Objetivo(s) cubierto(s) | Requerimientos |
|--------|--------------------------|----------------|
| **M1 — Trazabilidad y Usuarios** | Transversal — soporta todos los OE (autenticación, roles y auditoría) | RF001 – RF006 |
| **M2 — Inventario Pecuario** | OE1 (inventario), OE5 (salud animal — vacunación, enfermedades) | RF007 – RF016 |
| **M3 — Reproductivo / Crías** | OE2 (reproducción y trazabilidad del pie de cría) | RF017 – RF018 |
| **M4 — Insumos y Bodega** | OE3 (control de insumos y medicamentos) | RF019 – RF026, RF028 |
| **M5 — Producción** | OE4 (registro y análisis de leche y huevos) | RF029 |
| **M6 — Reportes** | Transversal — soporta la generación de reportes y análisis para todos los OE | RF027, RF030 – RF033 |

---

## 3. Requerimientos Funcionales

### M1 — Trazabilidad y Usuarios
Módulo transversal que gestiona el acceso al sistema.

| ID | Nombre | Prioridad | Descripción | Objetivo(s) asociado(s) | Relación RNF |
|----|--------|-----------|-------------|--------------------------|--------------|
| RF001 | Registro de personal | Alta | Permitir el registro de datos personales de los usuarios, habilitando la creación de una cuenta única en el sistema. | Transversal | RNF04 · RNF06 |
| RF002 | Inicio de sesión | Alta | Habilitar la autenticación de usuarios mediante credenciales válidas (usuario/contraseña). | Transversal | RNF05 · RNF06 |
| RF003 | Recuperación de contraseña | Media | Proporcionar un mecanismo de recuperación de contraseña mediante envío de enlace o código al correo registrado. | Transversal | RNF04 · RNF06 |
| RF004 | Gestión de perfil de usuario | Media | Permitir a cada usuario consultar y actualizar su información personal. | Transversal | RNF04 |
| RF005 | Control de roles y permisos | Alta | Gestionar tres roles: Administrador, Encargado y Empleado, con distintos niveles de acceso y trazabilidad. | Transversal | RNF05 · RNF07 |
| RF006 | Auditoría de acceso | Media | Registrar todos los intentos de acceso (exitosos y fallidos) con fecha, hora y dirección IP. | Transversal | RNF11 |

---

### M2 — Inventario Pecuario
Cubre OE1 (inventario) y OE5 (salud animal). Gestiona el ciclo de vida completo de cada animal.

**Correcciones aplicadas:**
- Renombrado de "Inventario Ganadero" a "Inventario Pecuario".
- RF015 ampliado para cubrir esquemas de vacunación completos.
- RF014 elimina el calificativo "automatizado".

| ID | Nombre | Prioridad | Descripción | Objetivo(s) asociado(s) | Relación RNF |
|----|--------|-----------|-------------|--------------------------|--------------|
| RF007 | Registro de animal | Alta | Registrar datos de ingreso de un animal y asignar identificador único. | OE1 | RNF04 · RNF07 |
| RF008 | Visualización y consulta del inventario | Alta | Mostrar listado de animales con información resumida y acceso al detalle. | OE1 | RNF01 |
| RF009 | Actualización de datos del animal | Alta | Modificar datos de un animal con registro de quién y cuándo realizó el cambio. | OE1 | RNF04 |
| RF010 | Búsqueda y filtrado de animales | Alta | Búsqueda y filtrado por especie, raza, edad, estado de salud o reproductivo. | OE1 | RNF01 |
| RF011 | Confirmación de actualización de datos | Media | Solicitar confirmación explícita antes de guardar cambios en datos de un animal. | OE1 | RNF08 |
| RF012 | Historial integral del animal | Alta | Mantener un historial unificado de salud, vacunaciones, tratamientos, producción, alimentación y reproducción. | OE1 · OE5 | RNF10 · RNF11 |
| RF013 | Búsqueda en el historial del animal | Media | Filtrar el historial por tipo de evento, rango de fechas o diagnóstico. | OE1 · OE5 | RNF01 |
| RF014 | Control de alimentación del animal | Alta | Registrar el suministro de alimento por animal, documentando cantidad, tipo y fecha. | OE1 · OE3 | RNF07 |
| RF015 | Esquema de vacunación del animal | Alta | Gestionar el esquema de vacunación, con alertas de próximas dosis y estado de cumplimiento. | OE5 | RNF07 · RNF09 |
| RF016 | Registro de enfermedades e incidentes de salud | Alta | Registrar eventos de enfermedad o incidente de salud vinculados al historial del animal. | OE5 | RNF04 · RNF11 |

---

### M3 — Reproductivo / Crías
Cubre OE2. Gestiona el ciclo reproductivo y el ingreso automático de crías al inventario.

| ID | Nombre | Prioridad | Descripción | Objetivo(s) asociado(s) | Relación RNF |
|----|--------|-----------|-------------|--------------------------|--------------|
| RF017 | Registro del proceso reproductivo | Alta | Registrar eventos reproductivos: tipo de evento, fecha, progenitores, fecha estimada de parto y estado de gestación. | OE2 | RNF07 · RNF11 |
| RF018 | Registro de nacimiento de crías | Alta | Registrar nacimiento de crías con datos de fecha, peso, sexo y progenitores, incorporándolas automáticamente al inventario. | OE2 · OE1 | RNF09 · RNF04 |

---

### M4 — Insumos y Bodega
Cubre OE3. Gestiona el inventario de alimentos, medicamentos y demás insumos.

**Correcciones aplicadas:**
- RF019 renombrado de "Generación de insumos" a "Registro de insumos".
- Agregado campo de fecha de vencimiento en RF019.
- RF027 trasladado a M6 — Reportes.

| ID | Nombre | Prioridad | Descripción | Objetivo(s) asociado(s) | Relación RNF |
|----|--------|-----------|-------------|--------------------------|--------------|
| RF019 | Registro de insumos | Alta | Crear y registrar un insumo en el inventario con nombre, categoría, unidad, stock inicial y fecha de vencimiento. | OE3 | RNF09 |
| RF020 | Categorización del inventario | Alta | Organizar insumos por categorías para consulta y clasificación. | OE3 | RNF01 |
| RF021 | Listado de artículos por categoría | Media | Mostrar artículos por categoría con indicadores de stock y alertas visuales. | OE3 | RNF01 |
| RF022 | Búsqueda de insumos | Alta | Buscar insumos por nombre, categoría, fecha de registro o estado de stock. | OE3 | RNF01 |
| RF023 | Confirmación de edición de insumos | Media | Solicitar confirmación antes de guardar cambios en un insumo. | OE3 | RNF08 |
| RF024 | Adición de stock | Alta | Registrar ingreso de unidades a un insumo existente con trazabilidad. | OE3 | RNF07 |
| RF025 | Descuento de stock | Alta | Registrar salida o consumo de insumos con trazabilidad de uso. | OE3 | RNF08 |
| RF026 | Historial de movimientos de insumos | Alta | Generar historial de entradas, salidas y modificaciones con usuario responsable. | OE3 | RNF10 · RNF11 |
| RF028 | Alerta de stock mínimo de alimentos | Alta | Relacionar stock con consumo y generar alerta cuando esté por debajo del umbral. | OE3 | RNF09 · RNF02 |

---

### M5 — Producción
Cubre OE4. Registra la producción diaria de leche (vacas) y huevos (gallinas).

**Correcciones aplicadas:**
- RF030 trasladado a M6 — Reportes.

| ID | Nombre | Prioridad | Descripción | Objetivo(s) asociado(s) | Relación RNF |
|----|--------|-----------|-------------|--------------------------|--------------|
| RF029 | Registro de producción de leche y huevos | Alta | Registrar diariamente la producción de leche (por vaca) y huevos (por lote). | OE4 | RNF07 |

---

### M6 — Reportes
Módulo transversal que centraliza la generación de reportes y análisis de datos para todos los módulos del sistema.

**Correcciones aplicadas:**
- Nuevo módulo creado para agrupar todos los reportes.
- Se añaden funcionalidades de descarga, edición y personalización.

| ID | Nombre | Prioridad | Descripción | Objetivo(s) asociado(s) | Relación RNF |
|----|--------|-----------|-------------|--------------------------|--------------|
| RF027 | Reporte de inventario de insumos | Media | Generar reportes del estado del inventario con descarga en PDF/Excel y edición de filtros. | OE3 | RNF01 · RNF10 · RNF12 |
| RF030 | Reporte de producción | Media | Generar reporte diario e histórico de producción con KPIs y opción de descarga y filtros. | OE4 | RNF01 · RNF10 · RNF12 |
| RF031 | Reporte general del sistema | Media | Generar reporte consolidado de todos los módulos con selección de períodos y componentes. | Transversal | RNF01 · RNF10 · RNF12 |
| RF032 | Edición y personalización de reportes | Media | Editar configuración de reportes, columnas, filtros, orden y guardar plantillas. | Transversal | RNF12 · RNF07 |
| RF033 | Descarga de reportes | Alta | Descargar reportes en PDF, Excel o CSV con metadatos de generación. | Transversal | RNF01 · RNF04 |

---

## 4. Requerimientos No Funcionales

| ID | Categoría | Nombre | Descripción |
|----|-----------|--------|-------------|
| RNF01 | Rendimiento | Tiempo de respuesta | Las búsquedas, consultas y registros deben completarse en menos de 3 segundos. |
| RNF02 | Rendimiento | Escalabilidad | El sistema debe soportar el crecimiento sin degradación perceptible. |
| RNF03 | Rendimiento | Concurrencia | Operar correctamente con múltiples usuarios simultáneos. |
| RNF04 | Seguridad | Protección de datos | Almacenar información de forma segura, limitando acceso por rol. |
| RNF05 | Seguridad | Control de accesos | Implementar RBAC restringiendo funciones y vistas. |
| RNF06 | Seguridad | Encriptación de contraseñas | Usar algoritmo de hashing robusto (bcrypt o similar). |
| RNF07 | Fiabilidad | Continuidad operativa | Garantizar que los registros no se interrumpan inesperadamente. |
| RNF08 | Fiabilidad | Recuperación ante fallos | Implementar confirmaciones críticas y recuperación de datos. |
| RNF09 | Disponibilidad | Tiempo de actividad (uptime) | Garantizar alto tiempo de actividad y notificar interrupciones. |
| RNF10 | Sostenibilidad | Estadísticas e informes | Generar estadísticas de uso, producción e inventario para análisis histórico. |
| RNF11 | Sostenibilidad | Registro de incidencias (auditoría) | Registrar cada operación relevante con usuario, fecha y hora. |
| RNF12 | Usabilidad | Interfaz intuitiva | Interfaz clara, consistente y adaptable a dispositivos móviles. |

---

**Correcciones de numeración:**
- Se reindexaron los RNF (el original omitía RNF10).
- Se añadió RNF12 Usabilidad, ausente en la versión anterior.