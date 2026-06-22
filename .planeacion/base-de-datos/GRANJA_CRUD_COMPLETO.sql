-- ================================================================
-- SISTEMA DE INFORMACIÓN — GRANJA AGROPECUARIA
-- CLÁUSULAS SQL CRUD — Operaciones de datos
-- ================================================================
-- Versión  : 1.0
-- Alineado : RF v2.0 (RF001–RF030) | CU v1.0 (CU-001 a CU-027)
-- Motor    : PostgreSQL 15+ / Supabase
-- ----------------------------------------------------------------
-- CLASIFICACIÓN DE CONSULTAS
--   [S] Simple     — SELECT/INSERT/UPDATE/DELETE directo sobre una tabla
--   [A] Anidada    — Subquery en WHERE, FROM o SELECT (correlated o no)
--   [C] Compleja   — JOIN múltiple, GROUP BY, CTE, Window Function,
--                    UNION, jsonb_agg, funciones de ventana
-- ----------------------------------------------------------------
-- PARÁMETROS
--   Los valores precedidos por : son parámetros de aplicación.
--   Sustituir con $1, $2… para prepared statements en el backend.
-- ================================================================

-- ================================================================
-- CRUD M1 — TRAZABILIDAD Y USUARIOS
-- RF001–RF006 | CU-001 a CU-006
-- Clasificación: [S]=Simple [A]=Anidada [C]=Compleja
-- ================================================================

-- ----------------------------------------------------------------
-- CU-001 | RF001  REGISTRO DE USUARIO
-- ----------------------------------------------------------------

-- [S] Insertar perfil tras registro en auth.users
INSERT INTO profiles (id, full_name, role, phone, created_by)
VALUES (
  :auth_uid,          -- UUID de auth.users (Supabase lo provee)
  :full_name,
  :role,              -- 'administrador' | 'encargado' | 'empleado'
  :phone,
  :created_by_uid
);

-- [A] Verificar unicidad de correo antes de registrar
--     (auth.users gestiona el correo; esta consulta valida el full_name duplicado por rol)
SELECT EXISTS (
  SELECT 1 FROM profiles
  WHERE lower(full_name) = lower(:full_name)
    AND role = :role
    AND is_active = true
) AS nombre_duplicado_en_rol;

-- [S] Listar todos los usuarios activos (para el admin)
SELECT p.id, p.full_name, p.role, p.is_active,
       p.last_login_at, p.login_count, p.created_at
FROM   profiles p
WHERE  p.is_active = true
ORDER  BY p.role, p.full_name;

-- ----------------------------------------------------------------
-- CU-002 | RF002  INICIO DE SESIÓN — control de intentos fallidos
-- ----------------------------------------------------------------

-- [S] Leer perfil al autenticar (Supabase valida credenciales; esto carga el perfil)
SELECT id, full_name, role, is_active, locked_until, failed_attempts
FROM   profiles
WHERE  id = auth.uid();

-- [S] Incrementar contador de intentos fallidos
UPDATE profiles
SET    failed_attempts = failed_attempts + 1,
       -- Bloquear tras 5 intentos fallidos por 15 min
       locked_until = CASE
         WHEN failed_attempts + 1 >= 5 THEN now() + interval '15 minutes'
         ELSE locked_until
       END
WHERE  id = :user_id;

-- [S] Resetear conteo tras login exitoso + registrar último acceso
UPDATE profiles
SET    failed_attempts = 0,
       locked_until    = NULL,
       last_login_at   = now(),
       login_count     = login_count + 1
WHERE  id = :user_id;

-- [A] Verificar si la cuenta está activa y no bloqueada
SELECT id,
       (is_active = true AND (locked_until IS NULL OR locked_until < now())) AS puede_ingresar,
       locked_until
FROM   profiles
WHERE  id = :user_id;

-- ----------------------------------------------------------------
-- CU-003 | RF003  RECUPERACIÓN DE CONTRASEÑA
-- ----------------------------------------------------------------
-- Nota: Supabase Auth maneja el envío del enlace y el token.
-- Estas consultas verifican el estado del usuario antes de disparar el flujo.

-- [S] Verificar que el usuario existe y está activo antes de enviar correo
SELECT EXISTS (
  SELECT 1
  FROM   auth.users u
  JOIN   profiles p ON p.id = u.id
  WHERE  u.email = lower(:email)
    AND  p.is_active = true
) AS usuario_valido;

-- [S] Registrar en auditoría el evento de solicitud de recuperación
INSERT INTO audit_log (user_id, table_name, record_id, action, new_data)
SELECT p.id,
       'profiles',
       p.id::text,
       'UPDATE',
       jsonb_build_object('event', 'password_reset_requested', 'email', :email, 'ts', now())
FROM   auth.users u
JOIN   profiles p ON p.id = u.id
WHERE  u.email = lower(:email);

-- ----------------------------------------------------------------
-- CU-004 | RF004  GESTIÓN DE PERFIL — ver y actualizar datos propios
-- ----------------------------------------------------------------

-- [S] Leer perfil propio
SELECT id, full_name, role, phone, avatar_url,
       last_login_at, login_count, created_at
FROM   profiles
WHERE  id = auth.uid();

-- [S] Actualizar datos personales editables (excluye role e is_active)
UPDATE profiles
SET    full_name   = :full_name,
       phone       = :phone,
       avatar_url  = :avatar_url,
       updated_at  = now()
WHERE  id = auth.uid()
  AND  role      = (SELECT role      FROM profiles WHERE id = auth.uid())  -- inmutable
  AND  is_active = (SELECT is_active FROM profiles WHERE id = auth.uid()); -- inmutable

-- ----------------------------------------------------------------
-- CU-005 | RF005  CONTROL DE ROLES Y PERMISOS
-- ----------------------------------------------------------------

-- [S] Cambiar rol de un usuario (solo admin)
UPDATE profiles
SET    role       = :nuevo_rol,
       updated_at = now()
WHERE  id = :target_user_id
  AND  :target_user_id <> auth.uid();  -- no puede cambiar su propio rol

-- [S] Activar / desactivar usuario
UPDATE profiles
SET    is_active  = :is_active,
       updated_at = now()
WHERE  id = :target_user_id
  AND  :target_user_id <> auth.uid();  -- no puede desactivarse a sí mismo

-- [C] Validar que queda al menos un admin activo tras el cambio de rol
SELECT COUNT(*) >= 1 AS hay_admin_activo
FROM   profiles
WHERE  role      = 'administrador'
  AND  is_active = true
  AND  id        <> :target_user_id;  -- excluye al usuario que se va a modificar

-- [C] Vista de gestión de usuarios con estadísticas de actividad
SELECT
  p.id,
  p.full_name,
  p.role,
  p.is_active,
  p.last_login_at,
  p.login_count,
  p.created_at,
  -- Total de operaciones realizadas por el usuario en el sistema
  (SELECT COUNT(*) FROM audit_log al WHERE al.user_id = p.id)         AS total_operaciones,
  -- Animales registrados por este usuario
  (SELECT COUNT(*) FROM animals   a  WHERE a.registered_by = p.id)    AS animales_registrados,
  -- Insumos registrados
  (SELECT COUNT(*) FROM supplies  s  WHERE s.registered_by = p.id)    AS insumos_registrados
FROM profiles p
ORDER BY p.role, p.full_name;

-- [A] Buscar usuarios por nombre o rol (búsqueda parcial)
SELECT id, full_name, role, is_active, last_login_at
FROM   profiles
WHERE  (:search IS NULL OR full_name ILIKE '%' || :search || '%')
  AND  (:role   IS NULL OR role = :role::user_role)
ORDER  BY full_name;

-- ----------------------------------------------------------------
-- CU-006 | RF006  CIERRE DE SESIÓN — auditoría
-- ----------------------------------------------------------------

-- [S] Registrar el cierre de sesión en auditoría
INSERT INTO audit_log (user_id, table_name, record_id, action, new_data)
VALUES (
  auth.uid(),
  'profiles',
  auth.uid()::text,
  'UPDATE',
  jsonb_build_object('event', 'logout', 'ts', now())
);

-- ================================================================
-- CRUD M2 — INVENTARIO PECUARIO
-- RF007–RF016 | CU-007 a CU-014
-- ================================================================

-- ----------------------------------------------------------------
-- CU-007 | RF007  REGISTRO DE ANIMAL
-- ----------------------------------------------------------------

