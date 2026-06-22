**SISTEMA DE INFORMACIÓN PARA LA GESTIÓN INTEGRAL**

**DE GRANJA AGROPECUARIA**

*Especificación de Requerimientos de Software*

*Versión 2.0 — Corregida y alineada con objetivos del sistema*

# **1. Objetivos del Sistema**

## **1.1 Objetivo General**

Desarrollar un sistema de información para la gestión integral de una granja agropecuaria, que permita registrar, controlar y hacer seguimiento a los procesos de crianza, salud animal y producción de vacas, cerdos y gallinas, con el fin de optimizar la toma de decisiones y los procesos pecuarios.

## **1.2 Objetivos Específicos**

**OE1 — Inventario pecuario**Registrar y hacer seguimiento al inventario de animales, documentando el ingreso, egreso y estado actual de cada individuo por especie, raza y categoría productiva.

**OE2 — Reproducción**Gestionar el proceso reproductivo de los animales, controlando los eventos de celo, monta, gestación y nacimiento de crías, con el fin de mantener la trazabilidad del pie de cría.

**OE3 — Insumos y medicamentos**Controlar el uso y consumo de insumos y medicamentos, registrando existencias, fechas de vencimiento y movimientos, para reducir pérdidas y desperdicios.

**OE4 — Producción**Monitorear la producción pecuaria registrando y consolidando datos de leche y huevos por animal y por lote, para facilitar el análisis de rendimiento productivo.

**OE5 — Salud animal**Gestionar la salud de los animales controlando el cumplimiento de esquemas de vacunación, tratamientos veterinarios y eventos sanitarios por individuo.



# **2. Mapa de Módulos y Alineación con Objetivos**

La siguiente tabla relaciona cada módulo del sistema con los objetivos específicos que cubre y los requerimientos funcionales que lo componen.

| **M1 — Trazabilidad y Usuarios**                             |
| ------------------------------------------------------------ |
| **Objetivo(s) cubierto(s):** Transversal — soporta todos los OE (autenticación, roles y auditoría)**Requerimientos:** RF001 – RF006 |

| **M2 — Inventario Pecuario**                                 |
| ------------------------------------------------------------ |
| **Objetivo(s) cubierto(s):** OE1 (inventario), OE5 (salud animal — vacunación, enfermedades)**Requerimientos:** RF007 – RF016 |

| **M3 — Reproductivo / Crías**                                |
| ------------------------------------------------------------ |
| **Objetivo(s) cubierto(s):** OE2 (reproducción y trazabilidad del pie de cría)**Requerimientos:** RF017 – RF018 |

| **M4 — Insumos y Bodega**                                    |
| ------------------------------------------------------------ |
| **Objetivo(s) cubierto(s):** OE3 (control de insumos y medicamentos)**Requerimientos:** RF019 – RF028 |

| **M5 — Producción**                                          |
| ------------------------------------------------------------ |
| **Objetivo(s) cubierto(s):** OE4 (registro y análisis de leche y huevos)**Requerimientos:** RF029 – RF031 |



# **3. Requerimientos Funcionales**

## **M1 — Trazabilidad y Usuarios**

Módulo transversal que gestiona el acceso al sistema. No está asociado a un objetivo específico de negocio, sino que brinda la infraestructura de seguridad y auditoría que soporta todos los demás módulos.

| **RF001** Registro de personal |                                                              |
| ------------------------------ | ------------------------------------------------------------ |
| **Prioridad**                  | Alta                                                         |
| **Descripción**                | Permitir el registro de datos personales de los usuarios, habilitando la creación de una cuenta única en el sistema. El proceso debe incluir validaciones de formato y unicidad (correo, usuario) y garantizar el almacenamiento seguro de la información. |
| **Objetivo(s) asociado(s)**    | Transversal — requisito previo para el acceso a todos los módulos. |
| **Relación RNF**               | RNF04 Protección de datos · RNF06 Encriptación               |

