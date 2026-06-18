# SISTEMA DE INFORMACIÓN PARA LA GESTIÓN INTEGRAL DE GRANJA AGROPECUARIA

## ESPECIFICACIÓN DE CASOS DE USO

**Documento:** CU-GRANJA-v2.0  
**Versión:** 2.0 — Alineada con Requerimientos v2.0 y nuevo módulo M6 Reportes

---

| **Proyecto** | Sistema de Información Granja Agropecuaria |
|--------------|---------------------------------------------|
| **Versión** | 2.0 |
| **Estado** | Borrador para revisión |
| **Total CU** | 28 casos de uso |
| **Módulos** | M1 Usuarios · M2 Inventario · M3 Reproductivo · M4 Insumos · M5 Producción · M6 Reportes |
| **Actores** | Administrador · Encargado · Empleado · Sistema |

---

## 1. Introducción

### 1.1 Propósito

Este documento especifica los casos de uso del Sistema de Información para la Gestión Integral de Granja Agropecuaria. Cada caso de uso describe de forma precisa la interacción entre los actores y el sistema, incluyendo el flujo principal, los flujos alternativos, los flujos de excepción y las reglas de negocio aplicables. El documento está directamente alineado con los requerimientos funcionales (RF001–RF033) definidos en la versión 2.0 de la especificación de requerimientos.

### 1.2 Alcance

Los casos de uso cubren los seis módulos del sistema:

- **M1 — Trazabilidad y Usuarios:** autenticación, roles y gestión de cuentas.
- **M2 — Inventario Pecuario:** ciclo de vida del animal, salud, alimentación y vacunación.
- **M3 — Reproductivo / Crías:** eventos reproductivos y registro de partos.
- **M4 — Insumos y Bodega:** inventario, movimientos de stock y alertas.
- **M5 — Producción:** registro de leche y huevos.
- **M6 — Reportes:** generación, personalización y descarga de reportes consolidados.

### 1.3 Definiciones y convenciones

En el presente documento se aplican las siguientes convenciones:

- **Flujo Principal (FP):** secuencia de pasos que describe el escenario de éxito.
- **Flujo Alternativo (FA):** variación válida del flujo principal que conduce igualmente al éxito.
- **Flujo de Excepción (FE):** desviación causada por error o condición anormal.
- **Actor:** entidad externa que interactúa con el sistema (persona o sistema automatizado).
- **Precondición:** estado que debe cumplirse antes de que el caso de uso pueda iniciarse.
- **Postcondición:** estado del sistema garantizado al finalizar el caso de uso exitosamente.
- **Regla de negocio:** restricción o política que el sistema debe hacer cumplir.

---

## 2. Actores del Sistema

El sistema reconoce cuatro actores. Los tres primeros son personas; el cuarto es el sistema operando de forma autónoma.

| **ID** | **Actor** | **Tipo** | **Descripción** | **Nivel de acceso** |
|--------|-----------|----------|-----------------|---------------------|
| **A1** | **Administrador** | Primario | Responsable de la configuración del sistema, gestión de usuarios y supervisión general. | Acceso total a todos los módulos, configuración y reportes. |
| **A2** | **Encargado** | Primario | Granjero responsable de la operación diaria de la finca. | Acceso completo a módulos operativos (inventario, insumos, producción, salud, reproducción). No gestiona usuarios. |
| **A3** | **Empleado** | Primario | Operario que realiza tareas cotidianas bajo supervisión del Encargado. | Mismo acceso funcional que el Encargado. Cada acción queda trazada con su identidad para auditoría. |
| **A4** | **Sistema** | Secundario | El propio sistema actuando de forma automática (alertas, cálculos, integraciones internas). | Ejecuta procesos internos: validaciones, alertas de stock, cálculo de fechas reproductivas, auditoría. |

---

## 3. Resumen de Casos de Uso

La siguiente tabla relaciona todos los casos de uso del sistema con su módulo, actores y requerimiento funcional de origen.

| **ID CU** | **Nombre** | **Módulo** | **Actor(es)** | **RF** |
|-----------|------------|------------|---------------|--------|
| **CU-001** | Registrar usuario | M1 Trazabilidad | Administrador | RF001 |
| **CU-002** | Iniciar sesión | M1 Trazabilidad | Administrador, Encargado, Empleado | RF002 |
| **CU-003** | Recuperar contraseña | M1 Trazabilidad | Administrador, Encargado, Empleado | RF003 |
| **CU-004** | Gestionar perfil de usuario | M1 Trazabilidad | Administrador, Encargado, Empleado | RF004 |
| **CU-005** | Gestionar roles y permisos | M1 Trazabilidad | Administrador | RF005 |
| **CU-006** | Cerrar sesión | M1 Trazabilidad | Administrador, Encargado, Empleado | RF006 |
| **CU-007** | Registrar animal | M2 Inventario | Administrador, Encargado, Empleado | RF007 |
| **CU-008** | Consultar inventario de animales | M2 Inventario | Administrador, Encargado, Empleado | RF008 |
| **CU-009** | Actualizar datos del animal | M2 Inventario | Administrador, Encargado, Empleado | RF009, RF011 |
| **CU-010** | Buscar y filtrar animales | M2 Inventario | Administrador, Encargado, Empleado | RF010 |
| **CU-011** | Consultar historial integral del animal | M2 Inventario | Administrador, Encargado, Empleado | RF012, RF013 |
| **CU-012** | Registrar alimentación del animal | M2 Inventario | Administrador, Encargado, Empleado | RF014 |
| **CU-013** | Gestionar esquema de vacunación | M2 Inventario | Administrador, Encargado, Empleado | RF015 |
| **CU-014** | Registrar enfermedad o incidente de salud | M2 Inventario | Administrador, Encargado, Empleado | RF016 |
| **CU-015** | Registrar evento reproductivo | M3 Reproductivo | Administrador, Encargado, Empleado | RF017 |
| **CU-016** | Registrar nacimiento de cría | M3 Reproductivo | Administrador, Encargado, Empleado | RF018 |
| **CU-017** | Registrar insumo | M4 Insumos | Administrador, Encargado | RF019 |
| **CU-018** | Consultar y categorizar inventario de insumos | M4 Insumos | Administrador, Encargado, Empleado | RF020, RF021 |
| **CU-019** | Buscar insumo | M4 Insumos | Administrador, Encargado, Empleado | RF022 |
| **CU-020** | Editar insumo | M4 Insumos | Administrador, Encargado | RF023 |
| **CU-021** | Agregar stock a un insumo | M4 Insumos | Administrador, Encargado | RF024 |
| **CU-022** | Descontar stock de un insumo | M4 Insumos | Administrador, Encargado, Empleado | RF025 |
| **CU-023** | Consultar historial de movimientos de insumos | M4 Insumos | Administrador, Encargado, Empleado | RF026 |
| **CU-024** | Gestionar alerta de stock mínimo | M4 Insumos | Sistema (automático) · Administrador, Encargado (revisión) | RF028 |
| **CU-025** | Registrar producción de leche y huevos | M5 Producción | Administrador, Encargado, Empleado | RF029 |
| **CU-026** | Generar reporte de inventario de insumos | M6 Reportes | Administrador, Encargado | RF027 |
| **CU-027** | Generar reporte de producción | M6 Reportes | Administrador, Encargado | RF030 |
| **CU-028** | Gestionar reportes del sistema | M6 Reportes | Administrador, Encargado | RF031, RF032, RF033 |

---

## 4. Casos de Uso — M1 — Trazabilidad y Usuarios

Este módulo es transversal al sistema. Gestiona el acceso, la autenticación, los roles y la auditoría de todas las operaciones. No está vinculado a un objetivo pecuario específico, sino que provee la infraestructura de seguridad que soporta los demás módulos.

**Casos de uso incluidos:**
- CU-001 — Registrar usuario
- CU-002 — Iniciar sesión
- CU-003 — Recuperar contraseña
- CU-004 — Gestionar perfil de usuario
- CU-005 — Gestionar roles y permisos
- CU-006 — Cerrar sesión

---

### CU-001 — Registrar usuario

| **Módulo** | M1 — Trazabilidad y Usuarios |
|------------|------------------------------|
| **Actor(es)** | Administrador |
| **RF asociado** | RF001 — Registro de personal |
| **Objetivo** | Crear una cuenta de usuario nueva en el sistema con sus datos personales, credenciales y rol asignado. |
| **Precondiciones** | - El actor tiene sesión activa con rol Administrador.<br>- El correo electrónico y el nombre de usuario no existen en el sistema. |
| **Postcondiciones** | - El nuevo usuario queda registrado en el sistema con estado activo.<br>- Las credenciales se almacenan con contraseña cifrada.<br>- Se genera un registro de auditoría con la creación del usuario. |
| **Flujo principal** | 1. El Administrador accede al módulo de Gestión de Usuarios.<br>2. El sistema presenta el formulario de registro con los campos: nombre completo, correo electrónico, nombre de usuario, contraseña, confirmación de contraseña y rol.<br>3. El Administrador completa todos los campos del formulario.<br>4. El sistema valida: formato de correo, unicidad de correo y usuario, fortaleza de contraseña (mínimo 8 caracteres, al menos una mayúscula, un número y un carácter especial) y coincidencia de contraseñas.<br>5. El sistema solicita confirmación antes de guardar.<br>6. El Administrador confirma la operación.<br>7. El sistema cifra la contraseña, persiste el registro y emite notificación de éxito.<br>8. El sistema registra la acción en el log de auditoría (usuario creador, fecha y hora). |
| **Flujos alternativos** | **FA1:** Cancelar creación (paso 5)<br>a. El Administrador selecciona «Cancelar».<br>b. El sistema descarta los datos ingresados y regresa al listado de usuarios. |
| **Flujos de excepción** | **FE1:** Datos inválidos (paso 4)<br>a. El sistema resalta en rojo los campos con error y muestra el mensaje descriptivo por cada campo.<br>b. El flujo regresa al paso 3.<br><br>**FE2:** Correo o usuario ya existe (paso 4)<br>a. El sistema muestra el mensaje: «El correo / usuario ya se encuentra registrado».<br>b. El flujo regresa al paso 3.<br><br>**FE3:** Error de conexión a base de datos (paso 7)<br>a. El sistema muestra mensaje de error técnico y sugiere reintentar.<br>b. El registro no se persiste; el formulario conserva los datos ingresados. |
| **Reglas de negocio** | - La contraseña nunca se almacena en texto plano (hash bcrypt).<br>- Sólo el Administrador puede crear usuarios.<br>- El rol asignado determina los permisos efectivos desde el primer inicio de sesión.<br>- Un usuario recién creado tiene estado «Activo» por defecto. |