-- [S] Insertar animal (el trigger genera el código automáticamente)
INSERT INTO animals (
  species_id, breed_id, sex, birth_date, acquisition_date, origin,
  initial_weight_kg, current_weight_kg, health_status, mother_id,
  father_id, father_external, notes, registered_by
)
VALUES (
  :species_id, :breed_id, :sex::animal_sex, :birth_date, :acquisition_date,
  :origin::animal_origin, :peso_inicial, :peso_inicial,
  'sano', :mother_id, :father_id, :father_external, :notes, auth.uid()
)
RETURNING id, code;

-- [S] Obtener lista de especies para el selector del formulario
SELECT id, name, display_name, code_prefix,
       is_productive_milk, is_productive_eggs
FROM   species
ORDER  BY display_name;

-- [S] Obtener razas filtradas por especie
SELECT id, name
FROM   breeds
WHERE  species_id = :species_id
  AND  is_active  = true
ORDER  BY name;

-- [A] Obtener hembras activas de la misma especie como candidatas a madre
SELECT id, code, sex,
       CASE WHEN birth_date IS NOT NULL
         THEN EXTRACT(MONTH FROM age(birth_date))
       END AS edad_meses
FROM   animals
WHERE  species_id = :species_id
  AND  sex        = 'hembra'
  AND  status     = 'activo'
ORDER  BY code;

-- ----------------------------------------------------------------
-- CU-008 | RF008  CONSULTAR INVENTARIO
-- ----------------------------------------------------------------

-- [S] Listado paginado de animales activos (usa la vista)
SELECT *
FROM   vw_animal_inventory
ORDER  BY species, code
LIMIT  :page_size OFFSET (:page - 1) * :page_size;

-- [C] Ficha completa de un animal con datos relacionados
SELECT
  a.id, a.code, a.sex, a.birth_date, a.acquisition_date, a.origin,
  a.initial_weight_kg, a.current_weight_kg, a.status,
  a.health_status, a.reproductive_status, a.vaccination_status,
  a.egress_reason, a.egress_date, a.egress_notes, a.notes,
  -- Especie y raza
  s.display_name   AS especie,
  b.name           AS raza,
  -- Edad calculada
  CASE WHEN a.birth_date IS NOT NULL
    THEN EXTRACT(YEAR  FROM age(a.birth_date))::int ||'a '||
         EXTRACT(MONTH FROM age(a.birth_date))::int ||'m'
  END              AS edad,
  -- Genealogía
  am.code          AS madre_codigo,
  af.code          AS padre_codigo,
  a.father_external AS padre_externo,
  -- Quién registró
  p.full_name      AS registrado_por,
  a.created_at,
  a.updated_at
FROM   animals a
JOIN   species  s  ON s.id = a.species_id
LEFT   JOIN breeds   b  ON b.id = a.breed_id
LEFT   JOIN animals  am ON am.id = a.mother_id
LEFT   JOIN animals  af ON af.id = a.father_id
LEFT   JOIN profiles p  ON p.id  = a.registered_by
WHERE  a.id = :animal_id;

-- [C] Conteo de animales por especie y estado (resumen para dashboard)
SELECT
  s.display_name        AS especie,
  COUNT(*)              AS total,
  COUNT(*) FILTER (WHERE a.status = 'activo')                        AS activos,
  COUNT(*) FILTER (WHERE a.status = 'egresado')                      AS egresados,
  COUNT(*) FILTER (WHERE a.health_status = 'en_tratamiento')         AS en_tratamiento,
  COUNT(*) FILTER (WHERE a.vaccination_status = 'vencido')           AS vacc_vencida,
  COUNT(*) FILTER (WHERE a.reproductive_status = 'en_gestion')       AS en_gestacion,
  ROUND(AVG(a.current_weight_kg), 2)                                  AS peso_promedio_kg
FROM   animals a
JOIN   species s ON s.id = a.species_id
GROUP  BY s.display_name, s.id
ORDER  BY s.display_name;

-- ----------------------------------------------------------------
-- CU-009 | RF009 + RF011  ACTUALIZAR ANIMAL (con confirmación)
-- ----------------------------------------------------------------

-- [S] Leer datos actuales para pre-poblar formulario de edición
SELECT id, code, breed_id, sex, birth_date, acquisition_date, origin,
       current_weight_kg, health_status, notes, status,
       egress_reason, egress_date, egress_notes
FROM   animals
WHERE  id = :animal_id AND status = 'activo';

-- [S] Actualizar datos editables del animal
UPDATE animals
SET    breed_id          = COALESCE(:breed_id, breed_id),
       current_weight_kg = COALESCE(:current_weight_kg, current_weight_kg),
       health_status     = COALESCE(:health_status::health_status, health_status),
       notes             = COALESCE(:notes, notes),
       updated_at        = now()
WHERE  id = :animal_id
  AND  status = 'activo';

-- [S] Registrar egreso (venta, traslado, sacrificio)
UPDATE animals
SET    status        = 'egresado',
       egress_reason = :egress_reason::egress_reason,
       egress_date   = COALESCE(:egress_date, current_date),
       egress_notes  = :egress_notes,
       updated_at    = now()
WHERE  id = :animal_id
  AND  status = 'activo';

-- [S] Insertar evento de egreso en el historial
INSERT INTO animal_events (animal_id, event_type, event_date, title, description, metadata, performed_by)
VALUES (
  :animal_id, 'egreso', now(),
  'Egreso: ' || :egress_reason,
  :egress_notes,
  jsonb_build_object('egress_reason', :egress_reason, 'egress_date', :egress_date),
  auth.uid()
);

-- ----------------------------------------------------------------
-- CU-010 | RF010  BÚSQUEDA Y FILTRADO DE ANIMALES
-- ----------------------------------------------------------------

-- [C] Búsqueda avanzada con filtros acumulativos (AND lógico)
SELECT
  a.id, a.code,
  s.display_name  AS especie,
  b.name          AS raza,
  a.sex, a.health_status, a.vaccination_status, a.reproductive_status,
  a.current_weight_kg,
  EXTRACT(MONTH FROM age(COALESCE(a.birth_date, a.acquisition_date)))::int AS edad_meses,
  a.status
FROM   animals a
JOIN   species  s ON s.id = a.species_id
LEFT   JOIN breeds b ON b.id = a.breed_id
WHERE  (:species    IS NULL OR s.name           = :species::animal_species)
  AND  (:breed_id   IS NULL OR a.breed_id       = :breed_id)
  AND  (:sex        IS NULL OR a.sex            = :sex::animal_sex)
  AND  (:health     IS NULL OR a.health_status  = :health::health_status)
  AND  (:vacc       IS NULL OR a.vaccination_status = :vacc::vaccination_status)
  AND  (:repro      IS NULL OR a.reproductive_status= :repro::reproductive_status)
  AND  (:search     IS NULL OR a.code ILIKE '%'||:search||'%')
  AND  (:show_all   IS TRUE  OR a.status = 'activo')
ORDER  BY s.display_name, a.code
LIMIT  :page_size OFFSET (:page - 1) * :page_size;

-- [S] Contar resultados del filtro (para paginación)
SELECT COUNT(*)
FROM   animals a
JOIN   species s ON s.id = a.species_id
WHERE  (:species  IS NULL OR s.name          = :species::animal_species)
  AND  (:search   IS NULL OR a.code ILIKE '%'||:search||'%')
  AND  (:show_all IS TRUE  OR a.status = 'activo');

-- ----------------------------------------------------------------
-- CU-011 | RF012 + RF013  HISTORIAL INTEGRAL DEL ANIMAL
-- ----------------------------------------------------------------

-- [S] Historial completo de un animal (orden cronológico descendente)
SELECT
  ae.id, ae.event_type, ae.event_date,
  ae.title, ae.description, ae.metadata,
  ae.reference_id, ae.reference_table,
  p.full_name AS realizado_por
FROM   animal_events ae
LEFT   JOIN profiles p ON p.id = ae.performed_by
WHERE  ae.animal_id = :animal_id
ORDER  BY ae.event_date DESC
LIMIT  100;

-- [C] Historial filtrado por tipo de evento y rango de fechas
SELECT
  ae.id, ae.event_type, ae.event_date,
  ae.title, ae.description, ae.metadata,
  p.full_name AS realizado_por
FROM   animal_events ae
LEFT   JOIN profiles p ON p.id = ae.performed_by
WHERE  ae.animal_id = :animal_id
  AND  (:event_type IS NULL OR ae.event_type = :event_type::animal_event_type)
  AND  (:desde      IS NULL OR ae.event_date >= :desde::timestamptz)
  AND  (:hasta      IS NULL OR ae.event_date <= :hasta::timestamptz)
ORDER  BY ae.event_date DESC;