| **RF002** Inicio de sesión  |                                                              |
| --------------------------- | ------------------------------------------------------------ |
| **Prioridad**               | Alta                                                         |
| **Descripción**             | Habilitar la autenticación de usuarios mediante credenciales válidas (usuario/contraseña). El sistema debe limitar los intentos fallidos y registrar cada acceso exitoso para efectos de auditoría. |
| **Objetivo(s) asociado(s)** | Transversal.                                                 |
| **Relación RNF**            | RNF05 Control de accesos · RNF06 Encriptación                |

| **RF003** Recuperación de contraseña |                                                              |
| ------------------------------------ | ------------------------------------------------------------ |
| **Prioridad**                        | Media                                                        |
| **Descripción**                      | Proporcionar un mecanismo de recuperación de contraseña mediante el envío de un enlace de restablecimiento o código de verificación al correo registrado del usuario. |
| **Objetivo(s) asociado(s)**          | Transversal.                                                 |
| **Relación RNF**                     | RNF04 Protección de datos · RNF06 Encriptación               |

| **RF004** Gestión de perfil de usuario |                                                              |
| -------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                          | Media                                                        |
| **Descripción**                        | Permitir a cada usuario consultar y actualizar su información personal dentro del sistema, garantizando que los cambios queden registrados con fecha y hora de modificación. |
| **Objetivo(s) asociado(s)**            | Transversal.                                                 |
| **Relación RNF**                       | RNF04 Protección de datos                                    |

| **RF005** Control de roles y permisos |                                                              |
| ------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                         | Alta                                                         |
| **Descripción**                       | Gestionar tres roles de usuario: (1) Administrador, con control total del sistema incluyendo configuración, reportes y gestión de usuarios; (2) Encargado, con acceso completo a todos los módulos operativos; (3) Empleado, con acceso operativo equivalente al Encargado. La distinción entre los roles 2 y 3 radica en la trazabilidad: el sistema debe registrar explícitamente el usuario responsable de cada operación (registro de animal, producción, movimiento de insumos, etc.) para fines de auditoría y control. |
| **Objetivo(s) asociado(s)**           | Transversal — habilita la trazabilidad requerida por OE1, OE3, OE4 y OE5. |
| **Relación RNF**                      | RNF05 Control de accesos · RNF07 Continuidad operativa       |

| **RF006** Confirmación de cierre de sesión |                                                              |
| ------------------------------------------ | ------------------------------------------------------------ |
| **Prioridad**                              | Media                                                        |
| **Descripción**                            | Solicitar confirmación explícita antes de cerrar la sesión del usuario, previniendo pérdida de información no guardada y garantizando que la sesión no quede abierta sin supervisión. |
| **Objetivo(s) asociado(s)**                | Transversal.                                                 |
| **Relación RNF**                           | RNF07 Continuidad operativa                                  |



## **M2 — Inventario Pecuario**

Cubre OE1 (inventario) y OE5 (salud animal). Gestiona el ciclo de vida completo de cada animal: ingreso, seguimiento, historial clínico y vacunación.

**Corrección aplicada**El módulo se renombra de "Inventario Ganadero" a "Inventario Pecuario", dado que el término ganadero refiere exclusivamente a bovinos, mientras que pecuario abarca todas las especies del sistema (vacas, cerdos y gallinas).RF015 se amplía para cubrir esquemas de vacunación completos (OE5), no solo el estado puntual.RF014 elimina el calificativo "automatizado": el sistema registra y controla la alimentación, pero no automatiza el suministro físico.

| **RF007** Registro de animal |                                                              |
| ---------------------------- | ------------------------------------------------------------ |
| **Prioridad**                | Alta                                                         |
| **Descripción**              | Registrar los datos de ingreso de un animal (especie, raza, fecha de nacimiento o adquisición, sexo, peso inicial, estado de salud y origen), asignando un identificador único que permita su trazabilidad dentro del sistema. |
| **Objetivo(s) asociado(s)**  | OE1 — Inventario pecuario.                                   |
| **Relación RNF**             | RNF04 Protección de datos · RNF07 Continuidad operativa      |