---

### CU-002 — Iniciar sesión

| **Módulo** | M1 — Trazabilidad y Usuarios |
|------------|------------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF002 — Inicio de sesión |
| **Objetivo** | Autenticar al usuario en el sistema mediante sus credenciales y habilitar el acceso a los módulos según su rol. |
| **Precondiciones** | - El usuario tiene una cuenta activa en el sistema.<br>- El usuario no supera el límite de intentos fallidos vigente. |
| **Postcondiciones** | - Se crea una sesión activa para el usuario autenticado.<br>- El sistema registra la fecha y hora del acceso en el log de auditoría.<br>- El usuario visualiza el menú de módulos de acuerdo con su rol. |
| **Flujo principal** | 1. El usuario accede a la pantalla de inicio de sesión del sistema.<br>2. El sistema presenta el formulario con campos: nombre de usuario y contraseña.<br>3. El usuario ingresa sus credenciales.<br>4. El sistema valida que los campos no estén vacíos.<br>5. El sistema verifica las credenciales contra el repositorio de usuarios (comparando el hash de la contraseña).<br>6. El sistema crea la sesión, registra el acceso y redirige al tablero principal del usuario. |
| **Flujos alternativos** | **FA1:** Olvidé mi contraseña (paso 3)<br>a. El usuario selecciona el enlace «¿Olvidaste tu contraseña?».<br>b. El sistema redirige al flujo de CU-003 Recuperación de contraseña. |
| **Flujos de excepción** | **FE1:** Credenciales incorrectas (paso 5)<br>a. El sistema incrementa el contador de intentos fallidos del usuario.<br>b. Muestra el mensaje: «Usuario o contraseña incorrectos».<br>c. Si el contador alcanza 5 intentos, se bloquea la cuenta por 15 minutos y se notifica al Administrador.<br>d. El flujo regresa al paso 3.<br><br>**FE2:** Cuenta inactiva o bloqueada (paso 5)<br>a. El sistema muestra: «Su cuenta está inactiva o bloqueada. Contacte al Administrador».<br>b. El flujo termina sin acceso.<br><br>**FE3:** Campos vacíos (paso 4)<br>a. El sistema resalta los campos vacíos y solicita completarlos.<br>b. El flujo regresa al paso 3. |
| **Reglas de negocio** | - Máximo 5 intentos fallidos consecutivos antes de bloqueo temporal (15 min).<br>- La sesión expira automáticamente tras 30 minutos de inactividad.<br>- Las contraseñas no se transmiten en texto plano. |

---

### CU-003 — Recuperar contraseña

| **Módulo** | M1 — Trazabilidad y Usuarios |
|------------|------------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF003 — Recuperación de contraseña |
| **Objetivo** | Permitir al usuario restablecer su contraseña cuando no puede acceder al sistema. |
| **Precondiciones** | - El usuario tiene una cuenta activa con correo electrónico registrado.<br>- El usuario no está en sesión activa. |
| **Postcondiciones** | - La contraseña del usuario es actualizada por la nueva contraseña elegida.<br>- El enlace de restablecimiento queda invalidado tras su uso.<br>- Se registra el evento de cambio de contraseña en el log de auditoría. |
| **Flujo principal** | 1. El usuario accede a la pantalla de inicio de sesión y selecciona «¿Olvidaste tu contraseña?».<br>2. El sistema presenta el formulario de recuperación solicitando el correo electrónico registrado.<br>3. El usuario ingresa su correo y confirma.<br>4. El sistema verifica que el correo existe en la base de datos.<br>5. El sistema genera un token de restablecimiento de un solo uso con vigencia de 30 minutos y envía el enlace al correo del usuario.<br>6. El usuario abre el correo y accede al enlace de restablecimiento.<br>7. El sistema valida el token (existencia y vigencia).<br>8. El sistema presenta el formulario: nueva contraseña y confirmación.<br>9. El usuario ingresa y confirma la nueva contraseña.<br>10. El sistema valida la fortaleza de la contraseña y la coincidencia.<br>11. El sistema cifra y persiste la nueva contraseña, invalida el token y notifica al usuario del cambio exitoso. |
| **Flujos alternativos** | **FA1:** El usuario recuerda la contraseña en el paso 3<br>a. El usuario selecciona «Volver al inicio de sesión» y continúa con CU-002. |
| **Flujos de excepción** | **FE1:** Correo no registrado (paso 4)<br>a. Por seguridad el sistema muestra el mismo mensaje de éxito sin revelar si el correo existe: «Si el correo está registrado, recibirás el enlace en breve».<br><br>**FE2:** Token expirado o inválido (paso 7)<br>a. El sistema muestra: «El enlace ha expirado o ya fue utilizado».<br>b. Ofrece la opción de solicitar un nuevo enlace, retomando desde el paso 2.<br><br>**FE3:** Contraseña débil o no coincide (paso 10)<br>a. El sistema muestra los errores específicos y el flujo regresa al paso 9. |
| **Reglas de negocio** | - El token tiene vigencia de 30 minutos y uso único.<br>- No se debe informar si un correo está o no registrado (prevención de enumeración de usuarios).<br>- La nueva contraseña debe cumplir la política de fortaleza definida en CU-001. |

---

### CU-004 — Gestionar perfil de usuario

| **Módulo** | M1 — Trazabilidad y Usuarios |
|------------|------------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF004 — Gestión de perfil de usuario |
| **Objetivo** | Permitir al usuario consultar y actualizar su información personal dentro del sistema. |
| **Precondiciones** | - El usuario tiene sesión activa. |
| **Postcondiciones** | - Los datos personales del usuario quedan actualizados.<br>- El sistema registra la modificación con fecha, hora y usuario que realizó el cambio. |
| **Flujo principal** | 1. El usuario accede a la sección «Mi Perfil» desde el menú principal.<br>2. El sistema muestra los datos actuales: nombre completo, correo electrónico, nombre de usuario y rol (el rol es solo lectura).<br>3. El usuario modifica los campos editables deseados.<br>4. El usuario selecciona «Guardar cambios».<br>5. El sistema valida los datos ingresados (formato de correo, unicidad si cambió).<br>6. El sistema solicita la contraseña actual del usuario para confirmar la identidad.<br>7. El usuario ingresa su contraseña actual.<br>8. El sistema persiste los cambios y notifica el éxito. |
| **Flujos alternativos** | **FA1:** Cambio de contraseña desde perfil (paso 3)<br>a. El usuario selecciona «Cambiar contraseña».<br>b. El sistema solicita contraseña actual, nueva contraseña y confirmación.<br>c. El sistema valida y persiste el cambio de contraseña. |
| **Flujos de excepción** | **FE1:** Contraseña actual incorrecta (paso 7)<br>a. El sistema muestra: «Contraseña incorrecta. No se guardaron los cambios».<br>b. El flujo regresa al paso 6.<br><br>**FE2:** Correo ya en uso por otro usuario (paso 5)<br>a. El sistema muestra el error y regresa al paso 3. |
| **Reglas de negocio** | - El rol del usuario sólo puede modificarlo el Administrador.<br>- La contraseña actual siempre se exige para confirmar cualquier cambio de datos personales. |

---

### CU-005 — Gestionar roles y permisos

| **Módulo** | M1 — Trazabilidad y Usuarios |
|------------|------------------------------|
| **Actor(es)** | Administrador |
| **RF asociado** | RF005 — Control de roles y permisos |
| **Objetivo** | Administrar los roles de los usuarios del sistema (Administrador, Encargado, Empleado) y controlar el acceso a módulos y funciones según dichos roles. |
| **Precondiciones** | - El actor tiene sesión activa con rol Administrador.<br>- El usuario objetivo existe en el sistema. |
| **Postcondiciones** | - El rol del usuario objetivo queda actualizado.<br>- Los permisos efectivos del usuario cambian inmediatamente (en la próxima petición si tiene sesión activa).<br>- Se genera registro de auditoría del cambio de rol. |
| **Flujo principal** | 1. El Administrador accede al módulo de Gestión de Usuarios.<br>2. El sistema presenta el listado de usuarios con nombre, rol actual y estado.<br>3. El Administrador selecciona un usuario y accede a su detalle.<br>4. El Administrador modifica el rol asignado mediante el selector de roles.<br>5. El sistema muestra un resumen del cambio: usuario, rol anterior y nuevo rol.<br>6. El Administrador confirma el cambio.<br>7. El sistema persiste el nuevo rol e invalida permisos cacheados del usuario si corresponde.<br>8. El sistema registra el evento de auditoría. |
| **Flujos alternativos** | **FA1:** Desactivar un usuario (paso 3)<br>a. El Administrador cambia el estado del usuario a «Inactivo».<br>b. El sistema cierra la sesión activa del usuario si la tiene, e impide nuevos accesos.<br>c. El historial del usuario queda preservado para consulta. |
| **Flujos de excepción** | **FE1:** Intento de degradar el propio rol de Administrador (paso 4)<br>a. El sistema bloquea la acción y muestra: «No puede modificar su propio rol». |
| **Reglas de negocio** | - Debe existir al menos un usuario con rol Administrador activo en el sistema.<br>- El rol Administrador puede ver y editar todos los registros del sistema.<br>- El Encargado y el Empleado tienen el mismo acceso funcional, pero el sistema registra el usuario responsable de cada operación para trazabilidad.<br>- Desactivar un usuario no elimina su historial de operaciones. |