-- [A] Búsqueda de texto libre en el historial (usa pg_trgm)
SELECT ae.id, ae.event_type, ae.event_date, ae.title, ae.description
FROM   animal_events ae
WHERE  ae.animal_id = :animal_id
  AND  (ae.description ILIKE '%'||:texto||'%'
        OR ae.title     ILIKE '%'||:texto||'%')
ORDER  BY ae.event_date DESC;

-- ----------------------------------------------------------------
-- CU-012 | RF014  REGISTRO DE ALIMENTACIÓN
-- ----------------------------------------------------------------

-- [S] Registrar alimentación (llama a la función que descuenta stock)
SELECT fn_register_feeding(
  :animal_id,
  :supply_id,
  :quantity,
  :unit,
  :fed_at::timestamptz,
  :notes,
  auth.uid()
);

-- [A] Verificar stock disponible antes de registrar alimentación
SELECT su.id, su.name, su.current_stock, su.unit,
       su.current_stock >= :cantidad AS stock_suficiente
FROM   supplies su
JOIN   supply_categories sc ON sc.id = su.category_id
WHERE  su.id = :supply_id
  AND  su.is_active = true
  AND  sc.category  = 'alimento';

-- [C] Historial de alimentación de un animal con detalle de insumo
SELECT
  fr.id, fr.fed_at, fr.quantity, fr.unit,
  su.name        AS insumo,
  su.unit        AS unidad_insumo,
  sc.name        AS categoria,
  p.full_name    AS registrado_por
FROM   feeding_records fr
JOIN   supplies         su ON su.id = fr.supply_id
JOIN   supply_categories sc ON sc.id = su.category_id
LEFT   JOIN profiles     p  ON p.id  = fr.registered_by
WHERE  fr.animal_id = :animal_id
ORDER  BY fr.fed_at DESC;

-- [C] Consumo total de alimento por especie en un período (gestión de bodega)
SELECT
  s.display_name AS especie,
  su.name        AS insumo,
  SUM(fr.quantity) AS cantidad_total,
  fr.unit,
  COUNT(DISTINCT fr.animal_id) AS animales_alimentados
FROM   feeding_records fr
JOIN   animals   a  ON a.id  = fr.animal_id
JOIN   species   s  ON s.id  = a.species_id
JOIN   supplies  su ON su.id = fr.supply_id
WHERE  fr.fed_at BETWEEN :desde AND :hasta
GROUP  BY s.display_name, su.name, fr.unit
ORDER  BY s.display_name, cantidad_total DESC;

-- ----------------------------------------------------------------
-- CU-013 | RF015  ESQUEMA DE VACUNACIÓN
-- ----------------------------------------------------------------

-- [S] Insertar registro de vacunación
INSERT INTO vaccination_records (
  animal_id, vaccine_name, dose_number, applied_at,
  next_dose_date, lot_number, supply_id, responsible, notes, registered_by
)
VALUES (
  :animal_id, :vaccine_name, :dose_number, :applied_at,
  :next_dose_date, :lot_number, :supply_id, :responsible, :notes, auth.uid()
)
RETURNING id;

-- [S] Ver esquema de vacunación completo de un animal
SELECT
  vr.id, vr.vaccine_name, vr.dose_number,
  vr.applied_at, vr.next_dose_date,
  (vr.next_dose_date - current_date) AS dias_para_proxima,
  CASE
    WHEN vr.next_dose_date IS NULL         THEN 'SIN PRÓXIMA DOSIS'
    WHEN vr.next_dose_date < current_date  THEN 'VENCIDA'
    WHEN vr.next_dose_date <= current_date + 7 THEN 'URGENTE'
    ELSE 'AL DÍA'
  END                                     AS estado_dosis,
  vr.lot_number, vr.responsible,
  su.name                                 AS medicamento_bodega
FROM   vaccination_records vr
LEFT   JOIN supplies su ON su.id = vr.supply_id
WHERE  vr.animal_id = :animal_id
ORDER  BY vr.applied_at DESC;

-- [C] Animales con vacunas próximas (≤7 días) o vencidas — alerta global
SELECT * FROM vw_vaccination_alerts
WHERE  alert_level IN ('VENCIDA','URGENTE (≤7 días)')
ORDER  BY days_remaining;

-- [A] Actualizar fecha de próxima dosis de una vacuna registrada
UPDATE vaccination_records
SET    next_dose_date = :nueva_fecha
WHERE  id = :vaccination_record_id
  AND  animal_id = :animal_id;            -- doble verificación de pertenencia

-- [C] Resumen de cumplimiento de vacunación por especie
SELECT
  s.display_name                                              AS especie,
  COUNT(DISTINCT a.id)                                        AS total_animales,
  COUNT(DISTINCT a.id) FILTER (WHERE a.vaccination_status = 'al_dia')   AS al_dia,
  COUNT(DISTINCT a.id) FILTER (WHERE a.vaccination_status = 'pendiente')AS pendientes,
  COUNT(DISTINCT a.id) FILTER (WHERE a.vaccination_status = 'vencido')  AS vencidos,
  ROUND(
    100.0 * COUNT(DISTINCT a.id) FILTER (WHERE a.vaccination_status = 'al_dia')
    / NULLIF(COUNT(DISTINCT a.id), 0), 1
  )                                                           AS pct_cumplimiento
FROM   animals a
JOIN   species s ON s.id = a.species_id
WHERE  a.status = 'activo'
GROUP  BY s.display_name
ORDER  BY s.display_name;

-- ----------------------------------------------------------------
-- CU-014 | RF016  REGISTRO DE ENFERMEDADES E INCIDENTES
-- ----------------------------------------------------------------

-- [S] Insertar evento de salud
INSERT INTO health_events (
  animal_id, event_type, detected_at, description,
  diagnosis, recovery_status, notes, registered_by
)
VALUES (
  :animal_id, :event_type::health_event_type, :detected_at,
  :description, :diagnosis, :recovery_status::recovery_status,
  :notes, auth.uid()
)
RETURNING id;

-- [S] Agregar tratamiento a un evento de salud
INSERT INTO health_treatments (
  health_event_id, supply_id, medication_name,
  dose, dose_quantity, dose_unit, applied_at, responsible, notes, registered_by
)
VALUES (
  :health_event_id, :supply_id, :medication_name,
  :dose, :dose_quantity, :dose_unit, :applied_at, :responsible, :notes, auth.uid()
);

-- [S] Actualizar estado de recuperación de un evento
UPDATE health_events
SET    recovery_status = :recovery_status::recovery_status,
       resolved_at     = CASE WHEN :recovery_status IN ('recuperado','fallecido')
                              THEN COALESCE(:resolved_at, current_date)
                              ELSE NULL END,
       updated_at      = now()
WHERE  id = :health_event_id
  AND  is_correction = false;

-- [C] Historial clínico completo de un animal con tratamientos
SELECT
  he.id, he.event_type, he.detected_at, he.description,
  he.diagnosis, he.recovery_status, he.resolved_at,
  -- Tratamientos como array JSON
  jsonb_agg(
    jsonb_build_object(
      'medicamento', ht.medication_name,
      'dosis',       ht.dose,
      'cantidad',    ht.dose_quantity,
      'unidad',      ht.dose_unit,
      'fecha',       ht.applied_at,
      'responsable', ht.responsible
    )
  ) FILTER (WHERE ht.id IS NOT NULL) AS tratamientos,
  p.full_name AS registrado_por
FROM   health_events he
LEFT   JOIN health_treatments ht ON ht.health_event_id = he.id
LEFT   JOIN profiles p ON p.id = he.registered_by
WHERE  he.animal_id = :animal_id
  AND  he.is_correction = false
GROUP  BY he.id, p.full_name
ORDER  BY he.detected_at DESC;

-- [C] Enfermedades más frecuentes por especie en un período
SELECT
  s.display_name                  AS especie,
  he.event_type,
  COALESCE(he.diagnosis,'Sin diagnóstico') AS diagnostico,
  COUNT(*)                        AS frecuencia,
  COUNT(*) FILTER (WHERE he.recovery_status = 'fallecido')   AS fallecidos,
  COUNT(*) FILTER (WHERE he.recovery_status = 'recuperado')  AS recuperados,
  ROUND(AVG(he.resolved_at - he.detected_at), 1)             AS dias_recuperacion_prom
FROM   health_events he
JOIN   animals a ON a.id = he.animal_id
JOIN   species s ON s.id = a.species_id
WHERE  he.detected_at BETWEEN :desde AND :hasta
  AND  he.is_correction = false
GROUP  BY s.display_name, he.event_type, diagnostico
ORDER  BY frecuencia DESC;

