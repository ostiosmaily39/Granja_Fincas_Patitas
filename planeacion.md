# Plan de Desarrollo: Sistema de Gestión Integral de Granja Agropecuaria

## Contexto del Proyecto
El sistema es una solución integral para la gestión completa de una granja agropecuaria. Su objetivo es llevar la trazabilidad, control y registro de operaciones relacionadas con diversas especies animales (vacas, cerdos y gallinas). El sistema contará con la capacidad de administrar el inventario pecuario, la reproducción, insumos y medicamentos, producción (leche y huevos) y la salud de los animales. El proyecto está enfocado en utilizar un stack tecnológico moderno y reactivo como **Next.js, Tailwind CSS y Supabase** (mencionado anteriormente) para garantizar un desarrollo eficiente, seguro, y escalable.

## Fases y Orden de Desarrollo

A continuación, se detalla el orden estructurado y lógico en el que desarrollaremos el sistema. El orden prioriza construir primero las bases estructurales y de dependencias, de tal manera que cada módulo funcional que se desarrolle tenga sentados sus cimientos.

### Fase 1: Configuración Base y Módulo de Trazabilidad y Usuarios (M1)
**Objetivo:** Establecer la infraestructura del proyecto y garantizar el acceso seguro y trazable de cada usuario.
1. Inicialización del proyecto con Next.js, configuración de Tailwind CSS y conexión con Supabase.
2. Diseño base de layout y tipografía/estilos globales.
3. Desarrollo del sistema de Autenticación (Login, Registro manual, etc.).
4. Implementación de Gestión de Roles de Usuario (Administrador, Encargado, Empleado).
5. Configuración de protecciones de rutas y componentes compartidos (Navegación, Sidebar, Layout responsivo).

### Fase 2: Módulo de Insumos y Bodega (M4)
**Objetivo:** Tener el catálogo de alimentos y medicamentos funcional; esto es prerrequisito para luego gestionar la alimentación y el área de salud animal.
1. Creación de la base de datos para insumos y categorías de inventario de bodega.
2. Desarrollo de la gestión de Registro de Insumos (Alta, Edición, Baja).
3. Implementación de transacciones (Puntos de entradas/salidas manuales) e historial de movimientos.
4. Lógica de generación de alertas visuales (stock mínimo configurado y fechas de vencimiento próximas).

### Fase 3: Módulo de Inventario Pecuario (M2) y Salud Animal
**Objetivo:** Registrar el núcleo del negocio (los animales) y gestionar su ciclo de vida y estado general.
1. Desarrollo del CRUD de animales categorizados por especie (vaca, cerdo, gallina).
2. Implementación de registros de eventos de salud e historiales clínicos unificados por animal.
3. Integración con el inventario (M4): Control y registro de alimentación por animal que se descuente del stock.
4. Seguimiento de esquemas de vacunación y generación de alertas de salud.

### Fase 4: Módulo Reproductivo y Crías (M3)
**Objetivo:** Seguir y gestionar los eventos reproductivos de la granja que mantienen poblada la explotación y logran la cadena de trazabilidad de los vientres/pie de cría.
1. Desarrollo de registro de inseminaciones artificiales o montas naturales.
2. Cálculo de fechas y plazos automáticos para alertas de ecografías, secados y estimaciones de partos.
3. Registro de nacimientos con derivador y vinculación de crías (ingreso automático al Inventario Pecuario).

### Fase 5: Módulo de Producción (M5)
**Objetivo:** Ingreso e historia de productos finales del proceso pecuario.
1. Creación funcional para el registro diario de producción de leche (individual por vaca) y huevos (por grupos/lote de gallinas).
2. Reportes consolidados con vistas cronológicas (diario/mensual).
3. Visualización y proyecciones usando gráficos.

### Fase 6: Auditoría, Reportes Generales y Optimización
**Objetivo:** Herramientas gerenciales, auditoría y unificación mediante analíticas.
1. Creación de un Dashboard de bienvenida gerencial (Indicadores como inventario total, animales enfermos, producción del día, etc.).
2. Panel de trazabilidad por operación y registros de auditoría transversales (qué usuario hizo qué acción y cuándo).
3. Pulido final de diseño responsivo (UI/UX) para asegurar su facilidad de uso por el personal operario en terreno.
4. Pruebas y validaciones end-to-end de todos los módulos interconectados.