---

### CU-006 — Cerrar sesión

| **Módulo** | M1 — Trazabilidad y Usuarios |
|------------|------------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF006 — Confirmación de cierre de sesión |
| **Objetivo** | Terminar la sesión activa del usuario de forma segura, previniendo pérdida de información. |
| **Precondiciones** | - El usuario tiene sesión activa en el sistema. |
| **Postcondiciones** | - La sesión del usuario es invalidada en el servidor.<br>- El sistema redirige a la pantalla de inicio de sesión.<br>- Se registra la hora de cierre de sesión en el log de auditoría. |
| **Flujo principal** | 1. El usuario selecciona la opción «Cerrar sesión» desde el menú de usuario.<br>2. El sistema detecta si hay operaciones en curso con cambios no guardados.<br>3. El sistema presenta la confirmación: «¿Desea cerrar sesión? Los cambios no guardados se perderán».<br>4. El usuario confirma el cierre de sesión.<br>5. El sistema invalida el token de sesión, elimina la cookie/token del cliente y redirige a la pantalla de inicio de sesión. |
| **Flujos alternativos** | **FA1:** El usuario cancela el cierre de sesión (paso 4)<br>a. El sistema cierra el diálogo de confirmación y mantiene la sesión activa.<br><br>**FA2:** Cierre de sesión por inactividad (timeout)<br>a. El sistema invalida automáticamente la sesión tras 30 min de inactividad.<br>b. Redirige al login con el mensaje: «Su sesión ha expirado por inactividad». |
| **Flujos de excepción** | **FE1:** Error de red al invalidar la sesión<br>a. El sistema elimina las credenciales locales del cliente de todas formas.<br>b. La sesión expirará en el servidor por timeout natural. |
| **Reglas de negocio** | - El cierre de sesión siempre requiere confirmación explícita del usuario.<br>- La sesión expira automáticamente a los 30 minutos de inactividad, sin necesidad de acción del usuario. |

---

## 5. Casos de Uso — M2 — Inventario Pecuario

Cubre OE1 (inventario) y OE5 (salud animal). Gestiona el ciclo de vida completo del animal: ingreso, seguimiento, historial clínico, vacunación y alimentación. Es el módulo central del sistema.

**Casos de uso incluidos:**
- CU-007 — Registrar animal
- CU-008 — Consultar inventario de animales
- CU-009 — Actualizar datos del animal
- CU-010 — Buscar y filtrar animales
- CU-011 — Consultar historial integral del animal
- CU-012 — Registrar alimentación del animal
- CU-013 — Gestionar esquema de vacunación
- CU-014 — Registrar enfermedad o incidente de salud

---

### CU-007 — Registrar animal

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF007 — Registro de animal |
| **Objetivo** | Ingresar un animal al inventario pecuario del sistema con todos sus datos de identificación y estado inicial. |
| **Precondiciones** | - El usuario tiene sesión activa con acceso al módulo de Inventario Pecuario.<br>- La especie del animal es una de las soportadas: vaca, cerdo o gallina. |
| **Postcondiciones** | - El animal queda registrado con un identificador único en el sistema.<br>- El animal aparece en el listado del inventario con estado «Activo».<br>- Se crea el primer registro en el historial del animal (evento de ingreso).<br>- Se registra auditoría con usuario y timestamp. |
| **Flujo principal** | 1. El usuario accede al módulo «Inventario Pecuario» y selecciona «Registrar animal».<br>2. El sistema presenta el formulario con los campos: especie (vaca / cerdo / gallina), raza, sexo, fecha de nacimiento o fecha de adquisición, peso inicial (kg), origen (nacido en finca / adquirido externo), estado de salud inicial y observaciones opcionales.<br>3. El usuario completa los campos obligatorios.<br>4. El sistema genera automáticamente un identificador único para el animal (formato: ESPECIE-AÑO-SECUENCIAL, ej. VAC-2025-0042).<br>5. El sistema valida los datos (rangos de peso, fechas no futuras, campos obligatorios).<br>6. El sistema solicita confirmación.<br>7. El usuario confirma.<br>8. El sistema persiste el registro, crea el historial inicial y notifica el éxito mostrando el ID asignado. |
| **Flujos alternativos** | **FA1:** Animal nacido en finca (origen = nacido, paso 3)<br>a. El campo «fecha de adquisición» se oculta y se activa «madre» (vinculación con registro reproductivo si existe).<br>b. Si proviene de un parto registrado, el sistema pre-llena los datos disponibles. |
| **Flujos de excepción** | **FE1:** Campos obligatorios incompletos o inválidos (paso 5)<br>a. El sistema resalta los campos con error con mensaje descriptivo.<br>b. El flujo regresa al paso 3.<br><br>**FE2:** Error al persistir (paso 8)<br>a. El sistema muestra error técnico y conserva el formulario para reintento. |
| **Reglas de negocio** | - El ID del animal es único, inmutable y generado por el sistema.<br>- El peso mínimo aceptable es 0.1 kg (crías recién nacidas).<br>- Un animal recién registrado tiene estado «Activo» por defecto.<br>- El usuario responsable del registro queda vinculado al historial del animal. |

---

### CU-008 — Consultar inventario de animales

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF008 — Visualización y consulta del inventario |
| **Objetivo** | Visualizar el listado completo de animales registrados con información clave y acceder al detalle individual. |
| **Precondiciones** | - El usuario tiene sesión activa con acceso al módulo de Inventario Pecuario.<br>- Existe al menos un animal registrado. |
| **Postcondiciones** | - El usuario visualiza el inventario actualizado.<br>- Sin modificaciones en la base de datos. |
| **Flujo principal** | 1. El usuario accede al módulo «Inventario Pecuario».<br>2. El sistema presenta la tabla de inventario con columnas: ID, Especie, Raza, Sexo, Edad, Peso actual, Estado de salud y Acciones.<br>3. El sistema muestra por defecto todos los animales activos, paginados (20 por página).<br>4. El usuario puede ordenar la tabla por cualquier columna.<br>5. El usuario selecciona un animal para ver su detalle.<br>6. El sistema muestra la ficha completa del animal: datos de identificación, estado de salud actual, últimos eventos del historial, estado de vacunación y últimos registros de producción (si aplica). |
| **Flujos alternativos** | **FA1:** Ver animales inactivos/egresados (paso 3)<br>a. El usuario activa el filtro «Mostrar inactivos».<br>b. El sistema incluye en el listado los animales con estado «Inactivo» o «Egresado». |
| **Flujos de excepción** | **FE1:** No hay animales registrados<br>a. El sistema muestra el estado vacío: «No hay animales registrados aún» con el botón de acceso rápido a CU-007.<br><br>**FE2:** Tiempo de respuesta superior a 3 segundos<br>a. El sistema muestra un indicador de carga y mantiene la interfaz operativa. |
| **Reglas de negocio** | - La paginación predeterminada es de 20 registros por página.<br>- El inventario sólo muestra animales activos por defecto. |

---

### CU-009 — Actualizar datos del animal

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF009 — Actualización de datos del animal · RF011 — Confirmación de actualización |
| **Objetivo** | Modificar los datos de un animal ya registrado (peso, estado de salud, categoría u otros campos editables). |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- El animal existe en el sistema con estado Activo. |
| **Postcondiciones** | - Los datos del animal quedan actualizados.<br>- Se genera un registro en el historial del animal indicando: campo modificado, valor anterior, valor nuevo, usuario y timestamp. |
| **Flujo principal** | 1. El usuario localiza el animal (vía CU-008 o CU-010) y selecciona «Editar».<br>2. El sistema presenta el formulario pre-poblado con los datos actuales del animal.<br>3. El usuario modifica los campos permitidos (peso, estado de salud, observaciones, categoría productiva).<br>4. El usuario selecciona «Guardar».<br>5. El sistema valida los datos modificados.<br>6. El sistema muestra el resumen de cambios: «Los siguientes campos serán actualizados: [lista]». Solicita confirmación.<br>7. El usuario confirma.<br>8. El sistema persiste los cambios, actualiza el historial y notifica el éxito. |
| **Flujos alternativos** | **FA1:** Egreso del animal (alta, venta, muerte) — paso 3<br>a. El usuario cambia el estado a «Inactivo/Egresado» e indica la causa (venta, muerte, traslado).<br>b. El sistema solicita confirmación adicional dado que el egreso es una operación crítica.<br>c. Tras confirmar, el animal pasa a estado «Inactivo» y se excluye del inventario activo. |
| **Flujos de excepción** | **FE1:** Datos inválidos (paso 5)<br>a. El sistema resalta los campos en error y regresa al paso 3.<br><br>**FE2:** El usuario cancela (paso 6)<br>a. El sistema descarta los cambios y muestra los datos originales. |
| **Reglas de negocio** | - El ID del animal y la especie son inmutables.<br>- Toda modificación queda registrada en el historial con trazabilidad completa.<br>- El egreso de un animal no elimina sus datos históricos. |