-- [A] Insertar corrección de un evento de salud (evento inmutable, se agrega corrección)
INSERT INTO health_events (
  animal_id, event_type, detected_at, description,
  diagnosis, recovery_status, is_correction, corrects_id, registered_by
)
SELECT
  animal_id, event_type, detected_at,
  :nueva_descripcion, :nuevo_diagnostico, recovery_status,
  true, :health_event_id_a_corregir, auth.uid()
FROM   health_events
WHERE  id = :health_event_id_a_corregir;

-- ================================================================
-- CRUD M3 — REPRODUCTIVO / CRÍAS
-- RF017–RF018 | CU-015, CU-016
-- ================================================================

-- ----------------------------------------------------------------
-- CU-015 | RF017  REGISTRO DE EVENTO REPRODUCTIVO
-- ----------------------------------------------------------------

-- [A] Verificar que la hembra no tiene gestación activa antes de insertar
SELECT EXISTS (
  SELECT 1 FROM reproductive_events
  WHERE  female_animal_id = :animal_id
    AND  gestation_status IN ('en_seguimiento','confirmada')
) AS tiene_gestacion_activa;

-- [S] Insertar evento reproductivo
--     El trigger fn_calculate_estimated_birth calcula la fecha de parto automáticamente
INSERT INTO reproductive_events (
  female_animal_id, event_type, event_date,
  male_animal_id, male_external,
  gestation_status, estimated_birth_date, notes, registered_by
)
VALUES (
  :female_animal_id,
  :event_type::reproductive_event_type,  -- 'monta_natural' | 'inseminacion_artificial'
  :event_date,
  :male_animal_id,                        -- NULL si el padre es externo
  :male_external,                         -- NULL si el padre es interno
  'en_seguimiento',
  :estimated_birth_date,                  -- NULL → el trigger lo calcula
  :notes, auth.uid()
)
RETURNING id, estimated_birth_date;       -- devuelve la fecha calculada por trigger

-- [S] Actualizar estado de gestación (confirmar, marcar fallida)
UPDATE reproductive_events
SET    gestation_status    = :nuevo_estado::gestation_status,
       estimated_birth_date= COALESCE(:nueva_fecha_parto, estimated_birth_date),
       failure_reason      = CASE WHEN :nuevo_estado = 'fallida'
                                  THEN :failure_reason ELSE NULL END,
       updated_at          = now()
WHERE  id = :repro_event_id
  AND  female_animal_id = :animal_id;     -- doble verificación

-- [C] Ver gestaciones activas con alerta de parto inminente
SELECT * FROM vw_active_gestations
ORDER  BY days_to_birth;

-- [C] Historial reproductivo completo de una hembra
SELECT
  re.id, re.event_type, re.event_date,
  re.gestation_status, re.estimated_birth_date, re.actual_birth_date,
  re.failure_reason,
  am.code         AS padre_codigo,
  re.male_external AS padre_externo,
  -- Crías nacidas en este evento (si hubo parto)
  (SELECT COUNT(*) FROM births bi
   WHERE  bi.reproductive_event_id = re.id) AS partos,
  (SELECT SUM(total_alive) FROM births bi
   WHERE  bi.reproductive_event_id = re.id) AS crias_vivas_total,
  p.full_name     AS registrado_por,
  re.created_at
FROM   reproductive_events re
LEFT   JOIN animals  am ON am.id = re.male_animal_id
LEFT   JOIN profiles p  ON p.id  = re.registered_by
WHERE  re.female_animal_id = :animal_id
ORDER  BY re.event_date DESC;

-- [C] Indicadores reproductivos por especie en un período
SELECT
  s.display_name                                                AS especie,
  COUNT(re.id)                                                  AS total_eventos,
  COUNT(*) FILTER (WHERE re.gestation_status = 'parto_exitoso')AS partos_exitosos,
  COUNT(*) FILTER (WHERE re.gestation_status = 'fallida')      AS gestaciones_fallidas,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE re.gestation_status = 'parto_exitoso')
    / NULLIF(COUNT(*),0), 1
  )                                                             AS tasa_exito_pct,
  AVG(re.actual_birth_date - re.event_date)                    AS dias_gestacion_promedio
FROM   reproductive_events re
JOIN   animals a ON a.id = re.female_animal_id
JOIN   species s ON s.id = a.species_id
WHERE  re.event_date BETWEEN :desde AND :hasta
GROUP  BY s.display_name
ORDER  BY s.display_name;

-- ----------------------------------------------------------------
-- CU-016 | RF018  REGISTRO DE NACIMIENTO DE CRÍAS
-- ----------------------------------------------------------------

-- [S] Registrar parto completo con crías (operación atómica vía función)
--     p_offspring = '[{"sex":"hembra","weight_kg":35,"birth_status":"vivo"},...]'::jsonb
SELECT fn_register_birth(
  :reproductive_event_id,
  :mother_id,
  :birth_date,
  :p_offspring::jsonb,
  :complications,
  :notes,
  auth.uid()
);

-- [S] Consultar detalle de un parto registrado
SELECT
  bi.id, bi.birth_date, bi.birth_time,
  bi.total_born, bi.total_alive, bi.total_dead,
  bi.assistance_required, bi.complications, bi.notes,
  am.code                         AS madre_codigo,
  re.estimated_birth_date,
  p.full_name                     AS registrado_por
FROM   births bi
JOIN   animals  am ON am.id = bi.mother_id
LEFT   JOIN reproductive_events re ON re.id = bi.reproductive_event_id
LEFT   JOIN profiles p ON p.id = bi.registered_by
WHERE  bi.id = :birth_id;

-- [S] Ver crías individuales de un parto con su código de inventario
SELECT
  o.id, o.sex, o.weight_kg, o.birth_status,
  a.code          AS codigo_cria,
  a.status        AS estado_inventario,
  o.notes
FROM   offspring o
LEFT   JOIN animals a ON a.id = o.animal_id
WHERE  o.birth_id = :birth_id
ORDER  BY o.birth_status DESC, o.sex;  -- vivos primero

-- [C] Historial de partos de una madre con totales
SELECT
  bi.id, bi.birth_date,
  bi.total_born, bi.total_alive, bi.total_dead,
  -- Crías vivas aún activas en inventario
  COUNT(a.id) FILTER (WHERE a.status = 'activo')  AS crias_activas_hoy,
  bi.complications
FROM   births bi
JOIN   offspring o ON o.birth_id = bi.id
LEFT   JOIN animals a ON a.id = o.animal_id
WHERE  bi.mother_id = :mother_id
GROUP  BY bi.id
ORDER  BY bi.birth_date DESC;

-- [C] Estadísticas de crías por especie y período (productividad del rebaño)
WITH nacimientos AS (
  SELECT
    a.species_id,
    bi.birth_date,
    bi.total_born, bi.total_alive, bi.total_dead,
    bi.total_alive::numeric / NULLIF(bi.total_born, 0) AS tasa_supervivencia
  FROM births bi
  JOIN animals a ON a.id = bi.mother_id
  WHERE bi.birth_date BETWEEN :desde AND :hasta
)
SELECT
  s.display_name                        AS especie,
  COUNT(*)                              AS total_partos,
  SUM(n.total_born)                     AS total_nacidos,
  SUM(n.total_alive)                    AS total_vivos,
  SUM(n.total_dead)                     AS total_muertos,
  ROUND(AVG(n.tasa_supervivencia)*100,1)AS tasa_supervivencia_pct
FROM   nacimientos n
JOIN   species s ON s.id = n.species_id
GROUP  BY s.display_name
ORDER  BY s.display_name;

-- ================================================================
-- CRUD M4 — INSUMOS Y BODEGA
-- RF019–RF028 | CU-017 a CU-025
-- ================================================================

-- ----------------------------------------------------------------
-- CU-017 | RF019  REGISTRO DE INSUMOS
-- ----------------------------------------------------------------

-- [S] Insertar insumo (el trigger genera el código automáticamente)
INSERT INTO supplies (
  name, category_id, unit, current_stock, min_stock,
  unit_price, expiry_date, supplier, batch_number, notes, registered_by
)
VALUES (
  :name, :category_id, :unit, :stock_inicial, :min_stock,
  :unit_price, :expiry_date, :supplier, :batch_number, :notes, auth.uid()
)
RETURNING id, code;

-- [A] Verificar nombre duplicado en la misma categoría antes de insertar
SELECT EXISTS (
  SELECT 1 FROM supplies
  WHERE  lower(name)   = lower(:name)
    AND  category_id   = :category_id
    AND  is_active     = true
) AS nombre_duplicado;

-- [A] Validar que medicamento no está vencido al registrar
SELECT :expiry_date IS NOT NULL
   AND :expiry_date < current_date AS esta_vencido,
   (SELECT category FROM supply_categories WHERE id = :category_id) AS categoria;

