\# Documento de Requisitos: Dashboards ENCARGADO y EMPLEADO

\#\# 1\. Contexto del Proyecto  
Estamos trabajando en \*\*Granja Fincas y Patitas\*\*, un sistema de gestión ganadera con 3 roles:  
\- \*\*ADMINISTRADOR\*\* ✅ (ya implementado)  
\- \*\*ENCARGADO\*\* 🏡 (en desarrollo)  
\- \*\*EMPLEADO\*\* 👷 (en desarrollo)

\*\*Funcionalidades ya implementadas:\*\*  
\- Sistema de autenticación con roles.  
\- Componente \`CreatorBadge\` que muestra quién creó cada registro (nombre \+ rol \+ fecha).  
\- Panel de administración \`/admin/users\` para gestionar usuarios.  
\- Sistema de notificaciones para cambios de rol.

\---

\#\# 2\. Estado Actual  
Actualmente el sistema muestra:  
\- Si el usuario es \*\*ADMINISTRADOR\*\* → ve \`AdminDashboard\`  
\- Si NO es administrador → ve \`EmpleadoDashboard\` (sin importar si es ENCARGADO o EMPLEADO)

\*\*Problema a resolver:\*\* El ENCARGADO y el EMPLEADO ven lo mismo, pero deben tener permisos y vistas diferentes según su rol.

\---

\#\# 3\. Cambios Solicitados por Rol

\#\#\# A. ENCARGADO 🏡

\*\*Acceso a módulos:\*\*  
\- ✅ Animales (CRUD completo)  
\- ✅ Insumos (CRUD completo)  
\- ✅ Vacunación (CRUD completo)  
\- ✅ Producción \- Leche (CRUD completo)  
\- ✅ Producción \- Huevos (CRUD completo)  
\- ✅ Reproducción (CRUD completo)  
\- ✅ Personal (ver empleados a su cargo)  
\- ✅ Alertas (ver y gestionar alertas de su granja)  
\- ✅ Tareas (crear y asignar tareas a empleados)  
\- ❌ Auditoría (solo ADMINISTRADOR)  
\-  Gestión de usuarios (solo ADMINISTRADOR)

\*\*Permisos y Reglas de Negocio:\*\*  
\- Puede crear, editar y eliminar \*\*cualquier registro\*\* de su granja.  
\- Puede asignar tareas a empleados.  
\- Ve el \`CreatorBadge\` en todos los registros (sabe quién creó cada cosa).

\*\*Dashboard principal (EncargadoDashboard):\*\*  
\- Header con saludo y KPIs de su granja (total animales, alertas activas, producción del mes).  
\- Accesos rápidos a los módulos operativos.  
\- Lista de tareas pendientes asignadas a sus empleados.

\---

\#\#\# B. EMPLEADO 👷

\*\*Acceso a módulos:\*\*  
\- ✅ Tareas (ver sus tareas asignadas)  
\- ✅ Turnos (registrar su turno)  
\- ✅ Animales (solo lectura, pero puede crear registros propios)  
\- ✅ Insumos (solo lectura, pero puede crear registros propios)  
\- ✅ Vacunación (solo lectura, pero puede crear registros propios)  
\- ✅ Producción \- Leche (crear registros propios)  
\- ✅ Producción \- Huevos (crear registros propios)  
\- ✅ Reproducción (solo lectura)  
\- ❌ Personal (no tiene acceso)  
\- ❌ Alertas globales (solo ve las que le asignen)  
\- ❌ Auditoría  
\- ❌ Gestión de usuarios

\*\*Permisos y Reglas de Negocio:\*\*  
\- Puede \*\*crear\*\* registros nuevos (se guardan con su \`CreatorBadge\`).  
\- Puede \*\*editar/eliminar\*\* SOLO los registros que él creó (\`record.created\_by \=== user.id\`).  
\- \*\*NO puede\*\* editar/eliminar registros creados por ENCARGADO o ADMINISTRADOR.  
\- Ve el \`CreatorBadge\` en todos los registros (sabe quién creó cada cosa).

\*\*Dashboard principal (EmpleadoDashboard):\*\*  
\- Header con saludo personalizado.  
\- Card de estado de turno actual.  
\- Lista de tareas asignadas (con filtros por estado).  
\- Accesos rápidos a los módulos donde puede registrar.

\---

\#\# 4\. Implementación Técnica Requerida

\#\#\# A. Modificar \`src/app/(dashboard)/dashboard/page.tsx\`  
Cambiar la lógica de renderizado condicional para soportar los 3 roles:

\`\`\`typescript  
// Antes:  
{role \=== 'ADMINISTRADOR' ? \<AdminDashboard /\> : \<EmpleadoDashboard /\>}

// Debe quedar:  
{role \=== 'ADMINISTRADOR' && \<AdminDashboard /\>}  
{role \=== 'ENCARGADO' && \<EncargadoDashboard /\>}  
{role \=== 'EMPLEADO' && \<EmpleadoDashboard /\>}

B. Crear EncargadoDashboard.tsx  
Nuevo archivo en src/app/(dashboard)/dashboard/EncargadoDashboard.tsx. Debe incluir:  
Header con saludo y KPIs.  
Grid de 4 StatCards (Animales, Insumos Bajos, Alertas, Producción).  
Grid de 6 módulos operativos (Animales, Insumos, Vacunación, Producción, Reproducción, Personal).  
Sección de alertas del sistema.  
C. Modificar EmpleadoDashboard.tsx  
Ajustar el componente existente para limitar los accesos:  
Header con saludo personalizado.  
Card de estado de turno.  
Grid de módulos disponibles (Tareas, Turnos, Animales, Insumos, Vacunación, Producción, Reproducción).  
Eliminar/ocultar módulos de Personal, Auditoría y Alertas globales.  
D. Modificar Sidebar.tsx  
Agregar 3 arrays de navegación y la lógica de selección:

typescript

const adminNavItems: NavItem\[\] \= \[ ... \]; // (ya existe)  
const encargadoNavItems: NavItem\[\] \= \[ ... \]; // (nuevo)  
const employeeNavItems: NavItem\[\] \= \[ ... \]; // (modificar)

const navItems \= role \=== 'ADMINISTRADOR'   
  ? adminNavItems   
  : role \=== 'ENCARGADO'   
  ? encargadoNavItems   
  : employeeNavItems;

E. Implementar permisos en cada módulo (CRUD)  
En cada página (animales, insumos, etc.), agregar funciones de validación:

typescript

const canEdit \= (record: any) \=\> {  
  if (user?.role \=== 'ADMINISTRADOR' || user?.role \=== 'ENCARGADO') return true;  
  return record.created\_by \=== user?.id;  
};

const canDelete \= (record: any) \=\> {  
  if (user?.role \=== 'ADMINISTRADOR' || user?.role \=== 'ENCARGADO') return true;  
  return record.created\_by \=== user?.id;  
};

Aplicar a los botones:

\<button disabled={\!canEdit(record)}\>Editar\</button\>  
\<button disabled={\!canDelete(record)}\>Eliminar\</button\>

5\. Archivos a Modificar/Crear  
✏️ src/app/(dashboard)/dashboard/page.tsx (modificar)  
🆕 src/app/(dashboard)/dashboard/EncargadoDashboard.tsx (crear)  
✏️ src/app/(dashboard)/dashboard/EmpleadoDashboard.tsx (modificar)  
️ src/components/layout/Sidebar.tsx (modificar)  
✏️ Páginas de módulos (animales, insumos, vacunación, producción, reproducción) para agregar lógica de permisos canEdit y canDelete.

6\. Criterios de Aceptación  
ADMINISTRADOR ve su dashboard actual sin cambios.  
ENCARGADO ve su dashboard con KPIs y módulos operativos.  
EMPLEADO ve su dashboard con tareas y módulos limitados.  
El Sidebar muestra opciones diferentes según el rol.  
EMPLEADO no puede editar/eliminar registros de ENCARGADO/ADMIN.  
EMPLEADO puede editar/eliminar sus propios registros.  
El CreatorBadge se muestra en todos los registros.  
Al cambiar de rol, el usuario ve el banner de notificación.  
7\. Notas Adicionales para el Agente/Desarrollador  
Regla de oro: No romper nada de lo que ya funciona.  
Mantener el diseño visual consistente (usar las mismas clases CSS y componentes UI existentes como StatCard, Badge, etc.).  
Los KPIs del ENCARGADO pueden usar los mismos datos que el ADMIN por ahora (luego se filtrarán por granja/sede).  
El EMPLEADO debe ver un mensaje claro (toast o alerta) cuando intente editar un registro que no es suyo.