---

### CU-010 — Buscar y filtrar animales

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF010 — Búsqueda y filtrado de animales |
| **Objetivo** | Localizar uno o varios animales en el inventario aplicando criterios de búsqueda y filtros combinados. |
| **Precondiciones** | - El usuario tiene sesión activa con acceso al inventario. |
| **Postcondiciones** | - El sistema muestra los animales que cumplen los criterios aplicados.<br>- Sin modificaciones en la base de datos. |
| **Flujo principal** | 1. El usuario accede al módulo «Inventario Pecuario».<br>2. El sistema presenta la barra de búsqueda y el panel de filtros: especie, raza, sexo, rango de edad, estado de salud, estado reproductivo y estado de vacunación.<br>3. El usuario ingresa texto en la barra de búsqueda (busca por ID o raza) y/o selecciona filtros.<br>4. El sistema actualiza el listado en tiempo real (o al presionar «Buscar») mostrando sólo los animales que coinciden.<br>5. El sistema indica el número de resultados encontrados.<br>6. El usuario puede seleccionar un animal del resultado para acceder a su detalle (CU-008). |
| **Flujos alternativos** | **FA1:** Sin resultados (paso 4)<br>a. El sistema muestra: «No se encontraron animales con los criterios indicados».<br>b. Ofrece el botón «Limpiar filtros» para restablecer la búsqueda. |
| **Flujos de excepción** | **FE1:** Tiempo de respuesta superior a 3 segundos<br>a. El sistema muestra indicador de carga y completa la búsqueda en segundo plano. |
| **Reglas de negocio** | - Los filtros son acumulativos (AND lógico entre diferentes criterios).<br>- La búsqueda de texto es insensible a mayúsculas/minúsculas.<br>- Los resultados respetan la paginación de 20 registros por página. |

---

### CU-011 — Consultar historial integral del animal

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF012 — Historial integral del animal · RF013 — Búsqueda en historial |
| **Objetivo** | Visualizar y consultar el historial cronológico completo de un animal, incluyendo todos sus eventos de salud, producción, alimentación y reproducción. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- El animal existe en el sistema. |
| **Postcondiciones** | - El usuario visualiza el historial filtrado o completo del animal.<br>- Sin modificaciones en la base de datos. |
| **Flujo principal** | 1. El usuario accede a la ficha de un animal (CU-008 o CU-010).<br>2. El usuario selecciona la pestaña «Historial».<br>3. El sistema presenta la línea de tiempo del animal con todos los eventos registrados en orden cronológico descendente, clasificados por tipo: salud, vacunación, producción, alimentación y reproducción.<br>4. Cada evento muestra: tipo, fecha, descripción resumida, usuario responsable y enlace al detalle completo.<br>5. El usuario puede seleccionar un evento para ver su detalle completo. |
| **Flujos alternativos** | **FA1:** Filtrar historial (paso 3)<br>a. El usuario selecciona los tipos de evento a mostrar y/o define un rango de fechas.<br>b. El sistema actualiza la línea de tiempo mostrando sólo los eventos que cumplen el filtro.<br><br>**FA2:** Buscar en historial por diagnóstico o descripción<br>a. El usuario ingresa texto en el campo de búsqueda del historial.<br>b. El sistema filtra los eventos cuya descripción o diagnóstico contenga el texto ingresado. |
| **Flujos de excepción** | **FE1:** El animal no tiene eventos en el historial<br>a. El sistema muestra: «Este animal no tiene eventos registrados aún».<br><br>**FE2:** Sin resultados con el filtro aplicado<br>a. El sistema muestra: «Ningún evento coincide con los filtros aplicados» y ofrece «Limpiar filtros». |
| **Reglas de negocio** | - El historial es inmutable; los eventos no pueden eliminarse, sólo añadirse.<br>- Todos los tipos de evento (salud, vacunación, producción, alimentación, reproducción) aparecen en la misma línea de tiempo.<br>- El historial incluye el usuario responsable de cada evento. |

---

### CU-012 — Registrar alimentación del animal

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF014 — Control de alimentación del animal |
| **Objetivo** | Registrar el suministro de alimento de un animal, vinculando el consumo con el stock de bodega y el historial del animal. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- El animal existe con estado Activo.<br>- El insumo de alimento a registrar existe en el inventario de bodega con stock disponible. |
| **Postcondiciones** | - Se crea un evento de alimentación en el historial del animal.<br>- El stock del insumo consumido se reduce en la bodega (CU-022 Descontar stock).<br>- Se registra auditoría con usuario y timestamp. |
| **Flujo principal** | 1. El usuario accede a la ficha del animal y selecciona «Registrar alimentación».<br>2. El sistema presenta el formulario: insumo (buscador de alimentos de bodega), cantidad suministrada, unidad de medida y fecha/hora.<br>3. El usuario selecciona el insumo del buscador (el sistema muestra el stock disponible de cada alimento).<br>4. El usuario ingresa la cantidad y confirma la fecha/hora (por defecto: ahora).<br>5. El sistema valida que la cantidad no supere el stock disponible del insumo.<br>6. El usuario confirma el registro.<br>7. El sistema registra el evento en el historial del animal y descuenta el stock del insumo en bodega. |
| **Flujos alternativos** | **FA1:** Registro masivo (mismo alimento a varios animales)<br>a. El usuario accede al módulo de insumos y usa la opción «Distribuir alimento».<br>b. Selecciona el insumo, la cantidad por animal y los animales destino.<br>c. El sistema registra el evento de alimentación en cada animal y descuenta el total del stock. |
| **Flujos de excepción** | **FE1:** Stock insuficiente (paso 5)<br>a. El sistema muestra la alerta: «Stock insuficiente. Disponible: X [unidad]. Solicitado: Y [unidad]».<br>b. El flujo regresa al paso 4 para ajustar la cantidad. |
| **Reglas de negocio** | - La cantidad mínima registrable es 0.01 unidades.<br>- El descuento de stock en bodega es automático e inmediato al confirmar el registro.<br>- Si el stock llega a 0 o al mínimo configurado, se dispara la alerta de RF028. |

---

### CU-013 — Gestionar esquema de vacunación

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF015 — Esquema de vacunación del animal |
| **Objetivo** | Registrar y hacer seguimiento al esquema completo de vacunación de un animal, con alertas de próximas dosis. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- El animal existe con estado Activo. |
| **Postcondiciones** | - El evento de vacunación queda registrado en el historial del animal.<br>- El estado del esquema de vacunación es actualizado (al día / pendiente / vencido).<br>- Se programa la alerta para la próxima dosis si aplica. |
| **Flujo principal** | 1. El usuario accede a la ficha del animal y selecciona la pestaña «Vacunación».<br>2. El sistema muestra el esquema de vacunación del animal: lista de vacunas aplicadas (tipo, dosis, fecha, responsable) y vacunas pendientes con su fecha estimada.<br>3. El usuario selecciona «Registrar vacuna».<br>4. El sistema presenta el formulario: tipo de vacuna, número de dosis, fecha de aplicación, responsable (veterinario u operario), lote del medicamento y fecha de la próxima dosis.<br>5. El usuario completa el formulario.<br>6. El sistema valida los datos y actualiza el estado de cumplimiento del esquema.<br>7. El usuario confirma.<br>8. El sistema persiste el registro, actualiza el indicador de estado de vacunación y programa la alerta para la próxima dosis. |
| **Flujos alternativos** | **FA1:** Vacunar múltiples animales del mismo lote (paso 3)<br>a. El usuario accede a la vista de lote o especie y selecciona «Vacunación masiva».<br>b. Completa el formulario una sola vez y selecciona los animales destino.<br>c. El sistema replica el registro de vacunación en cada animal seleccionado. |
| **Flujos de excepción** | **FE1:** Fecha de aplicación futura (paso 6)<br>a. El sistema muestra advertencia: «La fecha de aplicación no puede ser futura».<br>b. El flujo regresa al paso 5. |
| **Reglas de negocio** | - El estado del esquema de vacunación tiene tres valores: Al día (todas las dosis al corriente), Pendiente (próxima dosis en menos de 7 días), Vencido (dosis no aplicada pasada la fecha).<br>- El sistema genera alerta visible 7 días antes de cada dosis programada.<br>- La vacuna queda vinculada al medicamento del inventario de bodega si se especifica el lote. |

---

### CU-014 — Registrar enfermedad o incidente de salud

| **Módulo** | M2 — Inventario Pecuario |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF016 — Registro de enfermedades e incidentes de salud |
| **Objetivo** | Documentar un evento de enfermedad o incidente de salud de un animal, incluyendo diagnóstico, tratamiento y estado de recuperación. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- El animal existe en el sistema. |
| **Postcondiciones** | - El evento de salud queda registrado en el historial del animal.<br>- El estado de salud del animal se actualiza si corresponde.<br>- Se genera auditoría del registro. |
| **Flujo principal** | 1. El usuario accede a la ficha del animal y selecciona «Registrar evento de salud».<br>2. El sistema presenta el formulario: tipo de evento (enfermedad / accidente / lesión / otro), fecha de detección, descripción del evento, diagnóstico (texto libre), tratamiento aplicado, medicamento(s) usado(s) (vinculado a bodega), dosis, responsable y estado de recuperación (en tratamiento / recuperado / crónico / fallecido).<br>3. El usuario completa los campos pertinentes.<br>4. El sistema valida los campos obligatorios.<br>5. El usuario confirma el registro.<br>6. El sistema persiste el evento, actualiza el estado de salud del animal y, si se usaron medicamentos de bodega, invoca el descuento de stock. |
| **Flujos alternativos** | **FA1:** Estado de recuperación = Fallecido (paso 3)<br>a. El sistema solicita confirmación adicional.<br>b. Al confirmar, el animal es marcado como «Inactivo/Egresado» por causa «Muerte» y se excluye del inventario activo. |
| **Flujos de excepción** | **FE1:** Medicamento seleccionado sin stock (paso 6)<br>a. El sistema alerta: «El medicamento seleccionado no tiene stock suficiente en bodega».<br>b. El usuario puede continuar el registro sin descontar stock (dejando nota manual) o ajustar la cantidad. |
| **Reglas de negocio** | - El estado de recuperación «Fallecido» activa automáticamente el egreso del animal.<br>- Todos los medicamentos usados en el tratamiento deben estar vinculados al inventario de bodega para garantizar trazabilidad.<br>- El registro de incidente es inmutable una vez confirmado; para correcciones se agrega un nuevo evento de tipo «Corrección». |