| **RF008** Visualización y consulta del inventario |                                                              |
| ------------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                     | Alta                                                         |
| **Descripción**                                   | Mostrar el listado de animales registrados con información resumida (especie, identificador, edad, peso, estado de salud) y permitir acceder al detalle de cada uno desde la misma vista. |
| **Objetivo(s) asociado(s)**                       | OE1 — Inventario pecuario.                                   |
| **Relación RNF**                                  | RNF01 Tiempo de respuesta                                    |

| **RF009** Actualización de datos del animal |                                                              |
| ------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                               | Alta                                                         |
| **Descripción**                             | Permitir modificar los datos de un animal (peso, estado de salud, categoría productiva u otra información relevante) dejando registro de quién realizó el cambio y en qué fecha. |
| **Objetivo(s) asociado(s)**                 | OE1 — Inventario pecuario.                                   |
| **Relación RNF**                            | RNF04 Protección de datos                                    |

| **RF010** Búsqueda y filtrado de animales |                                                              |
| ----------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                             | Alta                                                         |
| **Descripción**                           | Ofrecer búsqueda y filtrado del inventario por criterios como especie, raza, edad, estado de salud o estado reproductivo, con resultados presentados en tiempo ágil. |
| **Objetivo(s) asociado(s)**               | OE1 — Inventario pecuario.                                   |
| **Relación RNF**                          | RNF01 Tiempo de respuesta                                    |

| **RF011** Confirmación de actualización de datos |                                                              |
| ------------------------------------------------ | ------------------------------------------------------------ |
| **Prioridad**                                    | Media                                                        |
| **Descripción**                                  | Solicitar confirmación explícita antes de guardar cambios en los datos de un animal, para reducir errores de modificación accidental. |
| **Objetivo(s) asociado(s)**                      | OE1 — Inventario pecuario.                                   |
| **Relación RNF**                                 | RNF08 Recuperación ante fallos                               |

| **RF012** Historial integral del animal |                                                              |
| --------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                           | Alta                                                         |
| **Descripción**                         | Mantener un historial unificado por animal que consolide, en orden cronológico, todos los eventos relacionados: salud, vacunaciones, tratamientos, producción, alimentación y proceso reproductivo. Este historial constituye la trazabilidad completa desde el ingreso o nacimiento del animal. |
| **Objetivo(s) asociado(s)**             | OE1 — Inventario pecuario · OE5 — Salud animal.              |
| **Relación RNF**                        | RNF10 Estadísticas · RNF11 Registro de incidencias           |

| **RF013** Búsqueda en el historial del animal |                                                              |
| --------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                 | Media                                                        |
| **Descripción**                               | Permitir filtrar el historial de un animal por tipo de evento (salud, producción, alimentación), rango de fechas o diagnóstico, facilitando la consulta de información específica. |
| **Objetivo(s) asociado(s)**                   | OE1 — Inventario pecuario · OE5 — Salud animal.              |
| **Relación RNF**                              | RNF01 Tiempo de respuesta                                    |

| **RF014** Control de alimentación del animal |                                                              |
| -------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                | Alta                                                         |
| **Descripción**                              | Registrar el suministro de alimento de cada animal, documentando la cantidad, el tipo de alimento y la fecha, con el fin de controlar el consumo y relacionarlo con el stock disponible en bodega. |
| **Objetivo(s) asociado(s)**                  | OE1 — Inventario pecuario · OE3 — Insumos y medicamentos.    |
| **Relación RNF**                             | RNF07 Continuidad operativa                                  |