-- [S] Insertar el stock inicial como primer movimiento de entrada
INSERT INTO stock_movements (
  supply_id, movement_type, reason, quantity,
  balance_before, balance_after, notes, registered_by
)
SELECT id, 'entrada', 'compra', :stock_inicial, 0, :stock_inicial,
       'Stock inicial al registrar insumo', auth.uid()
FROM   supplies WHERE id = :supply_id;

-- ----------------------------------------------------------------
-- CU-018 | RF020 + RF021  CATEGORIZAR Y CONSULTAR INVENTARIO
-- ----------------------------------------------------------------

-- [S] Ver todas las categorías con conteo y estado de alerta
SELECT
  sc.id, sc.name, sc.category,
  COUNT(su.id)                                             AS total_insumos,
  COUNT(*) FILTER (WHERE su.current_stock = 0)             AS agotados,
  COUNT(*) FILTER (WHERE su.current_stock <= su.min_stock
                     AND su.min_stock > 0
                     AND su.current_stock > 0)             AS stock_bajo,
  COUNT(*) FILTER (WHERE su.expiry_date <= current_date + 30
                     AND su.expiry_date IS NOT NULL)        AS proximos_vencer
FROM   supply_categories sc
LEFT   JOIN supplies su ON su.category_id = sc.id AND su.is_active = true
WHERE  sc.is_active = true
GROUP  BY sc.id, sc.name, sc.category
ORDER  BY sc.category, sc.name;

-- [C] Listado de insumos por categoría con indicadores de alerta (usa vista)
SELECT *
FROM   vw_supply_inventory
WHERE  (:category IS NULL OR category = :category::supply_category)
ORDER  BY stock_status DESC, name   -- agotados y bajos primero
LIMIT  :page_size OFFSET (:page - 1) * :page_size;

-- [S] Detalle completo de un insumo
SELECT
  su.id, su.code, su.name,
  sc.name            AS categoria,
  sc.category        AS tipo_categoria,
  su.unit, su.current_stock, su.min_stock,
  su.unit_price,
  su.current_stock * COALESCE(su.unit_price, 0) AS valor_inventario,
  su.expiry_date,
  (su.expiry_date - current_date)               AS dias_para_vencer,
  su.supplier, su.batch_number, su.notes,
  su.is_active,
  p.full_name        AS registrado_por,
  su.created_at, su.updated_at
FROM   supplies su
JOIN   supply_categories sc ON sc.id = su.category_id
LEFT   JOIN profiles p ON p.id = su.registered_by
WHERE  su.id = :supply_id;

-- ----------------------------------------------------------------
-- CU-019 | RF022  BÚSQUEDA DE INSUMOS
-- ----------------------------------------------------------------

-- [C] Búsqueda avanzada con filtros combinados
SELECT
  su.id, su.code, su.name,
  sc.name     AS categoria,
  su.unit, su.current_stock, su.min_stock,
  su.expiry_date,
  CASE
    WHEN su.current_stock = 0                            THEN 'AGOTADO'
    WHEN su.current_stock <= su.min_stock
         AND su.min_stock > 0                            THEN 'STOCK BAJO'
    WHEN su.expiry_date IS NOT NULL
         AND su.expiry_date < current_date               THEN 'VENCIDO'
    WHEN su.expiry_date IS NOT NULL
         AND su.expiry_date <= current_date + 30         THEN 'PRÓXIMO A VENCER'
    ELSE 'NORMAL'
  END         AS estado
FROM   supplies su
JOIN   supply_categories sc ON sc.id = su.category_id
WHERE  su.is_active = true
  AND  (:search     IS NULL OR su.name ILIKE '%'||:search||'%')
  AND  (:category   IS NULL OR sc.category = :category::supply_category)
  AND  (:estado     IS NULL OR
       (:estado = 'AGOTADO'          AND su.current_stock = 0) OR
       (:estado = 'STOCK_BAJO'       AND su.current_stock <= su.min_stock AND su.min_stock > 0 AND su.current_stock > 0) OR
       (:estado = 'VENCIDO'          AND su.expiry_date < current_date) OR
       (:estado = 'PROXIMO_VENCER'   AND su.expiry_date BETWEEN current_date AND current_date + 30))
ORDER  BY su.name
LIMIT  :page_size OFFSET (:page - 1) * :page_size;

-- ----------------------------------------------------------------
-- CU-020 | RF023  EDITAR INSUMO (con confirmación)
-- ----------------------------------------------------------------

-- [S] Leer datos actuales del insumo para pre-poblar formulario
SELECT su.id, su.name, su.category_id, su.unit, su.min_stock,
       su.unit_price, su.expiry_date, su.supplier, su.notes
FROM   supplies su
WHERE  su.id = :supply_id AND su.is_active = true;

-- [S] Actualizar datos descriptivos del insumo (no toca el stock)
UPDATE supplies
SET    name        = COALESCE(:name, name),
       min_stock   = COALESCE(:min_stock, min_stock),
       unit_price  = COALESCE(:unit_price, unit_price),
       expiry_date = COALESCE(:expiry_date, expiry_date),
       supplier    = COALESCE(:supplier, supplier),
       notes       = COALESCE(:notes, notes),
       updated_at  = now()
WHERE  id = :supply_id
  AND  is_active = true;

-- [A] Solo el admin puede cambiar la categoría de un insumo
UPDATE supplies
SET    category_id = :nueva_categoria_id,
       updated_at  = now()
WHERE  id = :supply_id
  AND  fn_is_admin() = true;

-- ----------------------------------------------------------------
-- CU-021 | RF024  AGREGAR STOCK
-- ----------------------------------------------------------------

-- [S] Agregar stock vía función (incluye validaciones y movimiento)
SELECT fn_add_stock(
  :supply_id,
  :quantity,
  :reason::stock_movement_reason,
  :reference_number,
  :supplier,
  :unit_cost,
  :new_expiry_date,
  :notes,
  auth.uid()
);

-- ----------------------------------------------------------------
-- CU-022 | RF025  DESCONTAR STOCK
-- ----------------------------------------------------------------

-- [S] Descontar stock vía función (incluye validación de saldo)
SELECT fn_deduct_stock(
  :supply_id,
  :quantity,
  :reason::stock_movement_reason,
  :animal_id,
  :notes,
  auth.uid()
);

-- [A] Verificar stock antes de descontar (prevalidación en UI)
SELECT
  su.id, su.name, su.current_stock, su.unit,
  su.current_stock >= :cantidad_a_descontar AS stock_suficiente,
  GREATEST(su.current_stock - :cantidad_a_descontar, 0) AS saldo_resultante,
  CASE WHEN su.current_stock - :cantidad_a_descontar <= su.min_stock
       THEN true ELSE false END               AS activara_alerta
FROM   supplies su
WHERE  su.id = :supply_id;

-- ----------------------------------------------------------------
-- CU-023 | RF026  HISTORIAL DE MOVIMIENTOS
-- ----------------------------------------------------------------

-- [S] Historial de movimientos de un insumo específico
SELECT * FROM fn_supply_movements(
  :supply_id,
  :desde::timestamptz,
  :hasta::timestamptz,
  :tipo_movimiento::stock_movement_type   -- NULL para todos
);

-- [C] Historial global de movimientos con filtros (vista de bodega)
SELECT
  sm.id,
  su.code                   AS codigo_insumo,
  su.name                   AS insumo,
  sc.name                   AS categoria,
  sm.movement_type,
  sm.reason,
  sm.quantity,
  su.unit,
  sm.balance_before,
  sm.balance_after,
  a.code                    AS animal_asociado,
  sm.reference_number,
  sm.supplier,
  sm.notes,
  p.full_name               AS registrado_por,
  sm.created_at
FROM   stock_movements sm
JOIN   supplies         su ON su.id = sm.supply_id
JOIN   supply_categories sc ON sc.id = su.category_id
LEFT   JOIN animals     a  ON a.id  = sm.animal_id
LEFT   JOIN profiles    p  ON p.id  = sm.registered_by
WHERE  (:supply_id IS NULL OR sm.supply_id = :supply_id)
  AND  (:category  IS NULL OR sc.category  = :category::supply_category)
  AND  (:tipo      IS NULL OR sm.movement_type = :tipo::stock_movement_type)
  AND  (:desde     IS NULL OR sm.created_at >= :desde::timestamptz)
  AND  (:hasta     IS NULL OR sm.created_at <= :hasta::timestamptz)
ORDER  BY sm.created_at DESC
LIMIT  :page_size OFFSET (:page - 1) * :page_size;