---

## 6. Casos de Uso — M3 — Reproductivo / Crías

Cubre OE2 (reproducción). Registra los eventos del proceso reproductivo (monta, gestación, parto) y el nacimiento de crías, incorporando automáticamente cada nueva cría al inventario pecuario.

**Casos de uso incluidos:**
- CU-015 — Registrar evento reproductivo
- CU-016 — Registrar nacimiento de cría

---

### CU-015 — Registrar evento reproductivo

| **Módulo** | M3 — Reproductivo / Crías |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF017 — Registro del proceso reproductivo |
| **Objetivo** | Documentar los eventos del proceso reproductivo de un animal (monta, inseminación, gestación y parto esperado) para mantener la trazabilidad del pie de cría. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- El animal hembra existe con estado Activo y especie soporta reproducción (vaca o cerda).<br>- El animal macho progenitor (si aplica) existe en el sistema. |
| **Postcondiciones** | - El evento reproductivo queda registrado y vinculado al historial del animal.<br>- El estado reproductivo del animal hembra es actualizado.<br>- Se programa alerta para la fecha estimada de parto. |
| **Flujo principal** | 1. El usuario accede a la ficha del animal hembra y selecciona «Registrar evento reproductivo».<br>2. El sistema presenta el formulario con los campos: tipo de evento (monta natural / inseminación artificial), fecha del evento, ID del animal macho progenitor (búsqueda en inventario o texto libre si es externo), estado de gestación (en seguimiento / confirmada / fallida) y fecha estimada de parto.<br>3. El usuario completa los campos del formulario.<br>4. El sistema calcula automáticamente la fecha estimada de parto según la especie (vaca: +283 días, cerda: +114 días) si el usuario no la introduce manualmente.<br>5. El sistema valida los datos (fechas lógicas, estado coherente).<br>6. El usuario confirma el registro.<br>7. El sistema persiste el evento, actualiza el estado reproductivo del animal a «En gestación» y programa la alerta de parto. |
| **Flujos alternativos** | **FA1:** Gestación fallida / aborto (paso 3 o actualización posterior)<br>a. El usuario registra el evento con estado «Fallida» e indica la causa.<br>b. El sistema actualiza el estado reproductivo del animal a «Sin gestación activa» y cancela la alerta de parto.<br><br>**FA2:** Confirmación de gestación por diagnóstico veterinario<br>a. El usuario actualiza el evento existente cambiando el estado a «Confirmada» y puede ajustar la fecha estimada de parto.<br>b. El sistema registra la actualización en el historial del evento. |
| **Flujos de excepción** | **FE1:** Fecha de evento futura (paso 5)<br>a. El sistema advierte: «La fecha del evento reproductivo no puede ser futura».<br>b. El flujo regresa al paso 3.<br><br>**FE2:** Animal hembra con gestación activa vigente (paso 2)<br>a. El sistema muestra advertencia: «Este animal ya tiene una gestación activa registrada. ¿Desea registrar un nuevo evento de todas formas?».<br>b. Si el usuario confirma, el evento anterior se cierra automáticamente como «Fallida». |
| **Reglas de negocio** | - Sólo los animales de sexo hembra pueden tener eventos reproductivos.<br>- La fecha estimada de parto se calcula por especie si no se ingresa manualmente.<br>- El sistema genera alerta 7 días antes de la fecha estimada de parto.<br>- El progenitor macho puede ser externo (texto libre) o interno (vinculado al inventario). |

---

### CU-016 — Registrar nacimiento de cría

| **Módulo** | M3 — Reproductivo / Crías |
|------------|---------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF018 — Registro de nacimiento de crías |
| **Objetivo** | Registrar el nacimiento de una o varias crías, vincularlas a sus progenitores y agregarlas automáticamente al inventario pecuario. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- Existe un evento reproductivo activo (en gestación) para el animal madre. |
| **Postcondiciones** | - Cada cría queda registrada como nuevo animal en el inventario con su ID único.<br>- El evento reproductivo de la madre se cierra con estado «Parto exitoso».<br>- Se crea el historial inicial de cada cría con el evento de nacimiento.<br>- Se genera auditoría de los registros creados. |
| **Flujo principal** | 1. El usuario accede a la ficha de la madre o al módulo reproductivo y selecciona el evento de gestación activo.<br>2. El usuario selecciona «Registrar parto».<br>3. El sistema presenta el formulario: fecha y hora del parto, número de crías nacidas, y por cada cría: sexo, peso al nacer (kg) y estado (vivo / muerto / muerto al nacer).<br>4. El usuario completa los datos de cada cría.<br>5. El sistema valida los datos (peso mínimo 0.1 kg, número de crías ≥ 1).<br>6. El usuario confirma el registro.<br>7. El sistema crea un registro de animal nuevo en el inventario por cada cría viva, asigna ID único, vincula madre y padre, crea el historial de nacimiento y cierra el evento reproductivo de la madre.<br>8. El sistema notifica: «Parto registrado. Se han creado X animales en el inventario» con los IDs generados. |
| **Flujos alternativos** | **FA1:** Cría nacida muerta (paso 4)<br>a. El usuario marca el estado de la cría como «Muerto al nacer».<br>b. El sistema registra el evento en el historial de la madre pero NO crea un registro de animal en el inventario para esa cría.<br><br>**FA2:** Parto sin evento de gestación previo registrado<br>a. El sistema permite registrar el parto con una advertencia: «No se encontró evento de gestación activo. El registro de parto se creará sin vinculación reproductiva previa».<br>b. El usuario puede continuar o primero registrar el evento reproductivo (CU-015). |
| **Flujos de excepción** | **FE1:** Error al crear un animal en inventario (paso 7)<br>a. El sistema realiza rollback de todos los registros del parto (transacción atómica).<br>b. Muestra el error técnico y mantiene el evento de gestación abierto. |
| **Reglas de negocio** | - El registro del parto es una transacción atómica: se crean todos los registros o ninguno.<br>- Cada cría viva recibe un ID único asignado por el sistema.<br>- Las crías nacidas muertas se registran en el historial de la madre pero no en el inventario.<br>- El evento reproductivo de la madre se cierra automáticamente al registrar el parto. |

---

## 7. Casos de Uso — M4 — Insumos y Bodega

Cubre OE3 (control de insumos). Gestiona el inventario de alimentos, medicamentos y otros insumos, registrando entradas, salidas, movimientos y alertas de stock mínimo.

**Casos de uso incluidos:**
- CU-017 — Registrar insumo
- CU-018 — Consultar y categorizar inventario de insumos
- CU-019 — Buscar insumo
- CU-020 — Editar insumo
- CU-021 — Agregar stock a un insumo
- CU-022 — Descontar stock de un insumo
- CU-023 — Consultar historial de movimientos de insumos
- CU-024 — Gestionar alerta de stock mínimo

**Casos de uso eliminados (trasladados a M6):**
- ~~CU-024~~ — Generar reporte de inventario de insumos (ahora CU-026 en M6)

---

### CU-017 — Registrar insumo

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Administrador, Encargado |
| **RF asociado** | RF019 — Registro de insumos |
| **Objetivo** | Crear un nuevo insumo en el inventario de bodega con sus datos de identificación, categoría, stock inicial y fecha de vencimiento. |
| **Precondiciones** | - El usuario tiene sesión activa con rol Administrador o Encargado.<br>- La categoría del insumo existe en el sistema. |
| **Postcondiciones** | - El insumo queda registrado en el inventario de bodega.<br>- El stock inicial queda disponible para consumo.<br>- Se genera auditoría del registro. |
| **Flujo principal** | 1. El usuario accede al módulo «Insumos y Bodega» y selecciona «Registrar insumo».<br>2. El sistema presenta el formulario: nombre del insumo, categoría (alimento / medicamento / otro), unidad de medida, stock inicial, stock mínimo de alerta, precio unitario (opcional), fecha de vencimiento (obligatoria para medicamentos), proveedor (opcional) y observaciones.<br>3. El usuario completa los campos obligatorios.<br>4. El sistema valida los datos (stock inicial ≥ 0, fecha de vencimiento futura para medicamentos, nombre único por categoría).<br>5. El usuario confirma el registro.<br>6. El sistema persiste el insumo, genera el ID único del insumo y notifica el éxito. |
| **Flujos alternativos** | No aplica. |
| **Flujos de excepción** | **FE1:** Nombre de insumo ya existe en la misma categoría (paso 4)<br>a. El sistema muestra: «Ya existe un insumo con ese nombre en la categoría seleccionada».<br>b. El usuario puede ajustar el nombre o confirmar si es un insumo distinto.<br><br>**FE2:** Fecha de vencimiento pasada en medicamento (paso 4)<br>a. El sistema bloquea el registro y muestra: «No se puede registrar un medicamento vencido». |
| **Reglas de negocio** | - El stock mínimo de alerta es obligatorio para insumos de tipo «alimento».<br>- La fecha de vencimiento es obligatoria para insumos de tipo «medicamento».<br>- El ID del insumo es generado por el sistema y es inmutable. |