| **RF015** Esquema de vacunación del animal |                                                              |
| ------------------------------------------ | ------------------------------------------------------------ |
| **Prioridad**                              | Alta                                                         |
| **Descripción**                            | Registrar y gestionar el esquema de vacunación de cada animal, incluyendo el tipo de vacuna, la dosis, la fecha de aplicación y la fecha de la próxima dosis. El sistema debe indicar el estado de cumplimiento del esquema (al día / pendiente / vencido) y generar alertas cuando una vacuna esté próxima a su fecha de aplicación. |
| **Objetivo(s) asociado(s)**                | OE5 — Salud animal.                                          |
| **Relación RNF**                           | RNF07 Continuidad operativa · RNF09 Tiempo de actividad      |

| **RF016** Registro de enfermedades e incidentes de salud |                                                              |
| -------------------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                            | Alta                                                         |
| **Descripción**                                          | Registrar los eventos de enfermedad o incidente de salud de un animal, incluyendo descripción del evento, fecha, diagnóstico, tratamiento aplicado y estado de recuperación, quedando todo vinculado al historial del animal. |
| **Objetivo(s) asociado(s)**                              | OE5 — Salud animal.                                          |
| **Relación RNF**                                         | RNF04 Protección de datos · RNF11 Registro de incidencias    |



## **M3 — Reproductivo / Crías**

Cubre OE2. Gestiona el ciclo reproductivo y el ingreso automático de crías al inventario.

| **RF017** Registro del proceso reproductivo |                                                              |
| ------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                               | Alta                                                         |
| **Descripción**                             | Registrar y hacer seguimiento a los eventos reproductivos de los animales: tipo de evento (monta natural o inseminación artificial), fecha, progenitores involucrados, fecha estimada de parto y estado de gestación (en curso / exitoso / fallido). |
| **Objetivo(s) asociado(s)**                 | OE2 — Reproducción.                                          |
| **Relación RNF**                            | RNF07 Continuidad operativa · RNF11 Registro de incidencias  |

| **RF018** Registro de nacimiento de crías |                                                              |
| ----------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                             | Alta                                                         |
| **Descripción**                           | Registrar el nacimiento de crías con los datos correspondientes: fecha, peso al nacer, sexo y progenitores. Una vez registrada la cría, el sistema debe incorporarla automáticamente al inventario pecuario, asignándole su identificador único. |
| **Objetivo(s) asociado(s)**               | OE2 — Reproducción · OE1 — Inventario pecuario.              |
| **Relación RNF**                          | RNF09 Tiempo de actividad · RNF04 Protección de datos        |



## **M4 — Insumos y Bodega**

Cubre OE3. Gestiona el inventario de alimentos, medicamentos y demás insumos de la finca.

**Corrección aplicada**RF019 se renombra de "Generación de insumos" a "Registro de insumos": el término generación es impreciso; se trata de crear y registrar un insumo en el sistema.Se agrega el campo de fecha de vencimiento en RF019 para alinear con OE3.

| **RF019** Registro de insumos |                                                              |
| ----------------------------- | ------------------------------------------------------------ |
| **Prioridad**                 | Alta                                                         |
| **Descripción**               | Crear y registrar un insumo en el inventario de bodega, indicando nombre, categoría (alimento, medicamento u otro), unidad de medida, stock inicial y fecha de vencimiento cuando aplique. El registro debe quedar vinculado al usuario que lo creó. |
| **Objetivo(s) asociado(s)**   | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**              | RNF09 Tiempo de actividad                                    |

| **RF020** Categorización del inventario |                                                              |
| --------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                           | Alta                                                         |
| **Descripción**                         | Organizar los insumos por categorías (alimentos para animales, medicamentos, otros insumos), permitiendo la clasificación y consulta de recursos según su tipo. |
| **Objetivo(s) asociado(s)**             | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**                        | RNF01 Tiempo de respuesta                                    |

| **RF021** Listado de artículos por categoría |                                                              |
| -------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                | Media                                                        |
| **Descripción**                              | Mostrar los artículos registrados dentro de cada categoría, con indicadores de stock actual y alertas visuales cuando el nivel sea igual o inferior al mínimo definido. |
| **Objetivo(s) asociado(s)**                  | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**                             | RNF01 Tiempo de respuesta                                    |