-- ----------------------------------------------------------------
-- CU-024 | RF027  REPORTES DE INSUMOS
-- ----------------------------------------------------------------

-- [C] Reporte de inventario actual con valor total por categoría
SELECT
  sc.name                                AS categoria,
  sc.category,
  COUNT(su.id)                           AS total_insumos,
  SUM(su.current_stock)                  AS stock_total_unidades,
  SUM(su.current_stock * COALESCE(su.unit_price,0)) AS valor_total_cop,
  COUNT(*) FILTER (WHERE su.current_stock = 0)       AS agotados,
  COUNT(*) FILTER (WHERE su.current_stock <= su.min_stock
                     AND su.min_stock > 0
                     AND su.current_stock > 0)        AS stock_bajo
FROM   supplies su
JOIN   supply_categories sc ON sc.id = su.category_id
WHERE  su.is_active = true
GROUP  BY sc.id, sc.name, sc.category
ORDER  BY sc.category, sc.name;

-- [C] Reporte de consumo por insumo en un período (tendencia)
SELECT
  su.name                          AS insumo,
  sc.name                          AS categoria,
  su.unit,
  SUM(sm.quantity)                 AS consumo_total,
  COUNT(DISTINCT sm.animal_id)     AS animales_beneficiados,
  ROUND(SUM(sm.quantity)
        / NULLIF((:hasta::date - :desde::date), 0), 3) AS consumo_diario_prom,
  SUM(sm.quantity * COALESCE(su.unit_price,0)) AS costo_total_cop
FROM   stock_movements sm
JOIN   supplies su         ON su.id = sm.supply_id
JOIN   supply_categories sc ON sc.id = su.category_id
WHERE  sm.movement_type = 'salida'
  AND  sm.created_at BETWEEN :desde AND :hasta
GROUP  BY su.id, su.name, sc.name, su.unit
ORDER  BY consumo_total DESC;

-- [C] Insumos próximos a vencer (30 días) con valor en riesgo
SELECT
  su.code, su.name,
  sc.name            AS categoria,
  su.expiry_date,
  (su.expiry_date - current_date) AS dias_restantes,
  su.current_stock,
  su.unit,
  su.current_stock * COALESCE(su.unit_price,0) AS valor_en_riesgo_cop,
  su.supplier
FROM   supplies su
JOIN   supply_categories sc ON sc.id = su.category_id
WHERE  su.is_active = true
  AND  su.expiry_date IS NOT NULL
  AND  su.expiry_date BETWEEN current_date AND current_date + 30
ORDER  BY su.expiry_date;

-- [C] Rotación de inventario: días de stock restante por insumo
WITH consumo_promedio AS (
  SELECT supply_id,
         ROUND(SUM(quantity) / NULLIF(90.0, 0), 3) AS consumo_diario_90d
  FROM   stock_movements
  WHERE  movement_type = 'salida'
    AND  created_at >= now() - interval '90 days'
  GROUP  BY supply_id
)
SELECT
  su.code, su.name, su.current_stock, su.unit,
  cp.consumo_diario_90d,
  CASE WHEN cp.consumo_diario_90d > 0
    THEN ROUND(su.current_stock / cp.consumo_diario_90d, 0)::int
    ELSE NULL
  END   AS dias_de_stock_restante,
  su.min_stock
FROM   supplies su
LEFT   JOIN consumo_promedio cp ON cp.supply_id = su.id
WHERE  su.is_active = true
ORDER  BY dias_de_stock_restante ASC NULLS LAST;

-- ----------------------------------------------------------------
-- CU-025 | RF028  ALERTAS DE STOCK MÍNIMO
-- ----------------------------------------------------------------

-- [S] Ver todas las alertas activas
SELECT
  sa.id, sa.alert_type, sa.status,
  su.code, su.name, su.current_stock, su.min_stock, su.unit,
  su.expiry_date,
  sa.created_at,
  sa.threshold_value, sa.current_value
FROM   stock_alerts sa
JOIN   supplies su ON su.id = sa.supply_id
WHERE  sa.status = 'activa'
ORDER  BY sa.alert_type DESC, sa.created_at ASC;  -- agotado primero, más antiguas primero

-- [S] Marcar una alerta como atendida
UPDATE stock_alerts
SET    status           = 'atendida',
       attended_by      = auth.uid(),
       attended_at      = now(),
       attendance_notes = :notas_atencion,
       updated_at       = now()
WHERE  id = :alert_id
  AND  status = 'activa';

-- [C] Historial de alertas con tiempos de respuesta (KPI de gestión)
SELECT
  sa.alert_type,
  su.name                               AS insumo,
  sa.status,
  sa.created_at                         AS generada_en,
  sa.attended_at,
  sa.auto_closed_at,
  EXTRACT(HOUR FROM
    COALESCE(sa.attended_at, sa.auto_closed_at) - sa.created_at
  )                                     AS horas_respuesta,
  p.full_name                           AS atendida_por,
  sa.attendance_notes
FROM   stock_alerts sa
JOIN   supplies su ON su.id = sa.supply_id
LEFT   JOIN profiles p ON p.id = sa.attended_by
WHERE  sa.created_at BETWEEN :desde AND :hasta
ORDER  BY sa.created_at DESC;

-- [C] Insumos con mayor frecuencia de alertas (detección de problemas crónicos)
SELECT
  su.code, su.name,
  sc.name                            AS categoria,
  COUNT(sa.id)                       AS total_alertas,
  COUNT(*) FILTER (WHERE sa.alert_type = 'stock_agotado') AS veces_agotado,
  COUNT(*) FILTER (WHERE sa.alert_type = 'stock_bajo')    AS veces_bajo,
  MAX(sa.created_at)                 AS ultima_alerta
FROM   stock_alerts sa
JOIN   supplies su         ON su.id = sa.supply_id
JOIN   supply_categories sc ON sc.id = su.category_id
WHERE  sa.created_at >= now() - interval '6 months'
GROUP  BY su.id, su.code, su.name, sc.name
HAVING COUNT(sa.id) >= 2
ORDER  BY total_alertas DESC;

-- ================================================================
-- CRUD M5 — PRODUCCIÓN
-- RF029–RF030 | CU-026, CU-027
-- ================================================================

-- ----------------------------------------------------------------
-- CU-026 | RF029  REGISTRO DE PRODUCCIÓN DE LECHE Y HUEVOS
-- ----------------------------------------------------------------

-- [A] Verificar que el animal es vaca activa antes de registrar leche
SELECT EXISTS (
  SELECT 1 FROM animals a
  JOIN   species s ON s.id = a.species_id
  WHERE  a.id = :animal_id
    AND  s.name = 'vaca'
    AND  a.status = 'activo'
    AND  s.is_productive_milk = true
) AS es_vaca_activa;

-- [S] Insertar producción de leche de una vaca
INSERT INTO milk_production (
  animal_id, production_date, shift, quantity_liters, quality_notes, notes, registered_by
)
VALUES (
  :animal_id, :production_date, :shift::production_shift,
  :quantity_liters, :quality_notes, :notes, auth.uid()
)
ON CONFLICT (animal_id, production_date, shift)
DO UPDATE SET                            -- actualizar si ya existe el turno (duplicado detectado)
  quantity_liters = EXCLUDED.quantity_liters,
  quality_notes   = EXCLUDED.quality_notes,
  notes           = EXCLUDED.notes
RETURNING id, quantity_liters;

-- [S] Insertar producción de huevos por lote
INSERT INTO egg_production (
  lot_name, production_date, quantity_units, discarded_units, notes, registered_by
)
VALUES (
  :lot_name, :production_date, :quantity_units, :discarded_units, :notes, auth.uid()
)
ON CONFLICT (animal_id, lot_name, production_date)
DO UPDATE SET
  quantity_units  = EXCLUDED.quantity_units,
  discarded_units = EXCLUDED.discarded_units,
  notes           = EXCLUDED.notes
RETURNING id;

-- [S] Insertar producción de huevos por animal individual
INSERT INTO egg_production (
  animal_id, production_date, quantity_units, discarded_units, notes, registered_by
)
VALUES (
  :animal_id, :production_date, :quantity_units, :discarded_units, :notes, auth.uid()
)
RETURNING id;

-- [S] Actualizar registro de producción de leche (corrección)
UPDATE milk_production
SET    quantity_liters = :nueva_cantidad,
       quality_notes   = COALESCE(:quality_notes, quality_notes),
       notes           = COALESCE(:notes, notes)
WHERE  id             = :prod_id
  AND  animal_id      = :animal_id;      -- verificar pertenencia