---

### CU-018 — Consultar y categorizar inventario de insumos

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF020 — Categorización del inventario · RF021 — Listado de artículos por categoría |
| **Objetivo** | Visualizar el inventario de insumos organizado por categorías, con indicadores de stock y alertas de nivel mínimo. |
| **Precondiciones** | - El usuario tiene sesión activa. |
| **Postcondiciones** | - El usuario visualiza el estado actual del inventario.<br>- Sin modificaciones en la base de datos. |
| **Flujo principal** | 1. El usuario accede al módulo «Insumos y Bodega».<br>2. El sistema presenta las categorías disponibles (Alimentos, Medicamentos, Otros) con el conteo de artículos y el estado general de cada una.<br>3. El usuario selecciona una categoría.<br>4. El sistema muestra la lista de insumos de esa categoría con: ID, nombre, unidad, stock actual, stock mínimo, estado (normal / bajo / agotado / próximo a vencer) y fecha de vencimiento si aplica.<br>5. Los insumos con stock bajo o próximos a vencer se resaltan visualmente con indicador de alerta.<br>6. El usuario selecciona un insumo para ver su detalle completo. |
| **Flujos alternativos** | **FA1:** Ver todos los insumos sin filtro de categoría<br>a. El usuario selecciona la vista «Todos».<br>b. El sistema lista todos los insumos con la columna categoría visible. |
| **Flujos de excepción** | **FE1:** Sin insumos registrados<br>a. El sistema muestra estado vacío con enlace a CU-017 para registrar el primer insumo. |
| **Reglas de negocio** | - Un insumo se considera «bajo» cuando su stock actual es igual o inferior al stock mínimo configurado.<br>- Un medicamento se considera «próximo a vencer» cuando su fecha de vencimiento está dentro de los próximos 30 días.<br>- Un insumo con stock = 0 se marca como «agotado» independientemente del mínimo configurado. |

---

### CU-019 — Buscar insumo

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF022 — Búsqueda de insumos |
| **Objetivo** | Localizar uno o varios insumos en el inventario aplicando filtros de búsqueda. |
| **Precondiciones** | - El usuario tiene sesión activa con acceso al módulo de Insumos. |
| **Postcondiciones** | - El sistema muestra los insumos que coinciden con la búsqueda.<br>- Sin modificaciones en la base de datos. |
| **Flujo principal** | 1. El usuario accede al módulo «Insumos y Bodega».<br>2. El sistema presenta la barra de búsqueda y el panel de filtros: nombre (texto libre), categoría, estado de stock (normal / bajo / agotado / próximo a vencer) y rango de fecha de registro.<br>3. El usuario ingresa el texto de búsqueda y/o selecciona filtros.<br>4. El sistema presenta los resultados que coinciden, indicando el número total encontrado.<br>5. El usuario selecciona un insumo del resultado para acceder a su detalle o a operaciones de movimiento. |
| **Flujos alternativos** | **FA1:** Sin resultados (paso 4)<br>a. El sistema muestra: «No se encontraron insumos con los criterios indicados» y ofrece «Limpiar filtros». |
| **Flujos de excepción** | No aplica. |
| **Reglas de negocio** | - La búsqueda de texto es insensible a mayúsculas y minúsculas.<br>- Los filtros son acumulativos (AND lógico). |

---

### CU-020 — Editar insumo

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Administrador, Encargado |
| **RF asociado** | RF023 — Confirmación de edición de insumos |
| **Objetivo** | Modificar los datos descriptivos de un insumo registrado (nombre, categoría, stock mínimo, fecha de vencimiento, etc.). |
| **Precondiciones** | - El usuario tiene sesión activa con rol Administrador o Encargado.<br>- El insumo existe en el sistema. |
| **Postcondiciones** | - Los datos del insumo quedan actualizados.<br>- Se registra el cambio en el historial de movimientos del insumo. |
| **Flujo principal** | 1. El usuario localiza el insumo (CU-018 o CU-019) y selecciona «Editar».<br>2. El sistema presenta el formulario pre-poblado con los datos actuales del insumo.<br>3. El usuario modifica los campos deseados (nombre, stock mínimo, unidad, fecha de vencimiento, proveedor, observaciones).<br>4. El usuario selecciona «Guardar».<br>5. El sistema valida los datos modificados.<br>6. El sistema muestra el resumen: «Se modificarán los siguientes campos: [lista]». Solicita confirmación.<br>7. El usuario confirma.<br>8. El sistema persiste los cambios y registra la modificación en el historial del insumo. |
| **Flujos alternativos** | **FA1:** Cancelar edición (paso 6)<br>a. El usuario cancela. El sistema descarta cambios y muestra los datos originales. |
| **Flujos de excepción** | **FE1:** Datos inválidos (paso 5)<br>a. El sistema resalta los campos con error y regresa al paso 3. |
| **Reglas de negocio** | - El ID del insumo es inmutable.<br>- La categoría sólo puede cambiarla el Administrador.<br>- Los cambios de datos descriptivos no modifican el stock actual. |

---

### CU-021 — Agregar stock a un insumo

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Administrador, Encargado |
| **RF asociado** | RF024 — Adición de stock |
| **Objetivo** | Registrar el ingreso de unidades a un insumo existente en bodega, actualizando el stock en tiempo real. |
| **Precondiciones** | - El usuario tiene sesión activa con rol Administrador o Encargado.<br>- El insumo existe en el sistema. |
| **Postcondiciones** | - El stock del insumo aumenta en la cantidad ingresada.<br>- Se registra el movimiento de entrada en el historial del insumo.<br>- Se genera auditoría con usuario, cantidad y timestamp. |
| **Flujo principal** | 1. El usuario localiza el insumo y selecciona «Agregar stock».<br>2. El sistema presenta el formulario: cantidad a agregar, unidad (heredada del insumo), fecha de ingreso (por defecto: hoy), número de factura o remisión (opcional), proveedor (opcional) y nueva fecha de vencimiento si aplica.<br>3. El usuario completa los campos y confirma.<br>4. El sistema valida que la cantidad sea mayor a 0.<br>5. El usuario confirma la operación.<br>6. El sistema incrementa el stock, registra el movimiento de entrada en el historial y notifica el nuevo saldo. |
| **Flujos alternativos** | No aplica. |
| **Flujos de excepción** | **FE1:** Cantidad ingresada ≤ 0 (paso 4)<br>a. El sistema muestra: «La cantidad debe ser mayor a cero» y regresa al paso 3. |
| **Reglas de negocio** | - Cada ingreso de stock genera un registro de movimiento independiente en el historial.<br>- Si el insumo tiene fecha de vencimiento, al agregar nuevo lote puede actualizarse la fecha de vencimiento (toma la más reciente o la más próxima según configuración). |

---

### CU-022 — Descontar stock de un insumo

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF025 — Descuento de stock |
| **Objetivo** | Registrar el consumo o salida de unidades de un insumo, manteniendo la trazabilidad del uso de los recursos. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- El insumo existe con stock > 0. |
| **Postcondiciones** | - El stock del insumo disminuye en la cantidad consumida.<br>- Se registra el movimiento de salida en el historial del insumo.<br>- Si el stock resultante ≤ stock mínimo, se genera alerta visible. |
| **Flujo principal** | 1. El usuario localiza el insumo y selecciona «Descontar stock».<br>2. El sistema muestra el formulario: cantidad a descontar, motivo de salida (consumo animal / tratamiento veterinario / vencido / pérdida / otro), animal o lote asociado (opcional), fecha (por defecto: hoy) y observaciones.<br>3. El usuario completa los campos.<br>4. El sistema valida que la cantidad no supere el stock disponible.<br>5. El usuario confirma la operación.<br>6. El sistema descuenta el stock, registra el movimiento de salida y evalúa si el nuevo saldo activa la alerta de stock mínimo. |
| **Flujos alternativos** | **FA1:** Descuento automático por alimentación (invocado desde CU-012)<br>a. El descuento se registra con motivo «consumo animal» y el ID del animal referenciado automáticamente. |
| **Flujos de excepción** | **FE1:** Cantidad solicitada supera el stock disponible (paso 4)<br>a. El sistema muestra: «Stock insuficiente. Disponible: X [unidad]».<br>b. El usuario puede ajustar la cantidad o cancelar.<br><br>**FE2:** Stock resultante ≤ stock mínimo (paso 6)<br>a. El sistema muestra la alerta visual: «Stock bajo — Insumo: [nombre]. Disponible: X [unidad]. Mínimo: Y [unidad]». |
| **Reglas de negocio** | - No se puede descontar más unidades de las que hay en stock.<br>- El motivo de salida es obligatorio.<br>- El descuento es inmediato e irreversible; para correcciones se registra un movimiento de ajuste. |

---