| **RF022** Búsqueda de insumos |                                                              |
| ----------------------------- | ------------------------------------------------------------ |
| **Prioridad**                 | Alta                                                         |
| **Descripción**               | Habilitar la búsqueda de insumos aplicando filtros por nombre, categoría, fecha de registro o estado de stock (disponible / agotado / próximo a vencer). |
| **Objetivo(s) asociado(s)**   | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**              | RNF01 Tiempo de respuesta                                    |

| **RF023** Confirmación de edición de insumos |                                                              |
| -------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                | Media                                                        |
| **Descripción**                              | Solicitar confirmación antes de guardar cambios en un insumo, reduciendo errores de modificación involuntaria en el inventario. |
| **Objetivo(s) asociado(s)**                  | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**                             | RNF08 Recuperación ante fallos                               |

| **RF024** Adición de stock  |                                                              |
| --------------------------- | ------------------------------------------------------------ |
| **Prioridad**               | Alta                                                         |
| **Descripción**             | Registrar el ingreso de unidades a un insumo existente, actualizando el stock en tiempo real y dejando constancia de la fecha, cantidad y usuario responsable del movimiento. |
| **Objetivo(s) asociado(s)** | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**            | RNF07 Continuidad operativa                                  |

| **RF025** Descuento de stock |                                                              |
| ---------------------------- | ------------------------------------------------------------ |
| **Prioridad**                | Alta                                                         |
| **Descripción**              | Registrar la salida o consumo de unidades de un insumo, actualizando el stock y preservando la trazabilidad del uso de los recursos (qué animal o actividad generó el consumo). |
| **Objetivo(s) asociado(s)**  | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**             | RNF08 Recuperación ante fallos                               |

| **RF026** Historial de movimientos de insumos |                                                              |
| --------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                 | Alta                                                         |
| **Descripción**                               | Generar un historial de movimientos por insumo que registre entradas, salidas y modificaciones, con fecha, cantidad, motivo y usuario responsable de cada operación. |
| **Objetivo(s) asociado(s)**                   | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**                              | RNF10 Estadísticas · RNF11 Registro de incidencias           |

| **RF027** Reporte de inventario de insumos |                                                              |
| ------------------------------------------ | ------------------------------------------------------------ |
| **Prioridad**                              | Media                                                        |
| **Descripción**                            | Generar reportes del estado del inventario mostrando cantidades disponibles, consumos por período, artículos próximos a vencer y tendencias de uso por categoría. |
| **Objetivo(s) asociado(s)**                | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**                           | RNF10 Estadísticas                                           |

| **RF028** Alerta de stock mínimo de alimentos |                                                              |
| --------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                 | Alta                                                         |
| **Descripción**                               | Relacionar el stock de alimentos en bodega con el consumo registrado por los animales y generar una alerta visible cuando el nivel de cualquier insumo se encuentre por debajo del umbral mínimo configurado. |
| **Objetivo(s) asociado(s)**                   | OE3 — Insumos y medicamentos.                                |
| **Relación RNF**                              | RNF09 Tiempo de actividad · RNF02 Escalabilidad              |



## **M5 — Producción**

Cubre OE4. Registra y analiza la producción diaria de leche (vacas) y huevos (gallinas).

**Corrección aplicada**RF030 y RF031 se fusionan en RF030 "Reporte de producción", eliminando la redundancia entre "acceso a reporte" y "reporte diario". Se mantiene la distinción entre vista diaria y vista de tendencias históricas dentro del mismo requerimiento.

| **RF029** Registro de producción de leche y huevos |                                                              |
| -------------------------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                                      | Alta                                                         |
| **Descripción**                                    | Permitir el registro diario de la producción de leche (por vaca, en litros) y de huevos (por lote de gallinas, en unidades), vinculando cada registro al animal o lote correspondiente y a la fecha de recolección. |
| **Objetivo(s) asociado(s)**                        | OE4 — Producción.                                            |
| **Relación RNF**                                   | RNF07 Continuidad operativa                                  |