-- [C] Registro masivo de leche — múltiples vacas en un turno
--     Se usa INSERT ... SELECT para insertar varias filas de golpe
--     :registros = '[{"animal_id":"uuid","litros":12.5}, ...]'
INSERT INTO milk_production (animal_id, production_date, shift, quantity_liters, registered_by)
SELECT
  (r->>'animal_id')::uuid,
  :production_date,
  :shift::production_shift,
  (r->>'litros')::numeric,
  auth.uid()
FROM jsonb_array_elements(:registros::jsonb) AS r
WHERE (r->>'litros')::numeric >= 0
ON CONFLICT (animal_id, production_date, shift)
DO UPDATE SET quantity_liters = EXCLUDED.quantity_liters;

-- ----------------------------------------------------------------
-- CU-027 | RF030  REPORTE DE PRODUCCIÓN
-- ----------------------------------------------------------------

-- [S] Reporte diario de leche (un día específico)
SELECT
  mp.production_date,
  mp.shift,
  a.code            AS vaca,
  b.name            AS raza,
  mp.quantity_liters,
  mp.quality_notes,
  -- Comparativo con el día anterior en el mismo turno
  LAG(mp.quantity_liters) OVER (
    PARTITION BY mp.animal_id, mp.shift
    ORDER BY mp.production_date
  )                 AS litros_dia_anterior,
  mp.quantity_liters - LAG(mp.quantity_liters) OVER (
    PARTITION BY mp.animal_id, mp.shift
    ORDER BY mp.production_date
  )                 AS variacion_litros
FROM   milk_production mp
JOIN   animals a ON a.id = mp.animal_id
LEFT   JOIN breeds b ON b.id = a.breed_id
WHERE  mp.production_date = :fecha
ORDER  BY mp.shift, mp.quantity_liters DESC;

-- [C] Consolidado de leche por turno y día (resumen del día)
SELECT *
FROM   vw_milk_daily_report
WHERE  production_date = :fecha;

-- [C] Reporte diario de huevos
SELECT
  ep.production_date,
  COALESCE(a.code, ep.lot_name) AS fuente,
  ep.quantity_units,
  ep.discarded_units,
  ep.quantity_units - ep.discarded_units AS netos,
  ep.notes
FROM   egg_production ep
LEFT   JOIN animals a ON a.id = ep.animal_id
WHERE  ep.production_date = :fecha
ORDER  BY fuente;

-- [C] Reporte histórico de leche con granularidad diaria/semanal/mensual
--     Usa fn_production_summary para el bloque temporal
SELECT
  period,
  total_milk_liters,
  milk_cows_count,
  -- Promedio diario de litros por vaca
  ROUND(total_milk_liters / NULLIF(milk_cows_count, 0), 3) AS litros_por_vaca
FROM fn_production_summary(:desde::date, :hasta::date, :animal_id)
WHERE total_milk_liters > 0 OR milk_cows_count > 0
ORDER BY period;

-- [C] Tendencia semanal de producción de leche (agrupación por semana)
SELECT
  date_trunc('week', mp.production_date)::date AS semana,
  SUM(mp.quantity_liters)                       AS litros_semana,
  COUNT(DISTINCT mp.animal_id)                  AS vacas,
  ROUND(AVG(mp.quantity_liters), 3)             AS promedio_por_turno,
  MAX(mp.quantity_liters)                       AS maximo_turno,
  MIN(mp.quantity_liters) FILTER
    (WHERE mp.quantity_liters > 0)              AS minimo_turno
FROM   milk_production mp
WHERE  mp.production_date BETWEEN :desde AND :hasta
  AND  (:animal_id IS NULL OR mp.animal_id = :animal_id)
GROUP  BY date_trunc('week', mp.production_date)
ORDER  BY semana;

-- [C] Tendencia mensual de producción de huevos
SELECT
  date_trunc('month', ep.production_date)::date AS mes,
  SUM(ep.quantity_units)                         AS huevos_brutos,
  SUM(ep.discarded_units)                        AS descartados,
  SUM(ep.quantity_units - ep.discarded_units)    AS huevos_netos,
  ROUND(
    100.0 * SUM(ep.discarded_units)
    / NULLIF(SUM(ep.quantity_units), 0), 2
  )                                              AS pct_descarte
FROM   egg_production ep
WHERE  ep.production_date BETWEEN :desde AND :hasta
GROUP  BY date_trunc('month', ep.production_date)
ORDER  BY mes;

-- [C] KPIs de producción en un período (para el tablero principal)
SELECT
  -- Leche
  ROUND(SUM(mp.quantity_liters), 2)                          AS total_litros,
  ROUND(AVG(mp.quantity_liters), 3)                          AS litros_promedio_turno,
  MAX(mp.quantity_liters)                                    AS maximo_turno,
  -- Período
  MIN(mp.production_date)                                    AS desde,
  MAX(mp.production_date)                                    AS hasta,
  COUNT(DISTINCT mp.production_date)                         AS dias_con_registro,
  COUNT(DISTINCT mp.animal_id)                               AS vacas_activas,
  -- Comparativo período anterior (misma duración)
  (SELECT ROUND(SUM(mp2.quantity_liters), 2)
   FROM milk_production mp2
   WHERE mp2.production_date BETWEEN
     :desde::date - (:hasta::date - :desde::date) AND :desde::date - 1
  )                                                          AS litros_periodo_anterior
FROM   milk_production mp
WHERE  mp.production_date BETWEEN :desde AND :hasta;

-- [C] Top 5 vacas más productivas en el período con ranking
SELECT
  RANK() OVER (ORDER BY SUM(mp.quantity_liters) DESC) AS ranking,
  a.code,
  b.name                             AS raza,
  SUM(mp.quantity_liters)            AS total_litros,
  ROUND(AVG(mp.quantity_liters), 3)  AS promedio_turno,
  COUNT(*)                           AS turnos_registrados
FROM   milk_production mp
JOIN   animals a ON a.id = mp.animal_id
LEFT   JOIN breeds b ON b.id = a.breed_id
WHERE  mp.production_date BETWEEN :desde AND :hasta
GROUP  BY a.id, a.code, b.name
ORDER  BY total_litros DESC
LIMIT  5;

-- [A] Verificar producción duplicada en el mismo turno (alerta UI antes de guardar)
SELECT EXISTS (
  SELECT 1 FROM milk_production
  WHERE  animal_id = :animal_id
    AND  production_date = :production_date
    AND  shift = :shift::production_shift
) AS registro_existente;

-- [S] Eliminar registro de producción incorrecto (solo admin)
DELETE FROM milk_production
WHERE  id         = :prod_id
  AND  fn_is_admin() = true;

DELETE FROM egg_production
WHERE  id         = :prod_id
  AND  fn_is_admin() = true;

-- ================================================================
-- CONSULTAS TRANSVERSALES — DASHBOARD, AUDITORÍA Y REPORTES
-- Cubren múltiples módulos | RNF10 Estadísticas | RNF11 Auditoría
-- ================================================================

-- ----------------------------------------------------------------
-- DASHBOARD PRINCIPAL — Indicadores globales al iniciar sesión
-- ----------------------------------------------------------------

-- [C] KPIs del sistema en un solo query (panel de resumen)
SELECT
  -- Inventario
  (SELECT COUNT(*) FROM animals WHERE status = 'activo')         AS animales_activos,
  (SELECT COUNT(*) FROM animals WHERE health_status = 'en_tratamiento'
                                  AND status = 'activo')         AS en_tratamiento,
  (SELECT COUNT(*) FROM animals WHERE vaccination_status = 'vencido'
                                  AND status = 'activo')         AS vacc_vencidas,
  (SELECT COUNT(*) FROM animals WHERE reproductive_status = 'en_gestion'
                                  AND status = 'activo')         AS en_gestacion,
  -- Alertas de stock
  (SELECT COUNT(*) FROM stock_alerts WHERE status = 'activa')    AS alertas_stock_activas,
  (SELECT COUNT(*) FROM stock_alerts WHERE status = 'activa'
                                      AND alert_type='stock_agotado') AS insumos_agotados,
  -- Producción del día
  (SELECT COALESCE(SUM(quantity_liters),0)
   FROM milk_production
   WHERE production_date = current_date)                         AS litros_hoy,
  (SELECT COALESCE(SUM(quantity_units - discarded_units),0)
   FROM egg_production
   WHERE production_date = current_date)                         AS huevos_netos_hoy,
  -- Partos próximos (7 días)
  (SELECT COUNT(*) FROM reproductive_events
   WHERE gestation_status IN ('en_seguimiento','confirmada')
     AND estimated_birth_date <= current_date + 7)               AS partos_proximos_7d;

-- [C] Vista unificada de alertas activas del sistema (dashboard lateral)
SELECT * FROM vw_active_alerts
LIMIT 20;