### CU-023 — Consultar historial de movimientos de insumos

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF026 — Historial de movimientos de insumos |
| **Objetivo** | Visualizar todos los movimientos (entradas, salidas y ajustes) de un insumo o del inventario completo. |
| **Precondiciones** | - El usuario tiene sesión activa. |
| **Postcondiciones** | - El usuario visualiza el historial de movimientos filtrado.<br>- Sin modificaciones en la base de datos. |
| **Flujo principal** | 1. El usuario accede al módulo «Insumos y Bodega» y selecciona «Historial de movimientos».<br>2. El sistema presenta el historial general con columnas: fecha, insumo, tipo de movimiento (entrada / salida / ajuste), cantidad, motivo, usuario responsable y saldo resultante.<br>3. El usuario puede filtrar por: insumo, categoría, tipo de movimiento, rango de fechas y usuario.<br>4. El sistema actualiza el listado con los movimientos que coinciden.<br>5. El usuario puede seleccionar un movimiento para ver su detalle completo. |
| **Flujos alternativos** | **FA1:** Ver historial de un insumo específico<br>a. El usuario accede desde la ficha de un insumo a su pestaña «Historial».<br>b. El sistema muestra sólo los movimientos de ese insumo en orden cronológico descendente. |
| **Flujos de excepción** | **FE1:** Sin movimientos en el período filtrado<br>a. El sistema muestra: «No se encontraron movimientos con los filtros aplicados» y ofrece «Limpiar filtros». |
| **Reglas de negocio** | - El historial de movimientos es inmutable; los registros no pueden eliminarse.<br>- El saldo mostrado en cada línea refleja el stock tras ese movimiento. |

---

### CU-024 — Gestionar alerta de stock mínimo

| **Módulo** | M4 — Insumos y Bodega |
|------------|------------------------|
| **Actor(es)** | Sistema (automático) · Administrador, Encargado (revisión) |
| **RF asociado** | RF028 — Alerta de stock mínimo de alimentos |
| **Objetivo** | Generar y gestionar alertas automáticas cuando el stock de un insumo desciende al nivel mínimo configurado. |
| **Precondiciones** | - El insumo tiene configurado un stock mínimo mayor a 0.<br>- El stock actual del insumo cae al nivel mínimo o por debajo. |
| **Postcondiciones** | - Se genera una alerta visible en el panel del módulo de Insumos.<br>- El Encargado o Administrador puede marcar la alerta como «atendida». |
| **Flujo principal** | 1. El sistema evalúa el stock de cada insumo en tiempo real tras cada movimiento de salida.<br>2. Al detectar que el stock ≤ stock mínimo, el sistema genera una alerta con: nombre del insumo, stock actual, stock mínimo y categoría.<br>3. La alerta aparece como notificación en el panel principal y en el módulo de Insumos con indicador visual rojo.<br>4. El Encargado o Administrador revisa la alerta y toma acción (registra una compra usando CU-021 para agregar stock).<br>5. El usuario marca la alerta como «atendida» con una nota de la acción tomada.<br>6. El sistema cierra la alerta y la registra en el historial de alertas. |
| **Flujos alternativos** | **FA1:** Insumo agotado (stock = 0)<br>a. La alerta se marca con nivel «Crítico» y se resalta en rojo intenso para mayor visibilidad. |
| **Flujos de excepción** | **FE1:** El stock mínimo no está configurado para el insumo<br>a. El sistema no genera alerta. Recomienda configurar el stock mínimo al editar el insumo. |
| **Reglas de negocio** | - Las alertas de stock son acumulativas; no se descarta una hasta que el usuario la atiende.<br>- El historial de alertas es consultable para análisis de patrones de consumo.<br>- Una alerta se cierra automáticamente si el stock supera el mínimo por una nueva entrada de stock. |

---

## 8. Casos de Uso — M5 — Producción

Cubre OE4 (producción). Registra la producción diaria de leche y huevos.

**Casos de uso incluidos:**
- CU-025 — Registrar producción de leche y huevos

**Casos de uso eliminados (trasladados a M6):**
- ~~CU-027~~ — Generar reporte de producción (ahora CU-027 en M6)

---

### CU-025 — Registrar producción de leche y huevos

| **Módulo** | M5 — Producción |
|------------|-----------------|
| **Actor(es)** | Administrador, Encargado, Empleado |
| **RF asociado** | RF029 — Registro de producción de leche y huevos |
| **Objetivo** | Registrar la producción diaria de leche por vaca y de huevos por lote de gallinas, vinculando cada registro al animal o lote y a la fecha de recolección. |
| **Precondiciones** | - El usuario tiene sesión activa.<br>- Existen animales productivos activos: vacas (leche) o gallinas (huevos). |
| **Postcondiciones** | - El registro de producción queda persistido y vinculado al animal/lote y a la fecha.<br>- El evento de producción aparece en el historial del animal.<br>- Los datos quedan disponibles para el reporte de producción. |
| **Flujo principal** | 1. El usuario accede al módulo «Producción» y selecciona «Registrar producción».<br>2. El sistema solicita el tipo de producción: Leche o Huevos.<br>3. Para Leche: el sistema presenta el formulario con: animal (buscador de vacas activas), fecha de recolección, cantidad en litros y turno (mañana / tarde / noche).<br>4. Para Huevos: el sistema presenta el formulario con: lote de gallinas, fecha de recolección, cantidad de huevos (unidades), huevos rotos/descartados (opcional).<br>5. El usuario completa los campos del formulario.<br>6. El sistema valida los datos (cantidad > 0, fecha no futura).<br>7. El usuario confirma el registro.<br>8. El sistema persiste el registro y lo vincula al historial del animal/lote. |
| **Flujos alternativos** | **FA1:** Registro de leche para múltiples vacas en el mismo turno<br>a. El usuario selecciona la vista «Registro masivo».<br>b. El sistema muestra la lista de vacas activas con un campo de cantidad por cada una.<br>c. El usuario llena las cantidades y confirma. El sistema registra una entrada por cada vaca con datos. |
| **Flujos de excepción** | **FE1:** Producción duplicada en el mismo turno/fecha para el mismo animal (paso 6)<br>a. El sistema advierte: «Ya existe un registro de producción para este animal en este turno y fecha. ¿Desea actualizar el existente o agregar uno nuevo?».<br><br>**FE2:** Cantidad = 0 (paso 6)<br>a. El sistema advierte: «La producción registrada es 0. ¿Confirma que el animal no produjo en este turno?».<br>b. El usuario puede confirmar (se registra la ausencia de producción) o cancelar. |
| **Reglas de negocio** | - La unidad para leche es litros; para huevos es unidades.<br>- La fecha de recolección no puede ser futura.<br>- Registrar producción = 0 es válido (ausencia de producción documentada).<br>- La producción queda vinculada al historial del animal para trazabilidad individual. |

---

## 9. Casos de Uso — M6 — Reportes

Módulo transversal que centraliza la generación, personalización y descarga de reportes y análisis de datos para todos los módulos del sistema. Este módulo permite a los usuarios visualizar, filtrar, descargar y editar configuraciones de reportes, facilitando la toma de decisiones basada en datos históricos y tendencias.

**Casos de uso incluidos:**
- CU-026 — Generar reporte de inventario de insumos (trasladado desde M4)
- CU-027 — Generar reporte de producción (trasladado desde M5)
- CU-028 — Gestionar reportes del sistema (nuevo)

**Correcciones aplicadas:**
- Se crea este nuevo módulo para agrupar todos los casos de uso relacionados con reportes.
- Se trasladan CU-024 (reporte de insumos) y CU-027 (reporte de producción) desde M4 y M5 respectivamente.
- Se fusionan funcionalidades de reporte en CU-028 con capacidades de personalización y descarga.

---

### CU-026 — Generar reporte de inventario de insumos

| **Módulo** | M6 — Reportes |
|------------|---------------|
| **Actor(es)** | Administrador, Encargado |
| **RF asociado** | RF027 — Reporte de inventario de insumos |
| **Objetivo** | Generar reportes del estado del inventario de insumos con cantidades disponibles, consumos por período, artículos próximos a vencer y tendencias de uso por categoría, con opciones de descarga y personalización. |
| **Precondiciones** | - El usuario tiene sesión activa con rol Administrador o Encargado.<br>- Existe al menos un insumo registrado. |
| **Postcondiciones** | - Se genera y presenta el reporte con los datos del período indicado.<br>- El reporte puede exportarse en formato PDF, Excel o CSV.<br>- Sin modificaciones en los datos del sistema. |
| **Flujo principal** | 1. El usuario accede al módulo «Reportes» y selecciona «Reporte de inventario de insumos».<br>2. El sistema presenta las opciones de reporte: tipo (inventario actual / consumos por período / artículos próximos a vencer / tendencias) y parámetros (rango de fechas, categoría, insumo específico, formato de salida).<br>3. El usuario selecciona el tipo de reporte y configura los parámetros.<br>4. El usuario selecciona «Generar reporte».<br>5. El sistema procesa los datos y presenta el reporte en pantalla con tablas y gráficas de tendencia.<br>6. El usuario puede exportar el reporte seleccionando el formato (PDF / Excel / CSV).<br>7. El sistema genera el archivo descargable con metadatos de generación (fecha, usuario, filtros aplicados). |
| **Flujos alternativos** | **FA1:** Personalizar columnas y filtros (paso 2)<br>a. El usuario selecciona «Personalizar» y elige las columnas a mostrar, el orden de los datos y los filtros predefinidos.<br>b. Los cambios pueden guardarse como plantilla reutilizable. |
| **Flujos de excepción** | **FE1:** Sin datos en el período seleccionado (paso 5)<br>a. El sistema muestra: «No hay movimientos registrados en el período indicado».<br><br>**FE2:** Error en la exportación (paso 6)<br>a. El sistema muestra el error y ofrece reintentar. |
| **Reglas de negocio** | - Los reportes son sólo de consulta; no modifican datos del sistema.<br>- El reporte de «próximos a vencer» incluye insumos con vencimiento en los próximos 30 días.<br>- La descarga incluye metadatos como fecha de generación, usuario que lo solicitó y filtros aplicados. |