| **RF030** Reporte de producción |                                                              |
| ------------------------------- | ------------------------------------------------------------ |
| **Prioridad**                   | Media                                                        |
| **Descripción**                 | Generar reportes de producción con dos vistas: (1) Reporte diario con el consolidado de leche y huevos producidos en la jornada, y (2) Reporte histórico con tendencias de producción por animal o lote en un rango de fechas definido por el usuario. Ambas vistas deben mostrar indicadores clave de rendimiento (KPI) de la finca. |
| **Objetivo(s) asociado(s)**     | OE4 — Producción.                                            |
| **Relación RNF**                | RNF01 Tiempo de respuesta · RNF10 Estadísticas               |



# **4. Requerimientos No Funcionales**

Los RNF establecen las restricciones de calidad bajo las cuales debe operar el sistema. Se corrige la numeración (el documento original omitía RNF10) y se añade RNF12 de Usabilidad, omitido en la versión anterior.

| **ID**    | **Categoría**      | **Nombre**                              | **Descripción**                                              |
| --------- | ------------------ | --------------------------------------- | ------------------------------------------------------------ |
| **RNF01** | **Rendimiento**    | **Tiempo de respuesta**                 | Las búsquedas, consultas y registros deben completarse en menos de 3 segundos bajo condiciones normales de uso. |
| **RNF02** | **Rendimiento**    | **Escalabilidad**                       | El sistema debe soportar el crecimiento en número de animales, usuarios e insumos sin degradación perceptible del rendimiento. |
| **RNF03** | **Rendimiento**    | **Concurrencia**                        | El sistema debe operar correctamente con múltiples usuarios simultáneos sin presentar errores de consistencia ni colapso del servicio. |
| **RNF04** | **Seguridad**      | **Protección de datos**                 | La información de usuarios, animales e historial clínico debe almacenarse de forma segura, limitando su acceso según el rol del usuario. |
| **RNF05** | **Seguridad**      | **Control de accesos**                  | El sistema debe implementar control de acceso basado en roles (RBAC), restringiendo funciones y vistas según el tipo de usuario. |
| **RNF06** | **Seguridad**      | **Encriptación de contraseñas**         | Las contraseñas deben almacenarse usando un algoritmo de hashing robusto (bcrypt o similar), nunca en texto plano. |
| **RNF07** | **Fiabilidad**     | **Continuidad operativa**               | El sistema debe garantizar que los registros y operaciones no se interrumpan de manera inesperada durante el uso normal. |
| **RNF08** | **Fiabilidad**     | **Recuperación ante fallos**            | El sistema debe implementar mecanismos de confirmación antes de operaciones críticas y contar con recuperación de datos ante fallos. |
| **RNF09** | **Disponibilidad** | **Tiempo de actividad (uptime)**        | El sistema debe garantizar un tiempo de actividad alto, minimizando las caídas del servicio y notificando al administrador ante interrupciones. |
| **RNF10** | **Sostenibilidad** | **Estadísticas e informes**             | El sistema debe generar estadísticas de uso, producción e inventario que permitan el análisis histórico y la toma de decisiones. |
| **RNF11** | **Sostenibilidad** | **Registro de incidencias (auditoría)** | Cada operación relevante (creaciones, modificaciones, eliminaciones) debe quedar registrada con usuario, fecha y hora para fines de trazabilidad y auditoría. |
| **RNF12** | **Usabilidad**     | **Interfaz intuitiva**                  | La interfaz debe ser clara, consistente y adaptable a dispositivos móviles, permitiendo que un usuario nuevo complete tareas básicas sin capacitación extensa. |

**Correcciones de numeración**El documento original omitía RNF10 (saltaba de RNF09 a RNF11). Se reindexan correctamente.Se añade RNF12 Usabilidad, categoría ausente en la versión anterior y esencial para un sistema de campo usado por granjeros y empleados con distintos niveles de experiencia.