-- [C] Evolución semanal del inventario (altas y bajas de animales)
WITH semanas AS (
  SELECT date_trunc('week', gs)::date AS semana
  FROM generate_series(
    now() - interval '12 weeks', now(), '1 week'::interval
  ) gs
)
SELECT
  se.semana,
  COUNT(a.id) FILTER (WHERE date_trunc('week', a.created_at)::date = se.semana
                        AND a.origin = 'nacido_en_finca')         AS nacimientos,
  COUNT(a.id) FILTER (WHERE date_trunc('week', a.created_at)::date = se.semana
                        AND a.origin = 'adquirido_externo')       AS adquisiciones,
  COUNT(a.id) FILTER (WHERE a.egress_date IS NOT NULL
                        AND date_trunc('week', a.egress_date::timestamptz)::date = se.semana) AS egresos
FROM semanas se
CROSS JOIN animals a
GROUP BY se.semana
ORDER BY se.semana;

-- ----------------------------------------------------------------
-- AUDITORÍA — Consultas de trazabilidad
-- RNF11, CU-005
-- ----------------------------------------------------------------

-- [C] Historial de cambios de un registro específico
SELECT
  al.action,
  al.changed_fields,
  al.old_data,
  al.new_data,
  p.full_name AS usuario,
  al.ip_address,
  al.created_at
FROM   audit_log al
LEFT   JOIN profiles p ON p.id = al.user_id
WHERE  al.table_name = :tabla     -- 'animals' | 'supplies' | 'profiles' …
  AND  al.record_id  = :record_id
ORDER  BY al.created_at DESC;

-- [C] Actividad de un usuario en el sistema (última semana)
SELECT
  al.table_name,
  al.action,
  al.record_id,
  al.changed_fields,
  al.created_at
FROM   audit_log al
WHERE  al.user_id    = :user_id
  AND  al.created_at >= now() - interval '7 days'
ORDER  BY al.created_at DESC;

-- [C] Operaciones del sistema por usuario y tipo (reporte de actividad)
SELECT
  p.full_name,
  p.role,
  al.table_name,
  al.action,
  COUNT(*)        AS total,
  MAX(al.created_at) AS ultima_operacion
FROM   audit_log al
JOIN   profiles p ON p.id = al.user_id
WHERE  al.created_at BETWEEN :desde AND :hasta
GROUP  BY p.full_name, p.role, al.table_name, al.action
ORDER  BY total DESC;

-- ----------------------------------------------------------------
-- VENTANAS DE ANÁLISIS (Window Functions)
-- ================================================================

-- [C] Ranking de producción de leche por vaca con porcentaje del total
SELECT
  a.code,
  SUM(mp.quantity_liters)                                       AS litros_total,
  RANK() OVER (ORDER BY SUM(mp.quantity_liters) DESC)           AS ranking,
  ROUND(
    100.0 * SUM(mp.quantity_liters)
    / SUM(SUM(mp.quantity_liters)) OVER (), 2
  )                                                             AS pct_del_total
FROM   milk_production mp
JOIN   animals a ON a.id = mp.animal_id
WHERE  mp.production_date BETWEEN :desde AND :hasta
GROUP  BY a.id, a.code
ORDER  BY litros_total DESC;

-- [C] Movimiento acumulado de stock de un insumo (balance running total)
SELECT
  sm.created_at::date         AS fecha,
  sm.movement_type,
  sm.reason,
  sm.quantity,
  SUM(
    CASE sm.movement_type
      WHEN 'entrada' THEN  sm.quantity
      WHEN 'salida'  THEN -sm.quantity
      ELSE 0
    END
  ) OVER (ORDER BY sm.created_at)  AS stock_acumulado
FROM   stock_movements sm
WHERE  sm.supply_id = :supply_id
ORDER  BY sm.created_at;

-- [C] Producción de leche: media móvil de 7 días por vaca
SELECT
  mp.production_date,
  a.code,
  mp.quantity_liters,
  ROUND(
    AVG(mp.quantity_liters) OVER (
      PARTITION BY mp.animal_id
      ORDER BY mp.production_date
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 3
  ) AS media_movil_7d
FROM   milk_production mp
JOIN   animals a ON a.id = mp.animal_id
WHERE  mp.animal_id = :animal_id
  AND  mp.production_date BETWEEN :desde AND :hasta
ORDER  BY mp.production_date;

-- ----------------------------------------------------------------
-- CTEs — Consultas con expresiones de tabla común
-- ================================================================

-- [C] Análisis integral de un animal: todos sus indicadores en un CTE
WITH datos_base AS (
  SELECT a.*, s.display_name AS especie, s.is_productive_milk, s.is_productive_eggs,
         b.name AS raza
  FROM animals a JOIN species s ON s.id = a.species_id LEFT JOIN breeds b ON b.id = a.breed_id
  WHERE a.id = :animal_id
),
produccion AS (
  SELECT COALESCE(SUM(mp.quantity_liters),0) AS total_litros_90d,
         COALESCE(SUM(ep.quantity_units),0)  AS total_huevos_90d
  FROM   datos_base db
  LEFT   JOIN milk_production mp ON mp.animal_id = db.id
                                AND mp.production_date >= current_date - 90
  LEFT   JOIN egg_production  ep ON ep.animal_id = db.id
                                AND ep.production_date >= current_date - 90
),
salud AS (
  SELECT COUNT(*) AS total_eventos_salud,
         COUNT(*) FILTER (WHERE recovery_status = 'en_tratamiento') AS activos
  FROM health_events WHERE animal_id = :animal_id AND is_correction = false
),
vacunas AS (
  SELECT COUNT(*) AS total_vacunas,
         MIN(next_dose_date) AS proxima_dosis
  FROM vaccination_records WHERE animal_id = :animal_id
),
reproduccion AS (
  SELECT COUNT(*) AS total_eventos,
         COUNT(*) FILTER (WHERE gestation_status = 'parto_exitoso') AS partos_exitosos
  FROM reproductive_events WHERE female_animal_id = :animal_id
),
alimentos AS (
  SELECT COALESCE(SUM(fr.quantity),0) AS consumo_total_90d
  FROM feeding_records fr
  WHERE fr.animal_id = :animal_id
    AND fr.fed_at >= now() - interval '90 days'
)
SELECT db.*, pr.*, sa.*, va.*, re.*, al.*
FROM   datos_base db, produccion pr, salud sa, vacunas va, reproduccion re, alimentos al;

-- [C] CTE recursiva: árbol genealógico de un animal (hasta 4 generaciones)
WITH RECURSIVE genealogia AS (
  -- Base: el animal en sí
  SELECT id, code, mother_id, father_id, father_external,
         0 AS generacion, 'ANIMAL BASE' AS relacion
  FROM   animals WHERE id = :animal_id

  UNION ALL

  -- Recursión: padres de los padres
  SELECT a.id, a.code, a.mother_id, a.father_id, a.father_external,
         g.generacion + 1,
         CASE WHEN a.id = g.mother_id THEN 'MADRE' ELSE 'PADRE' END
  FROM   animals a
  JOIN   genealogia g ON a.id = g.mother_id OR a.id = g.father_id
  WHERE  g.generacion < 4  -- límite de profundidad
)
SELECT generacion, relacion, id, code,
       COALESCE(father_external, 'En inventario') AS padre_info
FROM   genealogia
ORDER  BY generacion, relacion;

-- [C] CTE: eficiencia de uso de insumos (consumo vs. stock comprado)
WITH compras AS (
  SELECT supply_id, SUM(quantity) AS total_comprado, COUNT(*) AS num_compras
  FROM   stock_movements WHERE movement_type = 'entrada'
    AND  created_at >= :desde
  GROUP  BY supply_id
),
consumos AS (
  SELECT supply_id, SUM(quantity) AS total_consumido
  FROM   stock_movements WHERE movement_type = 'salida'
    AND  created_at >= :desde
  GROUP  BY supply_id
)
SELECT
  su.code, su.name,
  COALESCE(c.total_comprado,0)       AS comprado,
  COALESCE(co.total_consumido,0)     AS consumido,
  su.current_stock                   AS stock_actual,
  ROUND(
    100.0 * COALESCE(co.total_consumido,0)
    / NULLIF(COALESCE(c.total_comprado,0),0), 1
  )                                  AS tasa_rotacion_pct,
  c.num_compras
FROM   supplies su
LEFT   JOIN compras  c  ON c.supply_id  = su.id
LEFT   JOIN consumos co ON co.supply_id = su.id
WHERE  su.is_active = true
ORDER  BY tasa_rotacion_pct DESC NULLS LAST;