---

### CU-027 — Generar reporte de producción

| **Módulo** | M6 — Reportes |
|------------|---------------|
| **Actor(es)** | Administrador, Encargado |
| **RF asociado** | RF030 — Reporte de producción |
| **Objetivo** | Generar reportes de producción en vista diaria y en vista histórica de tendencias, con indicadores clave de rendimiento, opciones de descarga y personalización. |
| **Precondiciones** | - El usuario tiene sesión activa con rol Administrador o Encargado.<br>- Existen registros de producción en el sistema. |
| **Postcondiciones** | - El reporte se genera y presenta en pantalla.<br>- El usuario puede exportarlo en PDF, Excel o CSV.<br>- Sin modificaciones en los datos del sistema. |
| **Flujo principal** | 1. El usuario accede al módulo «Reportes» y selecciona «Reporte de producción».<br>2. El sistema presenta dos pestañas: «Reporte diario» y «Reporte histórico».<br>3. Vista Reporte diario: el usuario selecciona la fecha y el tipo de producción (leche / huevos / ambos). El sistema muestra: total de leche en litros del día, total de huevos del día, detalle por animal/lote y comparativo con el día anterior.<br>4. Vista Reporte histórico: el usuario define el rango de fechas, el tipo de producción y la granularidad (diaria / semanal / mensual). El sistema muestra: gráfica de tendencia, tabla con producción por período, promedio diario, máximo y mínimo del período y desviación respecto al período anterior.<br>5. El usuario puede filtrar por animal específico o lote, y personalizar las columnas mostradas.<br>6. El usuario selecciona el formato de exportación (PDF / Excel / CSV) y descarga el reporte. |
| **Flujos alternativos** | **FA1:** Filtrar por animal específico (paso 4)<br>a. El usuario activa el filtro de animal y selecciona una vaca o un lote de gallinas.<br>b. El sistema muestra el reporte histórico sólo para ese animal/lote. |
| **Flujos de excepción** | **FE1:** Sin registros en el período seleccionado<br>a. El sistema muestra: «No hay registros de producción en el período indicado».<br><br>**FE2:** Error en la exportación<br>a. El sistema notifica el error y ofrece reintentar. |
| **Reglas de negocio** | - Los KPI incluyen: producción total, promedio diario, máximo y mínimo del período.<br>- El reporte histórico permite granularidad diaria, semanal o mensual.<br>- Los reportes son de sólo lectura y no modifican datos.<br>- El comparativo del reporte diario siempre toma como referencia el mismo día de la semana anterior.<br>- La descarga incluye metadatos de generación. |

---

### CU-028 — Gestionar reportes del sistema

| **Módulo** | M6 — Reportes |
|------------|---------------|
| **Actor(es)** | Administrador, Encargado |
| **RF asociado** | RF031 — Reporte general del sistema · RF032 — Edición y personalización de reportes · RF033 — Descarga de reportes |
| **Objetivo** | Generar reportes consolidados que integren información de todos los módulos, con capacidad de personalización, edición de plantillas y descarga en múltiples formatos. |
| **Precondiciones** | - El usuario tiene sesión activa con rol Administrador o Encargado.<br>- Existen datos en al menos un módulo del sistema. |
| **Postcondiciones** | - Se genera el reporte consolidado con los datos solicitados.<br>- El usuario puede descargarlo en el formato seleccionado.<br>- Las plantillas personalizadas quedan guardadas para uso futuro. |
| **Flujo principal** | 1. El usuario accede al módulo «Reportes» y selecciona «Reporte general del sistema».<br>2. El sistema presenta el panel de configuración del reporte con: período de análisis (fechas), módulos a incluir (Inventario Pecuario / Salud / Reproducción / Insumos / Producción), indicadores a mostrar (KPI) y formato de salida.<br>3. El usuario selecciona los módulos, define el período y elige los indicadores deseados.<br>4. El usuario puede cargar una plantilla guardada previamente o crear una nueva configuración.<br>5. El usuario selecciona «Generar reporte».<br>6. El sistema consolida los datos de los módulos seleccionados y presenta el resumen ejecutivo del estado actual de la granja.<br>7. El reporte muestra: total de animales por especie, estado de salud general, resumen de vacunación, estado reproductivo, stock de insumos críticos y producción acumulada del período.<br>8. El usuario puede editar la configuración en vivo (añadir/quitar columnas, cambiar orden, aplicar filtros adicionales) y guardar los cambios como una nueva plantilla.<br>9. El usuario selecciona el formato de descarga (PDF / Excel / CSV) y descarga el reporte. |
| **Flujos alternativos** | **FA1:** Guardar plantilla (paso 8)<br>a. El usuario selecciona «Guardar como plantilla».<br>b. El sistema solicita un nombre para la plantilla y la persiste asociada al usuario.<br>c. La plantilla queda disponible en futuras sesiones.<br><br>**FA2:** Editar plantilla existente (paso 4)<br>a. El usuario carga una plantilla guardada.<br>b. El sistema aplica la configuración de la plantilla.<br>c. El usuario puede modificar la configuración y guardar los cambios. |
| **Flujos de excepción** | **FE1:** Sin datos en los módulos seleccionados (paso 6)<br>a. El sistema muestra: «No hay datos disponibles en los módulos seleccionados para el período indicado».<br><br>**FE2:** Error al guardar plantilla (paso 8)<br>a. El sistema muestra el error y ofrece reintentar. |
| **Reglas de negocio** | - El reporte general es una vista consolidada de sólo lectura.<br>- Las plantillas son personales del usuario; los Administradores pueden compartir plantillas con otros usuarios.<br>- La descarga incluye metadatos completos: fecha de generación, usuario, filtros aplicados y módulos incluidos.<br>- El formato CSV sólo está disponible para datos tabulares (sin gráficos).<br>- Los usuarios con rol Empleado pueden visualizar y descargar reportes predefinidos, pero no pueden editar configuraciones ni guardar plantillas. |

---

## 10. Matriz de Trazabilidad RF ↔ CU

La siguiente tabla garantiza que todos los requerimientos funcionales de la versión 2.0 están cubiertos por al menos un caso de uso en este documento.

| **RF** | **Nombre RF** | **CU(s) que lo implementan** |
|--------|---------------|-------------------------------|
| **RF001** | Registro de personal | CU-001 |
| **RF002** | Inicio de sesión | CU-002 |
| **RF003** | Recuperación de contraseña | CU-003 |
| **RF004** | Gestión de perfil de usuario | CU-004 |
| **RF005** | Control de roles y permisos | CU-005 |
| **RF006** | Confirmación de cierre de sesión | CU-006 |
| **RF007** | Registro de animal | CU-007 |
| **RF008** | Visualización y consulta del inventario | CU-008 |
| **RF009** | Actualización de datos del animal | CU-009 |
| **RF010** | Búsqueda y filtrado de animales | CU-010 |
| **RF011** | Confirmación de actualización de datos | CU-009 (paso 6) |
| **RF012** | Historial integral del animal | CU-011 |
| **RF013** | Búsqueda en historial del animal | CU-011 (FA1 y FA2) |
| **RF014** | Control de alimentación del animal | CU-012 |
| **RF015** | Esquema de vacunación del animal | CU-013 |
| **RF016** | Registro de enfermedades e incidentes | CU-014 |
| **RF017** | Registro del proceso reproductivo | CU-015 |
| **RF018** | Registro de nacimiento de crías | CU-016 |
| **RF019** | Registro de insumos | CU-017 |
| **RF020** | Categorización del inventario | CU-018 |
| **RF021** | Listado de artículos por categoría | CU-018 (paso 4) |
| **RF022** | Búsqueda de insumos | CU-019 |
| **RF023** | Confirmación de edición de insumos | CU-020 (paso 6) |
| **RF024** | Adición de stock | CU-021 |
| **RF025** | Descuento de stock | CU-022 |
| **RF026** | Historial de movimientos de insumos | CU-023 |
| **RF027** | Reporte de inventario de insumos | **CU-026** (en M6) |
| **RF028** | Alerta de stock mínimo | CU-024 |
| **RF029** | Registro de producción de leche y huevos | CU-025 |
| **RF030** | Reporte de producción | **CU-027** (en M6) |
| **RF031** | Reporte general del sistema | **CU-028** (en M6) |
| **RF032** | Edición y personalización de reportes | **CU-028** (en M6) |
| **RF033** | Descarga de reportes | **CU-028** (en M6) |

---

## 11. Resumen de Cambios Aplicados

| **Cambio** | **Descripción** |
|------------|-----------------|
| **Creación de M6 — Reportes** | Nuevo módulo que centraliza todos los casos de uso relacionados con reportes. |
| **Traslado de CU-024** | Movido de M4 a M6 como **CU-026** — Generar reporte de inventario de insumos. |
| **Traslado de CU-027** | Movido de M5 a M6 como **CU-027** — Generar reporte de producción. |
| **Nuevo CU-028** | Creado para gestionar reportes generales del sistema, personalización y descarga. |
| **Eliminación de CU-024 y CU-027 originales** | Eliminados de M4 y M5 respectivamente. |
| **Actualización de la tabla de resumen** | Se actualizó la lista de casos de uso para reflejar los cambios. |
| **Actualización de la matriz de trazabilidad** | Se actualizaron las referencias RF ↔ CU con los nuevos IDs. |
| **Actualización del alcance** | Se modificó la sección 1.2 para incluir M6 — Reportes. |
| **Actualización del total de CU** | Se actualizó de 27 a 28 casos de uso. |

---

**Fin del documento**