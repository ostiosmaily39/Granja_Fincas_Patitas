# SISTEMA DE INFORMACIÓN PARA LA GESTIÓN INTEGRAL DE GRANJA AGROPECUARIA
## ESPECIFICACIÓN DE CASOS DE USO
**Documento:** CU-GRANJA-v1.0  
[cite_start]**Versión:** 1.0 — Alineada con Requerimientos v2.0 [cite: 131, 132]

| Proyecto     | Sistema de Información Granja Agropecuaria                   |
| :----------- | :----------------------------------------------------------- |
| **Versión**  | 1.0                                                          |
| **Estado**   | Borrador para revisión                                       |
| **Total CU** | 27 casos de uso                                              |
| **Módulos**  | M1 Usuarios, M2 Inventario, M3 Reproductivo, M4 Insumos, M5 Producción |
| **Actores**  | Administrador, Encargado, Empleado, Sistema                  |

---

## 1. Introducción
[cite_start]Este documento especifica los casos de uso del sistema, describiendo la interacción entre los actores y el sistema, incluyendo flujos principales, alternativos, de excepción y reglas de negocio[cite: 136, 137]. [cite_start]Está alineado con los requerimientos funcionales RF001–RF030[cite: 138].

### [cite_start]1.1 Alcance por Módulos [cite: 141, 145]
* **M1 — Trazabilidad y Usuarios:** Autenticación, roles y gestión de cuentas.
* **M2 — Inventario Pecuario:** Ciclo de vida del animal, salud, alimentación y vacunación.
* **M3 — Reproductivo / Crías:** Eventos reproductivos y registro de partos.
* **M4 — Insumos y Bodega:** Inventario, movimientos de stock y alertas.
* **M5 — Producción:** Registro y análisis de leche y huevos.

---

## [cite_start]2. Actores del Sistema [cite: 156]

| ID     | Actor         | Tipo       | Descripción                                         | Nivel de acceso                                              |
| :----- | :------------ | :--------- | :-------------------------------------------------- | :----------------------------------------------------------- |
| **A1** | Administrador | Primario   | Responsable de configuración y gestión de usuarios. | Acceso total a todos los módulos.                            |
| **A2** | Encargado     | Primario   | Responsable de la operación diaria de la finca.     | Acceso operativo completo (excepto gestión de usuarios).     |
| **A3** | Empleado      | Primario   | Operario que realiza tareas bajo supervisión.       | Acceso funcional igual al Encargado; cada acción queda trazada. |
| **A4** | Sistema       | Secundario | El sistema actuando de forma autónoma.              | Ejecuta validaciones, alertas y cálculos internos.           |

---

## [cite_start]3. Resumen de Casos de Uso (Muestra) [cite: 159]

| ID CU      | Nombre                        | Módulo          | Actor(es)        | RF    |
| :--------- | :---------------------------- | :-------------- | :--------------- | :---- |
| **CU-001** | Registrar usuario             | M1 Trazabilidad | Administrador    | RF001 |
| **CU-007** | Registrar animal              | M2 Inventario   | Todos            | RF007 |
| **CU-015** | Registrar evento reproductivo | M3 Reproductivo | Todos            | RF017 |
| **CU-017** | Registrar insumo              | M4 Insumos      | Admin, Encargado | RF019 |
| **CU-026** | Registrar producción          | M5 Producción   | Todos            | RF029 |

---

## 4. Detalle de Casos de Uso (Ejemplos Principales)

### CU-001: Registrar usuario
* **Actor:** Administrador.
* **Objetivo:** Crear una cuenta nueva con datos personales y rol asignado.
* **Precondiciones:** Sesión activa como Administrador; correo/usuario inexistentes.
* **Flujo Principal:**
    1. Acceder a Gestión de Usuarios.
    2. Completar formulario (nombre, correo, usuario, contraseña, rol).
    3. El sistema valida formato, unicidad y fortaleza de contraseña.
    4. El Administrador confirma; el sistema cifra la contraseña y persiste el registro.

### CU-007: Registrar animal
* **Actores:** Administrador, Encargado, Empleado.
* **Objetivo:** Ingresar un animal (vaca, cerdo o gallina) al inventario.
* **Flujo Principal:**
    1. Seleccionar "Registrar animal".
    2. Ingresar especie, raza, sexo, fecha de nacimiento/adquisición y peso inicial.
    3. El sistema genera un **ID único** (ej. VAC-2025-0042).
    4. Se crea el historial inicial y se notifica el éxito.

### CU-015: Registrar evento reproductivo
* **Actores:** Todos.
* **Objetivo:** Documentar montas o inseminaciones.
* **Regla de Negocio:** El sistema calcula automáticamente la fecha estimada de parto según la especie (Vaca: +283 días, Cerda: +114 días).

### CU-018: Consultar inventario de insumos
* **Objetivo:** Visualizar stock organizado por categorías (Alimentos, Medicamentos, Otros).
* **Alerta Visual:** Los insumos con stock bajo o próximos a vencer se resaltan automáticamente.

### CU-026: Registrar producción de leche y huevos
* **Objetivo:** Registro diario por animal (leche/litros) o lote (huevos/unidades).
* **Flujo:** Permite el registro masivo para múltiples vacas en un mismo turno (mañana/tarde/noche).