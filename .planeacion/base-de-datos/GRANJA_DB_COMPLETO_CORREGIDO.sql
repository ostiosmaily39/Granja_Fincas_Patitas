-- ================================================================
-- GRANJA AGROPECUARIA — Base de datos PostgreSQL / Supabase
-- VERSIÓN CORREGIDA v1.1
-- ================================================================
-- CORRECCIONES APLICADAS (v1.0 → v1.1):
--
--   ERROR 1 ► 42P01: relation "supplies" does not exist
--   CAUSA   : vaccination_records, feeding_records y health_treatments
--             referenciaban supplies(id) antes de que la tabla existiera.
--   FIX     : supply_categories y supplies ahora se crean ANTES de
--             vaccination_records (orden de dependencia correcto).
--
--   ERROR 2 ► cannot use subquery in check constraint
--   CAUSA   : supplies tenía CHECK con subconsulta SELECT sobre
--             supply_categories — PostgreSQL no lo permite.
--   FIX     : La restricción se elimina del CHECK y se implementa
--             como trigger BEFORE INSERT OR UPDATE (fn_validate_supply_expiry).
--
-- ORDEN DE TABLAS CORREGIDO:
--   profiles → audit_log → species → breeds → animals → animal_events
--   → vaccination_schemes → supply_categories → supplies
--   → vaccination_records → feeding_records → health_events
--   → health_treatments → reproductive_events → births → offspring
--   → stock_movements → stock_alerts → milk_production → egg_production
-- ================================================================

-- ============================================================
-- SISTEMA DE INFORMACIÓN - GRANJA AGROPECUARIA
-- Base de datos PostgreSQL para Supabase
-- Versión: 1.0 | Alineada con RF v2.0 y CU v1.0
-- ============================================================
-- Convenciones:
--   · PK:  uuid DEFAULT gen_random_uuid()
--   · timestamps: timestamptz, DEFAULT now()
--   · soft-delete vía status / is_active
--   · auditoría centralizada en audit_log
--   · snake_case para todo
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONES
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- búsqueda por similitud de texto

-- ────────────────────────────────────────────────────────────
-- 1. TIPOS ENUMERADOS (ENUMS)
-- ────────────────────────────────────────────────────────────

-- M1 Usuarios
CREATE TYPE user_role AS ENUM (
  'administrador',
  'encargado',
  'empleado'
);

-- M2 Animales - especie
CREATE TYPE animal_species AS ENUM (
  'vaca',
  'cerdo',
  'gallina'
);

-- M2 Animales - sexo
CREATE TYPE animal_sex AS ENUM (
  'macho',
  'hembra'
);

-- M2 Animales - estado general
CREATE TYPE animal_status AS ENUM (
  'activo',
  'inactivo',
  'egresado'
);

-- M2 Animales - origen de ingreso
CREATE TYPE animal_origin AS ENUM (
  'nacido_en_finca',
  'adquirido_externo'
);

-- M2 Animales - razón de egreso
CREATE TYPE egress_reason AS ENUM (
  'venta',
  'muerte',
  'traslado',
  'sacrificio',
  'otro'
);

-- M2 Salud - estado de salud
CREATE TYPE health_status AS ENUM (
  'sano',
  'en_tratamiento',
  'cronico',
  'fallecido'
);

-- M2 Salud - tipo de evento de salud
CREATE TYPE health_event_type AS ENUM (
  'enfermedad',
  'accidente',
  'lesion',
  'otro'
);

-- M2 Salud - estado de recuperación
CREATE TYPE recovery_status AS ENUM (
  'en_tratamiento',
  'recuperado',
  'cronico',
  'fallecido'
);

-- M2 Vacunación - estado del esquema
CREATE TYPE vaccination_status AS ENUM (
  'al_dia',
  'pendiente',
  'vencido'
);

-- M2 Reproducción - estado reproductivo del animal
CREATE TYPE reproductive_status AS ENUM (
  'sin_gestion_activa',
  'en_gestion',
  'en_parto'
);

-- M3 Reproductivo - tipo de evento reproductivo
CREATE TYPE reproductive_event_type AS ENUM (
  'monta_natural',
  'inseminacion_artificial'
);

-- M3 Reproductivo - estado de gestación
CREATE TYPE gestation_status AS ENUM (
  'en_seguimiento',
  'confirmada',
  'fallida',
  'parto_exitoso'
);

-- M3 Crías - estado al nacimiento
CREATE TYPE birth_status AS ENUM (
  'vivo',
  'muerto_al_nacer'
);

-- M4 Insumos - categoría
CREATE TYPE supply_category AS ENUM (
  'alimento',
  'medicamento',
  'otro'
);

-- M4 Insumos - tipo de movimiento de stock
CREATE TYPE stock_movement_type AS ENUM (
  'entrada',
  'salida',
  'ajuste'
);

-- M4 Insumos - motivo del movimiento
CREATE TYPE stock_movement_reason AS ENUM (
  'compra',
  'consumo_animal',
  'tratamiento_veterinario',
  'vacunacion',
  'vencido',
  'perdida',
  'devolucion',
  'ajuste_inventario',
  'otro'
);

-- M4 Alertas
CREATE TYPE alert_type AS ENUM (
  'stock_bajo',
  'stock_agotado',
  'proximo_vencer',
  'vencido'
);

CREATE TYPE alert_status AS ENUM (
  'activa',
  'atendida',
  'cerrada_automaticamente'
);

-- M5 Producción
CREATE TYPE production_shift AS ENUM (
  'manana',
  'tarde',
  'noche'
);

-- Auditoría - tipo de acción
CREATE TYPE audit_action AS ENUM (
  'INSERT',
  'UPDATE',
  'DELETE'
);

-- Historial de animal - tipo de evento
CREATE TYPE animal_event_type AS ENUM (
  'ingreso',
  'actualizacion',
  'alimentacion',
  'vacunacion',
  'salud',
  'reproductivo',
  'parto',
  'produccion',
  'egreso',
  'correccion'
);

-- ============================================================
-- MÓDULO 1: TRAZABILIDAD Y USUARIOS
-- Tablas: profiles, audit_log
-- RF: RF001-RF006 | CU: CU-001 a CU-006
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1.1 PERFILES DE USUARIO
-- Extiende auth.users de Supabase
-- ────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text        NOT NULL CHECK (length(trim(full_name)) >= 3),
  role            user_role   NOT NULL DEFAULT 'empleado',
  is_active       boolean     NOT NULL DEFAULT true,
  phone           text        CHECK (phone ~ '^\+?[0-9\s\-]{7,20}$'),
  avatar_url      text,
  -- Metadatos de sesión
  last_login_at   timestamptz,
  login_count     integer     NOT NULL DEFAULT 0,
  failed_attempts integer     NOT NULL DEFAULT 0,
  locked_until    timestamptz,
  -- Auditoría
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      uuid        REFERENCES profiles(id) ON DELETE SET NULL
);

COMMENT ON TABLE  profiles IS 'Perfiles de usuario del sistema. Extiende auth.users de Supabase. RF001-RF006.';
COMMENT ON COLUMN profiles.role            IS 'Rol del usuario: administrador | encargado | empleado. RF005.';
COMMENT ON COLUMN profiles.failed_attempts IS 'Contador de intentos fallidos de login. Bloqueo tras 5 intentos. RF002.';
COMMENT ON COLUMN profiles.locked_until    IS 'Fecha hasta la que la cuenta está bloqueada. RF002.';

-- ────────────────────────────────────────────────────────────
-- 1.2 LOG DE AUDITORÍA CENTRALIZADO
-- Registra todas las operaciones críticas del sistema
-- RF005, RF011, RNF11
-- ────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
  id           bigserial    PRIMARY KEY,
  user_id      uuid         REFERENCES profiles(id) ON DELETE SET NULL,
  table_name   text         NOT NULL,
  record_id    text         NOT NULL,
  action       audit_action NOT NULL,
  old_data     jsonb,
  new_data     jsonb,
  changed_fields text[],     -- lista de campos modificados (UPDATE)
  ip_address   inet,
  user_agent   text,
  session_id   text,
  created_at   timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  audit_log IS 'Registro inmutable de todas las operaciones. RNF11 Auditoría. RF005.';
COMMENT ON COLUMN audit_log.changed_fields IS 'Campos modificados en operaciones UPDATE.';
COMMENT ON COLUMN audit_log.old_data       IS 'Estado anterior del registro (UPDATE/DELETE).';
COMMENT ON COLUMN audit_log.new_data       IS 'Estado nuevo del registro (INSERT/UPDATE).';

-- Índices audit_log
CREATE INDEX idx_audit_user        ON audit_log(user_id);
CREATE INDEX idx_audit_table       ON audit_log(table_name);
CREATE INDEX idx_audit_record      ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_action      ON audit_log(action);
CREATE INDEX idx_audit_created_at  ON audit_log(created_at DESC);

-- Índices profiles
CREATE INDEX idx_profiles_role      ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- ============================================================
-- MÓDULO 2: INVENTARIO PECUARIO
-- Tablas: species, breeds, animals, animal_events,
--         feeding_records, vaccination_schemes,
--         vaccination_records, health_events, health_treatments
-- RF: RF007-RF016 | CU: CU-007 a CU-014
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 2.1 ESPECIES (tabla de referencia)
-- ────────────────────────────────────────────────────────────
CREATE TABLE species (
  id                  uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  name                animal_species NOT NULL UNIQUE,
  display_name        text         NOT NULL,          -- "Vaca", "Cerdo", "Gallina"
  gestation_days      integer      CHECK (gestation_days > 0),  -- para cálculo reproductivo
  code_prefix         char(3)      NOT NULL UNIQUE,   -- VAC, CER, GAL
  is_productive_milk  boolean      NOT NULL DEFAULT false,
  is_productive_eggs  boolean      NOT NULL DEFAULT false,
  description         text,
  created_at          timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  species IS 'Catálogo de especies soportadas. Base de datos de referencia.';
COMMENT ON COLUMN species.gestation_days     IS 'Días de gestación por especie para cálculo de fecha estimada de parto. CU-015.';
COMMENT ON COLUMN species.code_prefix        IS 'Prefijo del código único del animal (VAC, CER, GAL). CU-007.';
COMMENT ON COLUMN species.is_productive_milk IS 'Indica si la especie produce leche (vacas). RF029.';
COMMENT ON COLUMN species.is_productive_eggs IS 'Indica si la especie produce huevos (gallinas). RF029.';

-- Datos iniciales de especies
INSERT INTO species (name, display_name, gestation_days, code_prefix, is_productive_milk, is_productive_eggs) VALUES
  ('vaca',    'Vaca',    283, 'VAC', true,  false),
  ('cerdo',   'Cerdo',   114, 'CER', false, false),
  ('gallina', 'Gallina', NULL,'GAL', false, true);

-- ────────────────────────────────────────────────────────────
-- 2.2 RAZAS
-- ────────────────────────────────────────────────────────────
CREATE TABLE breeds (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id  uuid        NOT NULL REFERENCES species(id) ON DELETE RESTRICT,
  name        text        NOT NULL,
  description text,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (species_id, name)
);

COMMENT ON TABLE breeds IS 'Razas por especie. Referenciada desde animals.';

-- Datos iniciales de razas comunes
INSERT INTO breeds (species_id, name) SELECT id, unnest(ARRAY[
  'Holstein','Jersey','Angus','Simmental','Brahman','Criolla'
]) FROM species WHERE name = 'vaca';

INSERT INTO breeds (species_id, name) SELECT id, unnest(ARRAY[
  'Landrace','Duroc','Yorkshire','Berkshire','Pietrain','Criolla'
]) FROM species WHERE name = 'cerdo';

INSERT INTO breeds (species_id, name) SELECT id, unnest(ARRAY[
  'Leghorn','Rhode Island Red','Plymouth Rock','Australorp','Criolla'
]) FROM species WHERE name = 'gallina';

-- ────────────────────────────────────────────────────────────
-- 2.3 ANIMALES
-- Entidad central del sistema. RF007-RF016
-- ────────────────────────────────────────────────────────────
CREATE TABLE animals (
  -- Identificación
  id                   uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  code                 text              NOT NULL UNIQUE,   -- VAC-2025-0042 (generado por trigger)
  species_id           uuid              NOT NULL REFERENCES species(id) ON DELETE RESTRICT,
  breed_id             uuid              REFERENCES breeds(id) ON DELETE SET NULL,

  -- Datos básicos
  sex                  animal_sex        NOT NULL,
  birth_date           date              CHECK (birth_date <= current_date),
  acquisition_date     date              CHECK (acquisition_date <= current_date),
  origin               animal_origin     NOT NULL,

  -- Métricas físicas
  initial_weight_kg    numeric(8,3)      NOT NULL CHECK (initial_weight_kg >= 0.1),
  current_weight_kg    numeric(8,3)      CHECK (current_weight_kg >= 0.1),

  -- Estados
  status               animal_status     NOT NULL DEFAULT 'activo',
  health_status        health_status     NOT NULL DEFAULT 'sano',
  reproductive_status  reproductive_status NOT NULL DEFAULT 'sin_gestion_activa',
  vaccination_status   vaccination_status  NOT NULL DEFAULT 'pendiente',

  -- Egreso
  egress_reason        egress_reason     CHECK (egress_reason IS NULL OR status = 'egresado'),
  egress_date          date              CHECK (egress_date IS NULL OR egress_date <= current_date),
  egress_notes         text,

  -- Genealogía
  mother_id            uuid              REFERENCES animals(id) ON DELETE SET NULL,
  father_id            uuid              REFERENCES animals(id) ON DELETE SET NULL,
  father_external      text,             -- padre externo (no registrado en sistema)

  -- Notas
  notes                text,

  -- Auditoría
  registered_by        uuid              NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at           timestamptz       NOT NULL DEFAULT now(),
  updated_at           timestamptz       NOT NULL DEFAULT now(),

  -- Restricciones de negocio
  CONSTRAINT chk_birth_or_acquisition
    CHECK (birth_date IS NOT NULL OR acquisition_date IS NOT NULL),
  CONSTRAINT chk_origin_birth
    CHECK (origin != 'nacido_en_finca' OR birth_date IS NOT NULL),
  CONSTRAINT chk_egress_date
    CHECK (status != 'egresado' OR egress_date IS NOT NULL),
  CONSTRAINT chk_egress_reason
    CHECK (status != 'egresado' OR egress_reason IS NOT NULL),
  CONSTRAINT chk_father_not_both
    CHECK (NOT (father_id IS NOT NULL AND father_external IS NOT NULL)),
  CONSTRAINT chk_reproductive_only_female
    CHECK (sex = 'hembra' OR reproductive_status = 'sin_gestion_activa')
);

COMMENT ON TABLE  animals IS 'Inventario pecuario. Entidad central del sistema. RF007-RF016, CU-007 a CU-014.';
COMMENT ON COLUMN animals.code                IS 'Código único generado: PREFIJO-AÑO-SECUENCIAL. Inmutable. CU-007.';
COMMENT ON COLUMN animals.reproductive_status IS 'Estado reproductivo. Solo aplica a hembras. CU-015, CU-016.';
COMMENT ON COLUMN animals.vaccination_status  IS 'Estado del esquema de vacunación: al_dia | pendiente | vencido. CU-013, RF015.';
COMMENT ON COLUMN animals.father_external     IS 'Nombre/ID del padre cuando no está registrado en el sistema. CU-015.';

-- Secuencias para generación de código por especie
CREATE SEQUENCE animal_seq_vac START 1;
CREATE SEQUENCE animal_seq_cer START 1;
CREATE SEQUENCE animal_seq_gal START 1;

-- Índices animals
CREATE INDEX idx_animals_species       ON animals(species_id);
CREATE INDEX idx_animals_breed         ON animals(breed_id);
CREATE INDEX idx_animals_status        ON animals(status);
CREATE INDEX idx_animals_health        ON animals(health_status);
CREATE INDEX idx_animals_vacc_status   ON animals(vaccination_status);
CREATE INDEX idx_animals_repro_status  ON animals(reproductive_status);
CREATE INDEX idx_animals_mother        ON animals(mother_id);
CREATE INDEX idx_animals_code_trgm     ON animals USING gin(code gin_trgm_ops);
CREATE INDEX idx_animals_created_at    ON animals(created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 2.4 HISTORIAL INTEGRAL DEL ANIMAL
-- Línea de tiempo unificada de todos los eventos.
-- RF012, RF013, CU-011
-- ────────────────────────────────────────────────────────────
CREATE TABLE animal_events (
  id             uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id      uuid              NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  event_type     animal_event_type NOT NULL,
  event_date     timestamptz       NOT NULL DEFAULT now(),
  title          text              NOT NULL,
  description    text,
  metadata       jsonb             DEFAULT '{}',   -- datos extra según tipo de evento
  reference_id   uuid,                             -- FK polimórfica al registro origen
  reference_table text,                            -- tabla origen del evento
  performed_by   uuid              REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     timestamptz       NOT NULL DEFAULT now()
);

COMMENT ON TABLE  animal_events IS 'Historial cronológico unificado del animal. Inmutable. RF012, RF013, CU-011.';
COMMENT ON COLUMN animal_events.metadata       IS 'Datos adicionales en JSON según tipo de evento (peso, litros, etc.).';
COMMENT ON COLUMN animal_events.reference_id   IS 'ID del registro origen del evento (FK polimórfica).';
COMMENT ON COLUMN animal_events.reference_table IS 'Tabla de la FK polimórfica (feeding_records, vaccination_records, etc.).';

CREATE INDEX idx_animal_events_animal      ON animal_events(animal_id);
CREATE INDEX idx_animal_events_type        ON animal_events(event_type);
CREATE INDEX idx_animal_events_date        ON animal_events(event_date DESC);
CREATE INDEX idx_animal_events_animal_date ON animal_events(animal_id, event_date DESC);
CREATE INDEX idx_animal_events_desc_trgm   ON animal_events USING gin(description gin_trgm_ops);

-- ────────────────────────────────────────────────────────────
-- 2.5 ESQUEMAS DE VACUNACIÓN (plantillas por especie)
-- Guía de referencia para el esquema esperado. RF015, CU-013
-- ────────────────────────────────────────────────────────────
CREATE TABLE vaccination_schemes (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  species_id           uuid        NOT NULL REFERENCES species(id) ON DELETE CASCADE,
  vaccine_name         text        NOT NULL,
  dose_number          integer     NOT NULL CHECK (dose_number >= 1),
  recommended_age_days integer     CHECK (recommended_age_days > 0),
  interval_days        integer     CHECK (interval_days > 0),
  description          text,
  is_mandatory         boolean     NOT NULL DEFAULT false,
  is_active            boolean     NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE (species_id, vaccine_name, dose_number)
);

COMMENT ON TABLE vaccination_schemes IS 'Esquema de vacunación de referencia por especie. RF015, CU-013.';

CREATE INDEX idx_vacc_scheme_species ON vaccination_schemes(species_id);

-- ────────────────────────────────────────────────────────────

-- ============================================================
-- MÓDULO 4 (TABLAS BASE): supply_categories y supplies
-- Movido antes de M2 porque vaccination_records, feeding_records
-- y health_treatments referencian supplies(id)
-- ============================================================

-- MÓDULO 4: INSUMOS Y BODEGA
-- Tablas: supply_categories, supplies, stock_movements, stock_alerts
-- RF: RF019-RF028 | CU: CU-017 a CU-025
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 4.1 CATEGORÍAS DE INSUMOS
-- RF020, CU-018
-- ────────────────────────────────────────────────────────────
CREATE TABLE supply_categories (
  id          uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text            NOT NULL UNIQUE,
  category    supply_category NOT NULL,
  description text,
  is_active   boolean         NOT NULL DEFAULT true,
  created_at  timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE supply_categories IS 'Categorías de insumos de bodega. RF020, CU-018.';

-- Categorías iniciales
INSERT INTO supply_categories (name, category, description) VALUES
  ('Alimentos concentrados',  'alimento',    'Concentrados y balanceados para animales'),
  ('Forrajes y pastos',       'alimento',    'Heno, silo, pasto fresco'),
  ('Suplementos nutricionales','alimento',   'Vitaminas y minerales alimenticios'),
  ('Antibióticos',            'medicamento', 'Antibióticos veterinarios'),
  ('Antiparasitarios',        'medicamento', 'Desparasitantes internos y externos'),
  ('Vacunas',                 'medicamento', 'Biológicos y vacunas veterinarias'),
  ('Analgésicos y AINE',      'medicamento', 'Anti-inflamatorios y analgésicos'),
  ('Desinfectantes',          'otro',        'Productos de limpieza e higiene'),
  ('Equipos e insumos',       'otro',        'Materiales y equipos diversos');

-- ────────────────────────────────────────────────────────────
-- 4.2 INSUMOS (INVENTARIO DE BODEGA)
-- RF019, RF020, RF021, CU-017, CU-018, CU-019, CU-020
-- ────────────────────────────────────────────────────────────
CREATE TABLE supplies (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text        NOT NULL UNIQUE,   -- generado por trigger
  name            text        NOT NULL,
  category_id     uuid        NOT NULL REFERENCES supply_categories(id) ON DELETE RESTRICT,
  unit            text        NOT NULL,          -- kg, litros, unidades, dosis, etc.
  current_stock   numeric(14,3) NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
  min_stock       numeric(14,3) NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  unit_price      numeric(12,2) CHECK (unit_price >= 0),
  expiry_date     date,
  supplier        text,
  batch_number    text,                          -- lote del fabricante
  notes           text,
  is_active       boolean     NOT NULL DEFAULT true,
  registered_by   uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- NOTA: validación de fecha vencimiento para medicamentos
  -- se aplica vía trigger fn_validate_supply_expiry (ver sección triggers)
  CONSTRAINT chk_name_not_empty
    CHECK (length(trim(name)) >= 2)
);

COMMENT ON TABLE  supplies IS 'Inventario de insumos de bodega. RF019-RF028, CU-017 a CU-025.';
COMMENT ON COLUMN supplies.code          IS 'Código único del insumo generado por trigger.';
COMMENT ON COLUMN supplies.current_stock IS 'Stock actual. Nunca modificar directamente; usar stock_movements.';
COMMENT ON COLUMN supplies.min_stock     IS 'Umbral mínimo para generación de alerta. RF028, CU-025.';
COMMENT ON COLUMN supplies.expiry_date   IS 'Obligatoria para medicamentos. RF019.';

-- Secuencia para código de insumos
CREATE SEQUENCE supply_seq START 1;

CREATE INDEX idx_supplies_category     ON supplies(category_id);
CREATE INDEX idx_supplies_is_active    ON supplies(is_active);
CREATE INDEX idx_supplies_current_stock ON supplies(current_stock);
CREATE INDEX idx_supplies_expiry       ON supplies(expiry_date);
CREATE INDEX idx_supplies_name_trgm    ON supplies USING gin(name gin_trgm_ops);

-- ────────────────────────────────────────────────────────────

-- ────────────────────────────────────────────────────────────
-- Trigger: validar fecha de vencimiento en medicamentos
-- Reemplaza el CHECK con subconsulta (no permitido en PostgreSQL)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_validate_supply_expiry()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_cat supply_category;
BEGIN
  SELECT sc.category INTO v_cat
  FROM supply_categories sc WHERE sc.id = NEW.category_id;
  IF v_cat = 'medicamento' AND NEW.expiry_date IS NULL THEN
    RAISE EXCEPTION 'Los medicamentos deben tener fecha de vencimiento (expiry_date).';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_supply_expiry
  BEFORE INSERT OR UPDATE ON supplies
  FOR EACH ROW EXECUTE FUNCTION fn_validate_supply_expiry();

-- 2.6 REGISTROS DE VACUNACIÓN POR ANIMAL
-- RF015, CU-013
-- ────────────────────────────────────────────────────────────
CREATE TABLE vaccination_records (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id       uuid        NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  vaccine_name    text        NOT NULL,
  dose_number     integer     NOT NULL DEFAULT 1 CHECK (dose_number >= 1),
  applied_at      date        NOT NULL CHECK (applied_at <= current_date),
  next_dose_date  date        CHECK (next_dose_date > applied_at),
  lot_number      text,
  supply_id       uuid        REFERENCES supplies(id) ON DELETE SET NULL,  -- lote en bodega
  responsible     text        NOT NULL,
  notes           text,
  registered_by   uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  vaccination_records IS 'Historial de vacunas aplicadas por animal. RF015, CU-013.';
COMMENT ON COLUMN vaccination_records.next_dose_date IS 'Fecha de próxima dosis. Si NULL, no se esperan dosis adicionales.';
COMMENT ON COLUMN vaccination_records.supply_id      IS 'Vínculo al lote del medicamento en bodega. RF015.';

CREATE INDEX idx_vacc_records_animal         ON vaccination_records(animal_id);
CREATE INDEX idx_vacc_records_next_dose      ON vaccination_records(next_dose_date);
CREATE INDEX idx_vacc_records_animal_vaccine ON vaccination_records(animal_id, vaccine_name);

-- ────────────────────────────────────────────────────────────
-- 2.7 REGISTRO DE ALIMENTACIÓN
-- RF014, CU-012
-- ────────────────────────────────────────────────────────────
CREATE TABLE feeding_records (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id      uuid         NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  supply_id      uuid         NOT NULL REFERENCES supplies(id) ON DELETE RESTRICT,
  quantity        numeric(10,3) NOT NULL CHECK (quantity >= 0.01),
  unit           text         NOT NULL,
  fed_at         timestamptz  NOT NULL DEFAULT now(),
  notes          text,
  registered_by  uuid         NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at     timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  feeding_records IS 'Registro de suministro de alimento por animal. RF014, CU-012.';
COMMENT ON COLUMN feeding_records.supply_id IS 'Insumo consumido. Dispara descuento de stock en bodega. RF014, RF025.';

CREATE INDEX idx_feeding_animal     ON feeding_records(animal_id);
CREATE INDEX idx_feeding_supply     ON feeding_records(supply_id);
CREATE INDEX idx_feeding_fed_at     ON feeding_records(fed_at DESC);

-- ────────────────────────────────────────────────────────────
-- 2.8 EVENTOS DE SALUD
-- RF016, CU-014
-- ────────────────────────────────────────────────────────────
CREATE TABLE health_events (
  id               uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id        uuid              NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  event_type       health_event_type NOT NULL,
  detected_at      date              NOT NULL CHECK (detected_at <= current_date),
  description      text              NOT NULL,
  diagnosis        text,
  recovery_status  recovery_status   NOT NULL DEFAULT 'en_tratamiento',
  resolved_at      date              CHECK (resolved_at IS NULL OR resolved_at >= detected_at),
  notes            text,
  is_correction    boolean           NOT NULL DEFAULT false,
  corrects_id      uuid              REFERENCES health_events(id) ON DELETE SET NULL,
  registered_by    uuid              NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at       timestamptz       NOT NULL DEFAULT now(),
  updated_at       timestamptz       NOT NULL DEFAULT now(),

  CONSTRAINT chk_resolved_if_recovered
    CHECK (recovery_status NOT IN ('recuperado','fallecido') OR resolved_at IS NOT NULL)
);

COMMENT ON TABLE  health_events IS 'Eventos de enfermedad o incidente de salud por animal. RF016, CU-014.';
COMMENT ON COLUMN health_events.is_correction IS 'Si true, este evento corrige un registro previo señalado en corrects_id.';

CREATE INDEX idx_health_events_animal  ON health_events(animal_id);
CREATE INDEX idx_health_events_date    ON health_events(detected_at DESC);
CREATE INDEX idx_health_events_status  ON health_events(recovery_status);

-- ────────────────────────────────────────────────────────────
-- 2.9 TRATAMIENTOS DE SALUD (ligados a health_events)
-- RF016, CU-014
-- ────────────────────────────────────────────────────────────
CREATE TABLE health_treatments (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  health_event_id  uuid         NOT NULL REFERENCES health_events(id) ON DELETE CASCADE,
  supply_id        uuid         REFERENCES supplies(id) ON DELETE SET NULL,
  medication_name  text         NOT NULL,
  dose             text,
  dose_quantity    numeric(8,3),
  dose_unit        text,
  applied_at       date         NOT NULL CHECK (applied_at <= current_date),
  responsible      text         NOT NULL,
  notes            text,
  registered_by    uuid         NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at       timestamptz  NOT NULL DEFAULT now()
);

COMMENT ON TABLE  health_treatments IS 'Tratamientos aplicados dentro de un evento de salud. RF016, CU-014.';
COMMENT ON COLUMN health_treatments.supply_id IS 'Medicamento del inventario. Dispara descuento de stock. RF016, RF025.';

CREATE INDEX idx_health_treat_event  ON health_treatments(health_event_id);
CREATE INDEX idx_health_treat_supply ON health_treatments(supply_id);

-- ============================================================
-- MÓDULO 3: REPRODUCTIVO / CRÍAS
-- Tablas: reproductive_events, births, offspring
-- RF: RF017-RF018 | CU: CU-015, CU-016
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 3.1 EVENTOS REPRODUCTIVOS
-- RF017, CU-015
-- ────────────────────────────────────────────────────────────
CREATE TABLE reproductive_events (
  id                   uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
  female_animal_id     uuid                     NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  event_type           reproductive_event_type  NOT NULL,
  event_date           date                     NOT NULL CHECK (event_date <= current_date),

  -- Progenitor macho
  male_animal_id       uuid                     REFERENCES animals(id) ON DELETE SET NULL,
  male_external        text,                    -- si el macho no está en el sistema

  -- Gestación
  gestation_status     gestation_status         NOT NULL DEFAULT 'en_seguimiento',
  estimated_birth_date date,
  actual_birth_date    date,

  -- Razón de fallo (si aplica)
  failure_reason       text,

  notes                text,
  registered_by        uuid                     NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at           timestamptz              NOT NULL DEFAULT now(),
  updated_at           timestamptz              NOT NULL DEFAULT now(),

  -- Solo un evento activo de gestación por hembra
  CONSTRAINT chk_male_not_both
    CHECK (NOT (male_animal_id IS NOT NULL AND male_external IS NOT NULL)),
  CONSTRAINT chk_estimated_birth_after_event
    CHECK (estimated_birth_date IS NULL OR estimated_birth_date > event_date),
  CONSTRAINT chk_actual_birth_after_event
    CHECK (actual_birth_date IS NULL OR actual_birth_date >= event_date)
);

COMMENT ON TABLE  reproductive_events IS 'Eventos del proceso reproductivo (monta/inseminacion y gestacion). RF017, CU-015.';
COMMENT ON COLUMN reproductive_events.estimated_birth_date IS 'Calculada automáticamente (trigger) según especie si no se ingresa. CU-015.';
COMMENT ON COLUMN reproductive_events.gestation_status IS 'en_seguimiento | confirmada | fallida | parto_exitoso.';

CREATE INDEX idx_repro_female          ON reproductive_events(female_animal_id);
CREATE INDEX idx_repro_male            ON reproductive_events(male_animal_id);
CREATE INDEX idx_repro_status          ON reproductive_events(gestation_status);
CREATE INDEX idx_repro_estimated_birth ON reproductive_events(estimated_birth_date);
CREATE INDEX idx_repro_created_at      ON reproductive_events(created_at DESC);

-- Índice parcial: solo una gestación activa por hembra
CREATE UNIQUE INDEX idx_repro_one_active_per_female
  ON reproductive_events(female_animal_id)
  WHERE gestation_status IN ('en_seguimiento','confirmada');

-- ────────────────────────────────────────────────────────────
-- 3.2 PARTOS
-- RF018, CU-016
-- ────────────────────────────────────────────────────────────
CREATE TABLE births (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  reproductive_event_id   uuid        REFERENCES reproductive_events(id) ON DELETE SET NULL,
  mother_id               uuid        NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  birth_date              date        NOT NULL CHECK (birth_date <= current_date),
  birth_time              time,
  total_born              integer     NOT NULL CHECK (total_born >= 1),
  total_alive             integer     NOT NULL CHECK (total_alive >= 0),
  total_dead              integer     NOT NULL CHECK (total_dead >= 0),
  assistance_required     boolean     NOT NULL DEFAULT false,
  complications           text,
  notes                   text,
  registered_by           uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_totals_match
    CHECK (total_alive + total_dead = total_born),
  CONSTRAINT chk_alive_lte_born
    CHECK (total_alive <= total_born)
);

COMMENT ON TABLE  births IS 'Registro de partos. Cabecera del nacimiento de crías. RF018, CU-016.';
COMMENT ON COLUMN births.total_born  IS 'Total de crías nacidas (vivas + muertas al nacer).';
COMMENT ON COLUMN births.total_alive IS 'Crías nacidas vivas (se registrarán en animals).';

CREATE INDEX idx_births_mother        ON births(mother_id);
CREATE INDEX idx_births_repro_event   ON births(reproductive_event_id);
CREATE INDEX idx_births_date          ON births(birth_date DESC);

-- ────────────────────────────────────────────────────────────
-- 3.3 CRÍAS INDIVIDUALES (detalle por nacimiento)
-- RF018, CU-016
-- ────────────────────────────────────────────────────────────
CREATE TABLE offspring (
  id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  birth_id      uuid         NOT NULL REFERENCES births(id) ON DELETE CASCADE,
  animal_id     uuid         REFERENCES animals(id) ON DELETE SET NULL,  -- NULL si nació muerta
  sex           animal_sex   NOT NULL,
  weight_kg     numeric(6,3) NOT NULL CHECK (weight_kg >= 0.1),
  birth_status  birth_status NOT NULL,
  notes         text,
  created_at    timestamptz  NOT NULL DEFAULT now(),

  -- Solo las crías vivas tienen animal_id
  CONSTRAINT chk_alive_has_animal_id
    CHECK (birth_status != 'vivo' OR animal_id IS NOT NULL),
  CONSTRAINT chk_dead_no_animal_id
    CHECK (birth_status != 'muerto_al_nacer' OR animal_id IS NULL)
);

COMMENT ON TABLE  offspring IS 'Detalle de cada cría individual por parto. RF018, CU-016.';
COMMENT ON COLUMN offspring.animal_id IS 'Referencia al registro del animal creado en inventario. Solo crías vivas.';

CREATE INDEX idx_offspring_birth   ON offspring(birth_id);
CREATE INDEX idx_offspring_animal  ON offspring(animal_id);

-- ============================================================

-- ============================================================
-- MÓDULO 4 (CONTINUACIÓN): stock_movements y stock_alerts
-- ============================================================

-- 4.3 MOVIMIENTOS DE STOCK
-- Fuente única de verdad para cambios de inventario.
-- RF024-RF026, CU-021, CU-022, CU-023
-- ────────────────────────────────────────────────────────────
CREATE TABLE stock_movements (
  id                uuid                  PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id         uuid                  NOT NULL REFERENCES supplies(id) ON DELETE RESTRICT,
  movement_type     stock_movement_type   NOT NULL,
  reason            stock_movement_reason NOT NULL,
  quantity          numeric(14,3)         NOT NULL CHECK (quantity > 0),
  balance_before    numeric(14,3)         NOT NULL CHECK (balance_before >= 0),
  balance_after     numeric(14,3)         NOT NULL CHECK (balance_after >= 0),

  -- Trazabilidad del consumo
  animal_id         uuid                  REFERENCES animals(id) ON DELETE SET NULL,
  feeding_record_id uuid                  REFERENCES feeding_records(id) ON DELETE SET NULL,
  health_event_id   uuid                  REFERENCES health_events(id) ON DELETE SET NULL,
  health_treatment_id uuid                REFERENCES health_treatments(id) ON DELETE SET NULL,
  vaccination_record_id uuid              REFERENCES vaccination_records(id) ON DELETE SET NULL,

  -- Documentación de entrada
  reference_number  text,                 -- número de factura/remisión
  supplier          text,
  unit_cost         numeric(12,2)         CHECK (unit_cost >= 0),
  new_expiry_date   date,                 -- nueva fecha de vencimiento al agregar lote

  notes             text,
  registered_by     uuid                  NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at        timestamptz           NOT NULL DEFAULT now(),

  -- Coherencia de saldos
  CONSTRAINT chk_balance_entrada
    CHECK (movement_type != 'entrada' OR balance_after = balance_before + quantity),
  CONSTRAINT chk_balance_salida
    CHECK (movement_type != 'salida'  OR balance_after = balance_before - quantity),
  CONSTRAINT chk_stock_no_negativo
    CHECK (balance_after >= 0)
);

COMMENT ON TABLE  stock_movements IS 'Registro inmutable de todos los movimientos de stock. RF024-RF026, CU-021 a CU-023.';
COMMENT ON COLUMN stock_movements.balance_before IS 'Stock antes del movimiento.';
COMMENT ON COLUMN stock_movements.balance_after  IS 'Stock después del movimiento. Calculado automáticamente.';

CREATE INDEX idx_stk_mv_supply       ON stock_movements(supply_id);
CREATE INDEX idx_stk_mv_type         ON stock_movements(movement_type);
CREATE INDEX idx_stk_mv_reason       ON stock_movements(reason);
CREATE INDEX idx_stk_mv_animal       ON stock_movements(animal_id);
CREATE INDEX idx_stk_mv_created_at   ON stock_movements(created_at DESC);
CREATE INDEX idx_stk_mv_supply_date  ON stock_movements(supply_id, created_at DESC);

-- ────────────────────────────────────────────────────────────
-- 4.4 ALERTAS DE STOCK
-- RF028, CU-025
-- ────────────────────────────────────────────────────────────
CREATE TABLE stock_alerts (
  id               uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id        uuid         NOT NULL REFERENCES supplies(id) ON DELETE CASCADE,
  alert_type       alert_type   NOT NULL,
  threshold_value  numeric(14,3) NOT NULL,   -- stock mínimo o días para vencer
  current_value    numeric(14,3) NOT NULL,   -- stock actual al momento de la alerta
  status           alert_status NOT NULL DEFAULT 'activa',
  attended_by      uuid         REFERENCES profiles(id) ON DELETE SET NULL,
  attended_at      timestamptz,
  attendance_notes text,
  created_at       timestamptz  NOT NULL DEFAULT now(),
  updated_at       timestamptz  NOT NULL DEFAULT now(),

  -- Cerrar automáticamente si el stock ya se repuso
  auto_closed_at   timestamptz,
  auto_close_reason text
);

COMMENT ON TABLE  stock_alerts IS 'Alertas de stock bajo, agotado o próximo a vencer. RF028, CU-025.';
COMMENT ON COLUMN stock_alerts.alert_type IS 'stock_bajo | stock_agotado | proximo_vencer | vencido.';

-- Solo una alerta activa del mismo tipo por insumo
CREATE UNIQUE INDEX idx_stock_alerts_one_active
  ON stock_alerts(supply_id, alert_type)
  WHERE status = 'activa';

CREATE INDEX idx_stock_alerts_supply  ON stock_alerts(supply_id);
CREATE INDEX idx_stock_alerts_status  ON stock_alerts(status);
CREATE INDEX idx_stock_alerts_type    ON stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_created ON stock_alerts(created_at DESC);

-- ============================================================
-- MÓDULO 5: PRODUCCIÓN
-- Tablas: milk_production, egg_production
-- RF: RF029-RF030 | CU: CU-026, CU-027
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 5.1 PRODUCCIÓN DE LECHE (vacas)
-- RF029, CU-026
-- ────────────────────────────────────────────────────────────
CREATE TABLE milk_production (
  id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id       uuid            NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  production_date date            NOT NULL CHECK (production_date <= current_date),
  shift           production_shift NOT NULL,
  quantity_liters numeric(8,3)    NOT NULL CHECK (quantity_liters >= 0),
  quality_notes   text,           -- notas de calidad (color, olor, presencia de mastitis, etc.)
  notes           text,
  registered_by   uuid            NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at      timestamptz     NOT NULL DEFAULT now(),

  -- Evitar duplicados (un registro por vaca × día × turno)
  UNIQUE (animal_id, production_date, shift)
);

COMMENT ON TABLE  milk_production IS 'Produccion diaria de leche por vaca. RF029, CU-026.';
COMMENT ON COLUMN milk_production.quantity_liters IS 'Litros producidos. Puede ser 0 (ausencia documentada).';
COMMENT ON COLUMN milk_production.shift           IS 'Turno: manana | tarde | noche. RF029.';

CREATE INDEX idx_milk_animal       ON milk_production(animal_id);
CREATE INDEX idx_milk_date         ON milk_production(production_date DESC);
CREATE INDEX idx_milk_animal_date  ON milk_production(animal_id, production_date DESC);

-- ────────────────────────────────────────────────────────────
-- 5.2 PRODUCCIÓN DE HUEVOS (gallinas)
-- Se registra por lote o por animal individual.
-- RF029, CU-026
-- ────────────────────────────────────────────────────────────
CREATE TABLE egg_production (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Un registro puede ser por animal individual o por lote (texto libre)
  animal_id        uuid        REFERENCES animals(id) ON DELETE CASCADE,
  lot_name         text,       -- nombre del lote cuando no es por animal individual
  production_date  date        NOT NULL CHECK (production_date <= current_date),
  quantity_units   integer     NOT NULL CHECK (quantity_units >= 0),
  discarded_units  integer     NOT NULL DEFAULT 0 CHECK (discarded_units >= 0),
  notes            text,
  registered_by    uuid        NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at       timestamptz NOT NULL DEFAULT now(),

  -- Debe tener animal_id o lot_name, no ambos ni ninguno
  CONSTRAINT chk_egg_source
    CHECK (
      (animal_id IS NOT NULL AND lot_name IS NULL) OR
      (animal_id IS NULL     AND lot_name IS NOT NULL)
    ),
  CONSTRAINT chk_discarded_lte_quantity
    CHECK (discarded_units <= quantity_units),

  -- Unicidad: un registro por animal×fecha o lote×fecha
  UNIQUE NULLS NOT DISTINCT (animal_id, lot_name, production_date)
);

COMMENT ON TABLE  egg_production IS 'Produccion diaria de huevos por animal o por lote. RF029, CU-026.';
COMMENT ON COLUMN egg_production.lot_name       IS 'Nombre del lote cuando no se registra por animal individual.';
COMMENT ON COLUMN egg_production.discarded_units IS 'Huevos rotos o descartados del total recolectado.';

CREATE INDEX idx_egg_animal        ON egg_production(animal_id);
CREATE INDEX idx_egg_lot           ON egg_production(lot_name);
CREATE INDEX idx_egg_date          ON egg_production(production_date DESC);

-- ============================================================
-- TRIGGERS Y FUNCIONES DE NEGOCIO
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- T1. updated_at automático
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_animals_updated_at
  BEFORE UPDATE ON animals
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_health_events_updated_at
  BEFORE UPDATE ON health_events
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_repro_events_updated_at
  BEFORE UPDATE ON reproductive_events
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_supplies_updated_at
  BEFORE UPDATE ON supplies
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_stock_alerts_updated_at
  BEFORE UPDATE ON stock_alerts
  FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- ────────────────────────────────────────────────────────────
-- T2. Generación automática del código del animal
-- Formato: VAC-2025-00042
-- CU-007, RF007
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_generate_animal_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_prefix   char(3);
  v_year     text;
  v_seq      bigint;
  v_seq_name text;
BEGIN
  SELECT code_prefix INTO v_prefix
    FROM species WHERE id = NEW.species_id;

  v_year := to_char(now(), 'YYYY');

  v_seq_name := 'animal_seq_' || lower(v_prefix);

  EXECUTE format('SELECT nextval(%L)', v_seq_name) INTO v_seq;

  NEW.code := v_prefix || '-' || v_year || '-' || lpad(v_seq::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_animal_code
  BEFORE INSERT ON animals
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION fn_generate_animal_code();

-- ────────────────────────────────────────────────────────────
-- T3. Generación automática del código del insumo
-- Formato: INS-YYYYMMDD-00001
-- CU-017, RF019
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_generate_supply_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_seq bigint;
BEGIN
  SELECT nextval('supply_seq') INTO v_seq;
  NEW.code := 'INS-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(v_seq::text, 5, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_supply_code
  BEFORE INSERT ON supplies
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION fn_generate_supply_code();

-- ────────────────────────────────────────────────────────────
-- T4. Movimiento de stock → actualiza current_stock en supplies
-- RF024, RF025, CU-021, CU-022
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_apply_stock_movement()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_current numeric(14,3);
BEGIN
  -- Leer stock actual con bloqueo para evitar race conditions
  SELECT current_stock INTO v_current
    FROM supplies WHERE id = NEW.supply_id
    FOR UPDATE;

  -- Guardar saldo previo
  NEW.balance_before := v_current;

  -- Calcular saldo nuevo
  CASE NEW.movement_type
    WHEN 'entrada' THEN
      NEW.balance_after := v_current + NEW.quantity;
    WHEN 'salida' THEN
      IF v_current < NEW.quantity THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %, Solicitado: %', v_current, NEW.quantity;
      END IF;
      NEW.balance_after := v_current - NEW.quantity;
    WHEN 'ajuste' THEN
      NEW.balance_after := NEW.quantity; -- ajuste absoluto
  END CASE;

  -- Actualizar stock en supplies
  UPDATE supplies SET
    current_stock = NEW.balance_after,
    expiry_date   = COALESCE(NEW.new_expiry_date, expiry_date),
    updated_at    = now()
  WHERE id = NEW.supply_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_stock_movement
  BEFORE INSERT ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION fn_apply_stock_movement();

-- ────────────────────────────────────────────────────────────
-- T5. Evalúa alertas de stock tras cada movimiento de salida
-- RF028, CU-025
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_evaluate_stock_alert()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_supply  supplies%ROWTYPE;
  v_tipo    alert_type;
BEGIN
  SELECT * INTO v_supply FROM supplies WHERE id = NEW.supply_id;

  -- Determinar tipo de alerta
  IF v_supply.current_stock = 0 THEN
    v_tipo := 'stock_agotado';
  ELSIF v_supply.current_stock <= v_supply.min_stock AND v_supply.min_stock > 0 THEN
    v_tipo := 'stock_bajo';
  ELSE
    -- Stock OK → cerrar alertas activas de stock para este insumo
    UPDATE stock_alerts
      SET status = 'cerrada_automaticamente',
          auto_closed_at = now(),
          auto_close_reason = 'Stock repuesto',
          updated_at = now()
    WHERE supply_id = NEW.supply_id
      AND alert_type IN ('stock_bajo','stock_agotado')
      AND status = 'activa';
    RETURN NEW;
  END IF;

  -- Insertar alerta (si no existe activa del mismo tipo)
  INSERT INTO stock_alerts (supply_id, alert_type, threshold_value, current_value)
  VALUES (NEW.supply_id, v_tipo, v_supply.min_stock, v_supply.current_stock)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_evaluate_stock_alert
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  WHEN (NEW.movement_type IN ('salida','ajuste'))
  EXECUTE FUNCTION fn_evaluate_stock_alert();

-- ────────────────────────────────────────────────────────────
-- T6. Alertas de vencimiento de insumos (revisión diaria)
-- Se llama desde un cron job de Supabase (pg_cron o Edge Function)
-- RF028, CU-025
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_check_expiry_alerts()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  -- Vencidos hoy o antes
  INSERT INTO stock_alerts (supply_id, alert_type, threshold_value, current_value)
  SELECT id, 'vencido'::alert_type, 0, current_stock
  FROM supplies
  WHERE is_active = true
    AND expiry_date IS NOT NULL
    AND expiry_date < current_date
  ON CONFLICT DO NOTHING;

  -- Próximos a vencer (30 días)
  INSERT INTO stock_alerts (supply_id, alert_type, threshold_value, current_value)
  SELECT id, 'proximo_vencer'::alert_type,
         30,
         (expiry_date - current_date)::numeric
  FROM supplies
  WHERE is_active = true
    AND expiry_date IS NOT NULL
    AND expiry_date BETWEEN current_date AND current_date + interval '30 days'
  ON CONFLICT DO NOTHING;
END;
$$;

COMMENT ON FUNCTION fn_check_expiry_alerts IS 'Llamar diariamente desde cron. Genera alertas de vencimiento. RF028.';

-- ────────────────────────────────────────────────────────────
-- T7. Cálculo automático de fecha estimada de parto
-- CU-015, RF017
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_calculate_estimated_birth()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_gestation_days integer;
BEGIN
  IF NEW.estimated_birth_date IS NULL THEN
    SELECT s.gestation_days INTO v_gestation_days
      FROM animals a
      JOIN species s ON s.id = a.species_id
     WHERE a.id = NEW.female_animal_id;

    IF v_gestation_days IS NOT NULL THEN
      NEW.estimated_birth_date := NEW.event_date + v_gestation_days;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_calc_estimated_birth
  BEFORE INSERT OR UPDATE ON reproductive_events
  FOR EACH ROW EXECUTE FUNCTION fn_calculate_estimated_birth();

-- ────────────────────────────────────────────────────────────
-- T8. Al cerrar un evento reproductivo como parto_exitoso →
--     actualizar estado reproductivo de la madre
-- CU-016, RF018
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_repro_status_on_birth()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.gestation_status = 'parto_exitoso' AND
     OLD.gestation_status != 'parto_exitoso' THEN
    UPDATE animals
      SET reproductive_status = 'sin_gestion_activa',
          updated_at = now()
    WHERE id = NEW.female_animal_id;
  ELSIF NEW.gestation_status = 'fallida' AND
        OLD.gestation_status != 'fallida' THEN
    UPDATE animals
      SET reproductive_status = 'sin_gestion_activa',
          updated_at = now()
    WHERE id = NEW.female_animal_id;
  ELSIF NEW.gestation_status IN ('en_seguimiento','confirmada') AND
        OLD.gestation_status NOT IN ('en_seguimiento','confirmada') THEN
    UPDATE animals
      SET reproductive_status = 'en_gestion',
          updated_at = now()
    WHERE id = NEW.female_animal_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_repro_status_sync
  AFTER UPDATE ON reproductive_events
  FOR EACH ROW EXECUTE FUNCTION fn_update_repro_status_on_birth();

-- Al insertar un nuevo evento activo → poner animal en gestación
CREATE OR REPLACE FUNCTION fn_set_animal_in_gestation()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.gestation_status IN ('en_seguimiento','confirmada') THEN
    UPDATE animals
      SET reproductive_status = 'en_gestion', updated_at = now()
    WHERE id = NEW.female_animal_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_animal_in_gestation
  AFTER INSERT ON reproductive_events
  FOR EACH ROW EXECUTE FUNCTION fn_set_animal_in_gestation();

-- ────────────────────────────────────────────────────────────
-- T9. Evento de salud con status=fallecido → egresa el animal
-- CU-014, RF016
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_handle_animal_death()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.recovery_status = 'fallecido' AND
     (OLD.recovery_status IS NULL OR OLD.recovery_status != 'fallecido') THEN
    UPDATE animals
      SET status        = 'egresado',
          health_status = 'fallecido',
          egress_reason = 'muerte',
          egress_date   = COALESCE(NEW.resolved_at, current_date),
          egress_notes  = 'Egresado automáticamente por evento de salud ID: ' || NEW.id,
          updated_at    = now()
    WHERE id = NEW.animal_id
      AND status = 'activo';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_animal_death
  AFTER INSERT OR UPDATE ON health_events
  FOR EACH ROW EXECUTE FUNCTION fn_handle_animal_death();

-- ────────────────────────────────────────────────────────────
-- T10. Evalúa estado del esquema de vacunación tras cada registro
-- CU-013, RF015
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_vaccination_status()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_animal_id uuid;
  v_has_overdue boolean;
  v_has_pending boolean;
  v_new_status  vaccination_status;
BEGIN
  v_animal_id := COALESCE(NEW.animal_id, OLD.animal_id);

  -- Verificar vacunas vencidas (next_dose_date < hoy)
  SELECT EXISTS(
    SELECT 1 FROM vaccination_records
    WHERE animal_id = v_animal_id
      AND next_dose_date IS NOT NULL
      AND next_dose_date < current_date
  ) INTO v_has_overdue;

  -- Verificar vacunas pendientes (next_dose_date en los próximos 7 días)
  SELECT EXISTS(
    SELECT 1 FROM vaccination_records
    WHERE animal_id = v_animal_id
      AND next_dose_date IS NOT NULL
      AND next_dose_date BETWEEN current_date AND current_date + 7
  ) INTO v_has_pending;

  IF v_has_overdue THEN
    v_new_status := 'vencido';
  ELSIF v_has_pending THEN
    v_new_status := 'pendiente';
  ELSE
    v_new_status := 'al_dia';
  END IF;

  UPDATE animals
    SET vaccination_status = v_new_status, updated_at = now()
  WHERE id = v_animal_id;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vaccination_status
  AFTER INSERT OR UPDATE OR DELETE ON vaccination_records
  FOR EACH ROW EXECUTE FUNCTION fn_update_vaccination_status();

-- ────────────────────────────────────────────────────────────
-- T11. Registro automático en historial de animal
-- RF012, CU-011
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_log_feeding_to_history()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_supply_name text;
BEGIN
  SELECT name INTO v_supply_name FROM supplies WHERE id = NEW.supply_id;
  INSERT INTO animal_events(animal_id, event_type, event_date, title, description,
    metadata, reference_id, reference_table, performed_by)
  VALUES (NEW.animal_id, 'alimentacion', NEW.fed_at,
    'Suministro de alimento',
    'Alimento: ' || v_supply_name || ' — Cantidad: ' || NEW.quantity || ' ' || NEW.unit,
    jsonb_build_object('supply_id', NEW.supply_id, 'quantity', NEW.quantity, 'unit', NEW.unit),
    NEW.id, 'feeding_records', NEW.registered_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_feeding_to_history
  AFTER INSERT ON feeding_records
  FOR EACH ROW EXECUTE FUNCTION fn_log_feeding_to_history();

CREATE OR REPLACE FUNCTION fn_log_vaccination_to_history()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO animal_events(animal_id, event_type, event_date, title, description,
    metadata, reference_id, reference_table, performed_by)
  VALUES (NEW.animal_id, 'vacunacion', NEW.applied_at::timestamptz,
    'Vacuna aplicada: ' || NEW.vaccine_name,
    'Dosis N°' || NEW.dose_number || ' — Responsable: ' || NEW.responsible,
    jsonb_build_object('vaccine_name', NEW.vaccine_name, 'dose_number', NEW.dose_number,
      'next_dose_date', NEW.next_dose_date, 'lot_number', NEW.lot_number),
    NEW.id, 'vaccination_records', NEW.registered_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_vaccination_to_history
  AFTER INSERT ON vaccination_records
  FOR EACH ROW EXECUTE FUNCTION fn_log_vaccination_to_history();

CREATE OR REPLACE FUNCTION fn_log_health_to_history()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO animal_events(animal_id, event_type, event_date, title, description,
    metadata, reference_id, reference_table, performed_by)
  VALUES (NEW.animal_id, 'salud', NEW.detected_at::timestamptz,
    initcap(NEW.event_type::text) || ': ' || left(NEW.description, 80),
    NEW.description,
    jsonb_build_object('event_type', NEW.event_type, 'diagnosis', NEW.diagnosis,
      'recovery_status', NEW.recovery_status),
    NEW.id, 'health_events', NEW.registered_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_health_to_history
  AFTER INSERT ON health_events
  FOR EACH ROW EXECUTE FUNCTION fn_log_health_to_history();

CREATE OR REPLACE FUNCTION fn_log_repro_to_history()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO animal_events(animal_id, event_type, event_date, title, description,
    metadata, reference_id, reference_table, performed_by)
  VALUES (NEW.female_animal_id, 'reproductivo', NEW.event_date::timestamptz,
    initcap(replace(NEW.event_type::text, '_', ' ')),
    'Estado gestación: ' || NEW.gestation_status || ' — Fecha estimada parto: ' ||
      COALESCE(NEW.estimated_birth_date::text, 'Por determinar'),
    jsonb_build_object('event_type', NEW.event_type, 'gestation_status', NEW.gestation_status,
      'estimated_birth_date', NEW.estimated_birth_date, 'male_animal_id', NEW.male_animal_id,
      'male_external', NEW.male_external),
    NEW.id, 'reproductive_events', NEW.registered_by);
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_repro_to_history
  AFTER INSERT ON reproductive_events
  FOR EACH ROW EXECUTE FUNCTION fn_log_repro_to_history();

-- ────────────────────────────────────────────────────────────
-- T12. Trigger de auditoría genérico
-- RNF11, RF005
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_old     jsonb;
  v_new     jsonb;
  v_changed text[];
  v_key     text;
BEGIN
  -- Obtener usuario actual de la sesión Supabase
  BEGIN
    v_user_id := (auth.uid())::uuid;
  EXCEPTION WHEN OTHERS THEN
    v_user_id := NULL;
  END;

  IF TG_OP = 'INSERT' THEN
    v_new := to_jsonb(NEW);
    INSERT INTO audit_log(user_id, table_name, record_id, action, new_data)
    VALUES (v_user_id, TG_TABLE_NAME, v_new->>'id', 'INSERT', v_new);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    v_old := to_jsonb(OLD);
    v_new := to_jsonb(NEW);
    -- Calcular campos cambiados
    SELECT array_agg(key) INTO v_changed
    FROM jsonb_each(v_new) n
    WHERE n.value IS DISTINCT FROM v_old->n.key
      AND n.key NOT IN ('updated_at');
    INSERT INTO audit_log(user_id, table_name, record_id, action, old_data, new_data, changed_fields)
    VALUES (v_user_id, TG_TABLE_NAME, v_new->>'id', 'UPDATE', v_old, v_new, v_changed);
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    v_old := to_jsonb(OLD);
    INSERT INTO audit_log(user_id, table_name, record_id, action, old_data)
    VALUES (v_user_id, TG_TABLE_NAME, v_old->>'id', 'DELETE', v_old);
    RETURN OLD;
  END IF;
END;
$$;

-- Aplicar auditoría a tablas críticas
CREATE TRIGGER trg_audit_animals
  AFTER INSERT OR UPDATE OR DELETE ON animals
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_supplies
  AFTER INSERT OR UPDATE OR DELETE ON supplies
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_reproductive_events
  AFTER INSERT OR UPDATE OR DELETE ON reproductive_events
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_health_events
  AFTER INSERT OR UPDATE OR DELETE ON health_events
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

CREATE TRIGGER trg_audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ============================================================
-- VISTAS (VIEWS) — Consultas frecuentes y reportes
-- RF008, RF012, RF018, RF021, RF027, RF030
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- V1. Inventario activo con datos completos
-- CU-008, RF008
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_animal_inventory AS
SELECT
  a.id,
  a.code,
  s.display_name         AS species,
  b.name                 AS breed,
  a.sex,
  CASE
    WHEN a.birth_date IS NOT NULL
      THEN EXTRACT(DAY FROM now() - a.birth_date::timestamptz)::int
    ELSE NULL
  END                    AS age_days,
  CASE
    WHEN a.birth_date IS NOT NULL
      THEN ROUND(EXTRACT(DAY FROM now() - a.birth_date::timestamptz) / 30.0, 1)
    ELSE NULL
  END                    AS age_months,
  a.current_weight_kg,
  a.origin,
  a.status,
  a.health_status,
  a.reproductive_status,
  a.vaccination_status,
  a.mother_id,
  am.code                AS mother_code,
  a.notes,
  p.full_name            AS registered_by_name,
  a.created_at,
  a.updated_at
FROM animals a
JOIN species  s ON s.id = a.species_id
LEFT JOIN breeds   b  ON b.id = a.breed_id
LEFT JOIN animals  am ON am.id = a.mother_id
LEFT JOIN profiles p  ON p.id = a.registered_by
WHERE a.status = 'activo';

COMMENT ON VIEW vw_animal_inventory IS 'Inventario de animales activos con datos calculados. CU-008, RF008.';

-- ────────────────────────────────────────────────────────────
-- V2. Historial completo del animal (últimos 100 eventos)
-- CU-011, RF012
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_animal_history AS
SELECT
  ae.id,
  ae.animal_id,
  a.code         AS animal_code,
  ae.event_type,
  ae.event_date,
  ae.title,
  ae.description,
  ae.metadata,
  ae.reference_id,
  ae.reference_table,
  p.full_name    AS performed_by_name,
  ae.created_at
FROM animal_events ae
JOIN animals  a ON a.id = ae.animal_id
LEFT JOIN profiles p ON p.id = ae.performed_by
ORDER BY ae.event_date DESC;

COMMENT ON VIEW vw_animal_history IS 'Historial cronológico de eventos por animal. CU-011, RF012.';

-- ────────────────────────────────────────────────────────────
-- V3. Vacunaciones próximas y vencidas
-- CU-013, RF015
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_vaccination_alerts AS
SELECT
  vr.id,
  vr.animal_id,
  a.code              AS animal_code,
  s.display_name      AS species,
  vr.vaccine_name,
  vr.dose_number,
  vr.applied_at,
  vr.next_dose_date,
  (vr.next_dose_date - current_date) AS days_remaining,
  CASE
    WHEN vr.next_dose_date < current_date           THEN 'VENCIDA'
    WHEN vr.next_dose_date <= current_date + 7      THEN 'URGENTE (≤7 días)'
    WHEN vr.next_dose_date <= current_date + 30     THEN 'PRÓXIMA (≤30 días)'
    ELSE 'AL DÍA'
  END                 AS alert_level,
  vr.responsible,
  a.health_status,
  a.status            AS animal_status
FROM vaccination_records vr
JOIN animals a ON a.id = vr.animal_id
JOIN species s ON s.id = a.species_id
WHERE vr.next_dose_date IS NOT NULL
  AND a.status = 'activo'
ORDER BY vr.next_dose_date;

COMMENT ON VIEW vw_vaccination_alerts IS 'Vacunas próximas a vencer o vencidas. CU-013, RF015.';

-- ────────────────────────────────────────────────────────────
-- V4. Gestaciones activas y alertas de parto
-- CU-015, RF017
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_active_gestations AS
SELECT
  re.id,
  re.female_animal_id,
  a.code              AS female_code,
  s.display_name      AS species,
  re.event_type,
  re.event_date,
  re.gestation_status,
  re.estimated_birth_date,
  (re.estimated_birth_date - current_date) AS days_to_birth,
  CASE
    WHEN re.estimated_birth_date < current_date          THEN 'PARTO ESPERADO (atrasado)'
    WHEN re.estimated_birth_date <= current_date + 7     THEN 'PARTO INMINENTE (≤7 días)'
    WHEN re.estimated_birth_date <= current_date + 30    THEN 'PARTO PRÓXIMO (≤30 días)'
    ELSE 'EN GESTACIÓN'
  END                 AS birth_alert,
  am_male.code        AS male_code,
  re.male_external,
  p.full_name         AS registered_by_name
FROM reproductive_events re
JOIN animals a  ON a.id  = re.female_animal_id
JOIN species s  ON s.id  = a.species_id
LEFT JOIN animals am_male ON am_male.id = re.male_animal_id
LEFT JOIN profiles p      ON p.id = re.registered_by
WHERE re.gestation_status IN ('en_seguimiento','confirmada')
  AND a.status = 'activo'
ORDER BY re.estimated_birth_date;

COMMENT ON VIEW vw_active_gestations IS 'Gestaciones activas con alerta de fecha de parto. CU-015, RF017.';

-- ────────────────────────────────────────────────────────────
-- V5. Estado del inventario de insumos
-- CU-018, RF020, RF021
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_supply_inventory AS
SELECT
  su.id,
  su.code,
  su.name,
  sc.name             AS category_name,
  sc.category,
  su.unit,
  su.current_stock,
  su.min_stock,
  CASE
    WHEN su.current_stock = 0                         THEN 'AGOTADO'
    WHEN su.current_stock <= su.min_stock
         AND su.min_stock > 0                         THEN 'STOCK BAJO'
    ELSE 'NORMAL'
  END                 AS stock_status,
  su.expiry_date,
  CASE
    WHEN su.expiry_date IS NULL                       THEN NULL
    WHEN su.expiry_date < current_date                THEN 'VENCIDO'
    WHEN su.expiry_date <= current_date + 30          THEN 'PRÓXIMO A VENCER'
    ELSE 'VIGENTE'
  END                 AS expiry_status,
  (su.expiry_date - current_date) AS days_to_expiry,
  su.unit_price,
  su.current_stock * COALESCE(su.unit_price, 0) AS stock_value,
  su.supplier,
  su.is_active,
  p.full_name         AS registered_by_name,
  su.created_at,
  su.updated_at
FROM supplies su
JOIN supply_categories sc ON sc.id = su.category_id
LEFT JOIN profiles p ON p.id = su.registered_by
WHERE su.is_active = true
ORDER BY sc.category, su.name;

COMMENT ON VIEW vw_supply_inventory IS 'Estado del inventario de insumos con alertas. CU-018, RF020, RF021.';

-- ────────────────────────────────────────────────────────────
-- V6. Reporte diario de producción de leche
-- CU-026, CU-027, RF029, RF030
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_milk_daily_report AS
SELECT
  mp.production_date,
  mp.shift,
  COUNT(DISTINCT mp.animal_id)        AS cows_count,
  SUM(mp.quantity_liters)             AS total_liters,
  ROUND(AVG(mp.quantity_liters), 3)   AS avg_liters_per_cow,
  MAX(mp.quantity_liters)             AS max_liters,
  MIN(mp.quantity_liters)             AS min_liters
FROM milk_production mp
JOIN animals a ON a.id = mp.animal_id
WHERE a.status = 'activo'
GROUP BY mp.production_date, mp.shift
ORDER BY mp.production_date DESC, mp.shift;

COMMENT ON VIEW vw_milk_daily_report IS 'Resumen diario de producción de leche por turno. CU-027, RF030.';

-- ────────────────────────────────────────────────────────────
-- V7. Reporte diario de producción de huevos
-- CU-026, CU-027, RF029, RF030
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_egg_daily_report AS
SELECT
  ep.production_date,
  COALESCE(ep.lot_name, a.code) AS source,
  ep.quantity_units,
  ep.discarded_units,
  ep.quantity_units - ep.discarded_units AS net_units
FROM egg_production ep
LEFT JOIN animals a ON a.id = ep.animal_id
ORDER BY ep.production_date DESC;

COMMENT ON VIEW vw_egg_daily_report IS 'Resumen diario de producción de huevos. CU-027, RF030.';

-- ────────────────────────────────────────────────────────────
-- V8. Alertas activas del sistema (stock + vacunas + partos)
-- Dashboard principal
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW vw_active_alerts AS
-- Alertas de stock
SELECT
  'INSUMO'             AS alert_category,
  sa.alert_type::text  AS alert_type,
  su.code || ' — ' || su.name AS entity_name,
  'Stock: ' || su.current_stock || ' ' || su.unit ||
    ' / Mínimo: ' || su.min_stock || ' ' || su.unit AS detail,
  sa.created_at
FROM stock_alerts sa
JOIN supplies su ON su.id = sa.supply_id
WHERE sa.status = 'activa'

UNION ALL

-- Vacunas vencidas
SELECT
  'VACUNACIÓN',
  'VACUNA VENCIDA',
  a.code || ' — ' || vr.vaccine_name,
  'Dosis ' || vr.dose_number || ' — Debía aplicarse el ' || vr.next_dose_date,
  vr.created_at
FROM vaccination_records vr
JOIN animals a ON a.id = vr.animal_id
WHERE vr.next_dose_date < current_date
  AND a.status = 'activo'

UNION ALL

-- Partos inminentes
SELECT
  'REPRODUCTIVO',
  'PARTO INMINENTE',
  a.code,
  'Fecha estimada: ' || re.estimated_birth_date || ' (' ||
    (re.estimated_birth_date - current_date) || ' días)',
  re.created_at
FROM reproductive_events re
JOIN animals a ON a.id = re.female_animal_id
WHERE re.gestation_status IN ('en_seguimiento','confirmada')
  AND re.estimated_birth_date <= current_date + 7
  AND a.status = 'activo'

ORDER BY created_at DESC;

COMMENT ON VIEW vw_active_alerts IS 'Panel unificado de alertas activas del sistema.';

-- ============================================================
-- FUNCIONES DE NEGOCIO Y UTILIDADES
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- F1. Registrar alimentación y descontar stock automáticamente
-- CU-012, RF014, RF025
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_register_feeding(
  p_animal_id    uuid,
  p_supply_id    uuid,
  p_quantity     numeric,
  p_unit         text,
  p_fed_at       timestamptz DEFAULT now(),
  p_notes        text        DEFAULT NULL,
  p_user_id      uuid        DEFAULT auth.uid()
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_feeding_id uuid;
  v_supply_name text;
BEGIN
  -- Verificar que el animal existe y está activo
  IF NOT EXISTS (SELECT 1 FROM animals WHERE id = p_animal_id AND status = 'activo') THEN
    RAISE EXCEPTION 'Animal no encontrado o inactivo: %', p_animal_id;
  END IF;

  -- Verificar stock disponible
  IF (SELECT current_stock FROM supplies WHERE id = p_supply_id) < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente para el insumo seleccionado';
  END IF;

  -- Crear registro de alimentación
  INSERT INTO feeding_records(animal_id, supply_id, quantity, unit, fed_at, notes, registered_by)
  VALUES (p_animal_id, p_supply_id, p_quantity, p_unit, p_fed_at, p_notes, p_user_id)
  RETURNING id INTO v_feeding_id;

  -- Descontar stock (el trigger fn_apply_stock_movement lo maneja)
  INSERT INTO stock_movements(supply_id, movement_type, reason, quantity,
    balance_before, balance_after, animal_id, feeding_record_id, registered_by)
  SELECT p_supply_id, 'salida', 'consumo_animal', p_quantity,
    current_stock, current_stock - p_quantity,
    p_animal_id, v_feeding_id, p_user_id
  FROM supplies WHERE id = p_supply_id;

  RETURN v_feeding_id;
END;
$$;

COMMENT ON FUNCTION fn_register_feeding IS 'Registra alimentación y descuenta stock atómicamente. CU-012.';

-- ────────────────────────────────────────────────────────────
-- F2. Registrar parto y crear crías en inventario
-- CU-016, RF018 — operación atómica
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_register_birth(
  p_reproductive_event_id uuid,
  p_mother_id             uuid,
  p_birth_date            date,
  p_offspring             jsonb,   -- array: [{sex, weight_kg, birth_status, notes}]
  p_complications         text     DEFAULT NULL,
  p_notes                 text     DEFAULT NULL,
  p_user_id               uuid     DEFAULT auth.uid()
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_birth_id    uuid;
  v_animal_id   uuid;
  v_cria        jsonb;
  v_total       int  := jsonb_array_length(p_offspring);
  v_alive       int  := 0;
  v_dead        int  := 0;
  v_species_id  uuid;
BEGIN
  -- Obtener especie de la madre
  SELECT species_id INTO v_species_id FROM animals WHERE id = p_mother_id;

  -- Contar vivas y muertas
  FOR v_cria IN SELECT * FROM jsonb_array_elements(p_offspring) LOOP
    IF (v_cria->>'birth_status') = 'vivo' THEN
      v_alive := v_alive + 1;
    ELSE
      v_dead := v_dead + 1;
    END IF;
  END LOOP;

  -- Crear cabecera del parto
  INSERT INTO births(reproductive_event_id, mother_id, birth_date, total_born,
    total_alive, total_dead, complications, notes, registered_by)
  VALUES (p_reproductive_event_id, p_mother_id, p_birth_date,
    v_total, v_alive, v_dead, p_complications, p_notes, p_user_id)
  RETURNING id INTO v_birth_id;

  -- Procesar cada cría
  FOR v_cria IN SELECT * FROM jsonb_array_elements(p_offspring) LOOP
    v_animal_id := NULL;

    IF (v_cria->>'birth_status') = 'vivo' THEN
      -- Crear animal en inventario
      INSERT INTO animals(species_id, sex, birth_date, origin, initial_weight_kg,
        current_weight_kg, mother_id, father_id,
        father_external, status, registered_by)
      SELECT
        v_species_id,
        (v_cria->>'sex')::animal_sex,
        p_birth_date,
        'nacido_en_finca',
        (v_cria->>'weight_kg')::numeric,
        (v_cria->>'weight_kg')::numeric,
        p_mother_id,
        re.male_animal_id,
        re.male_external,
        'activo',
        p_user_id
      FROM reproductive_events re WHERE re.id = p_reproductive_event_id
      RETURNING id INTO v_animal_id;

      -- Evento de ingreso en historial
      INSERT INTO animal_events(animal_id, event_type, event_date, title, description,
        metadata, reference_id, reference_table, performed_by)
      VALUES (v_animal_id, 'ingreso', p_birth_date::timestamptz,
        'Nacimiento registrado',
        'Cría registrada a partir del parto ID: ' || v_birth_id,
        jsonb_build_object('birth_id', v_birth_id, 'mother_id', p_mother_id),
        v_birth_id, 'births', p_user_id);
    END IF;

    -- Crear registro de cría individual
    INSERT INTO offspring(birth_id, animal_id, sex, weight_kg, birth_status, notes)
    VALUES (
      v_birth_id,
      v_animal_id,
      (v_cria->>'sex')::animal_sex,
      (v_cria->>'weight_kg')::numeric,
      (v_cria->>'birth_status')::birth_status,
      v_cria->>'notes'
    );
  END LOOP;

  -- Cerrar evento reproductivo
  UPDATE reproductive_events
    SET gestation_status    = 'parto_exitoso',
        actual_birth_date   = p_birth_date,
        updated_at          = now()
  WHERE id = p_reproductive_event_id;

  -- Evento de parto en historial de la madre
  INSERT INTO animal_events(animal_id, event_type, event_date, title, description,
    metadata, reference_id, reference_table, performed_by)
  VALUES (p_mother_id, 'parto', p_birth_date::timestamptz,
    'Parto registrado — ' || v_total || ' crías (' || v_alive || ' vivas)',
    p_notes,
    jsonb_build_object('birth_id', v_birth_id, 'total_born', v_total,
      'total_alive', v_alive, 'total_dead', v_dead),
    v_birth_id, 'births', p_user_id);

  RETURN v_birth_id;
END;
$$;

COMMENT ON FUNCTION fn_register_birth IS 'Registra parto y crea animales en inventario atomicamente. CU-016, RF018.';

-- ────────────────────────────────────────────────────────────
-- F3. Resumen de producción por período
-- CU-027, RF030
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_production_summary(
  p_start_date date,
  p_end_date   date,
  p_animal_id  uuid DEFAULT NULL
)
RETURNS TABLE (
  period           date,
  total_milk_liters numeric,
  milk_cows_count  bigint,
  total_eggs       bigint,
  net_eggs         bigint,
  egg_sources      bigint
) LANGUAGE sql STABLE AS $$
  SELECT
    dates.d                             AS period,
    COALESCE(SUM(mp.quantity_liters),0) AS total_milk_liters,
    COUNT(DISTINCT mp.animal_id)        AS milk_cows_count,
    COALESCE(SUM(ep.quantity_units),0)  AS total_eggs,
    COALESCE(SUM(ep.quantity_units - ep.discarded_units),0) AS net_eggs,
    COUNT(DISTINCT COALESCE(ep.animal_id::text, ep.lot_name)) AS egg_sources
  FROM generate_series(p_start_date, p_end_date, '1 day'::interval) AS dates(d)
  LEFT JOIN milk_production mp
    ON mp.production_date = dates.d
    AND (p_animal_id IS NULL OR mp.animal_id = p_animal_id)
  LEFT JOIN egg_production ep
    ON ep.production_date = dates.d
    AND (p_animal_id IS NULL OR ep.animal_id = p_animal_id)
  GROUP BY dates.d
  ORDER BY dates.d;
$$;

COMMENT ON FUNCTION fn_production_summary IS 'KPIs de producción por período. CU-027, RF030.';

-- ────────────────────────────────────────────────────────────
-- F4. Agregar stock con validaciones
-- CU-021, RF024
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_add_stock(
  p_supply_id        uuid,
  p_quantity         numeric,
  p_reason           stock_movement_reason DEFAULT 'compra',
  p_reference_number text  DEFAULT NULL,
  p_supplier         text  DEFAULT NULL,
  p_unit_cost        numeric DEFAULT NULL,
  p_new_expiry_date  date  DEFAULT NULL,
  p_notes            text  DEFAULT NULL,
  p_user_id          uuid  DEFAULT auth.uid()
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_mv_id uuid;
BEGIN
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor a cero';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM supplies WHERE id = p_supply_id AND is_active = true) THEN
    RAISE EXCEPTION 'Insumo no encontrado o inactivo: %', p_supply_id;
  END IF;

  INSERT INTO stock_movements(supply_id, movement_type, reason, quantity,
    balance_before, balance_after, reference_number, supplier, unit_cost,
    new_expiry_date, notes, registered_by)
  SELECT p_supply_id, 'entrada', p_reason, p_quantity,
    current_stock, current_stock + p_quantity,
    p_reference_number, p_supplier, p_unit_cost,
    p_new_expiry_date, p_notes, p_user_id
  FROM supplies WHERE id = p_supply_id
  RETURNING id INTO v_mv_id;

  RETURN v_mv_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- F5. Descontar stock con validaciones
-- CU-022, RF025
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_deduct_stock(
  p_supply_id    uuid,
  p_quantity     numeric,
  p_reason       stock_movement_reason,
  p_animal_id    uuid DEFAULT NULL,
  p_notes        text DEFAULT NULL,
  p_user_id      uuid DEFAULT auth.uid()
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_current numeric;
  v_mv_id   uuid;
BEGIN
  SELECT current_stock INTO v_current
    FROM supplies WHERE id = p_supply_id FOR UPDATE;

  IF v_current IS NULL THEN
    RAISE EXCEPTION 'Insumo no encontrado: %', p_supply_id;
  END IF;

  IF v_current < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %. Solicitado: %', v_current, p_quantity;
  END IF;

  INSERT INTO stock_movements(supply_id, movement_type, reason, quantity,
    balance_before, balance_after, animal_id, notes, registered_by)
  VALUES (p_supply_id, 'salida', p_reason, p_quantity,
    v_current, v_current - p_quantity, p_animal_id, p_notes, p_user_id)
  RETURNING id INTO v_mv_id;

  RETURN v_mv_id;
END;
$$;

-- ────────────────────────────────────────────────────────────
-- F6. Historial de movimientos de un insumo con filtros
-- CU-023, RF026
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_supply_movements(
  p_supply_id    uuid,
  p_start_date   timestamptz DEFAULT now() - interval '90 days',
  p_end_date     timestamptz DEFAULT now(),
  p_type         stock_movement_type DEFAULT NULL
)
RETURNS TABLE (
  id                uuid,
  movement_type     stock_movement_type,
  reason            stock_movement_reason,
  quantity          numeric,
  balance_before    numeric,
  balance_after     numeric,
  animal_code       text,
  reference_number  text,
  notes             text,
  registered_by     text,
  created_at        timestamptz
) LANGUAGE sql STABLE AS $$
  SELECT
    sm.id, sm.movement_type, sm.reason,
    sm.quantity, sm.balance_before, sm.balance_after,
    a.code, sm.reference_number, sm.notes,
    p.full_name, sm.created_at
  FROM stock_movements sm
  LEFT JOIN animals  a ON a.id = sm.animal_id
  LEFT JOIN profiles p ON p.id = sm.registered_by
  WHERE sm.supply_id = p_supply_id
    AND sm.created_at BETWEEN p_start_date AND p_end_date
    AND (p_type IS NULL OR sm.movement_type = p_type)
  ORDER BY sm.created_at DESC;
$$;

-- ────────────────────────────────────────────────────────────
-- F7. Revisar y actualizar vacunaciones vencidas (cron diario)
-- CU-013, RF015
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_update_all_vaccination_statuses()
RETURNS void LANGUAGE plpgsql AS $$
DECLARE v_animal record;
BEGIN
  FOR v_animal IN SELECT DISTINCT animal_id FROM vaccination_records LOOP
    PERFORM fn_update_vaccination_status_for_animal(v_animal.animal_id);
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION fn_update_vaccination_status_for_animal(p_animal_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
  v_has_overdue boolean;
  v_has_pending boolean;
  v_new_status  vaccination_status;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM vaccination_records
    WHERE animal_id = p_animal_id
      AND next_dose_date IS NOT NULL
      AND next_dose_date < current_date
  ) INTO v_has_overdue;

  SELECT EXISTS(
    SELECT 1 FROM vaccination_records
    WHERE animal_id = p_animal_id
      AND next_dose_date IS NOT NULL
      AND next_dose_date BETWEEN current_date AND current_date + 7
  ) INTO v_has_pending;

  v_new_status := CASE
    WHEN v_has_overdue THEN 'vencido'
    WHEN v_has_pending THEN 'pendiente'
    ELSE 'al_dia'
  END;

  UPDATE animals SET vaccination_status = v_new_status, updated_at = now()
  WHERE id = p_animal_id;
END;
$$;

COMMENT ON FUNCTION fn_update_all_vaccination_statuses IS 'Ejecutar diariamente via cron para actualizar estados de vacunación. RF015.';

-- ============================================================
-- ROW LEVEL SECURITY (RLS) — Supabase
-- RNF04 Protección de datos | RNF05 Control de accesos
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- Función auxiliar: obtiene el rol del usuario autenticado
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_get_user_role()
RETURNS user_role LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION fn_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'administrador' AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION fn_is_encargado_or_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('administrador','encargado')
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION fn_is_active_user()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_active = true
  )
$$;

-- ────────────────────────────────────────────────────────────
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ────────────────────────────────────────────────────────────
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log            ENABLE ROW LEVEL SECURITY;
ALTER TABLE species               ENABLE ROW LEVEL SECURITY;
ALTER TABLE breeds               ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schemes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records  ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeding_records      ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_treatments    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reproductive_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE births               ENABLE ROW LEVEL SECURITY;
ALTER TABLE offspring            ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements      ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production      ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_production       ENABLE ROW LEVEL SECURITY;

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: PROFILES
-- ────────────────────────────────────────────────────────────
-- Cualquier usuario puede ver su propio perfil
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

-- Admins ven todos los perfiles
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (fn_is_admin());

-- Solo el propio usuario actualiza su perfil (excepto rol e is_active)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND is_active = (SELECT is_active FROM profiles WHERE id = auth.uid())
  );

-- Solo admin puede gestionar (crear, actualizar rol, desactivar)
CREATE POLICY "profiles_all_admin"
  ON profiles FOR ALL
  USING (fn_is_admin());

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: AUDIT LOG (solo lectura para admins)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "audit_log_select_admin"
  ON audit_log FOR SELECT
  USING (fn_is_admin());

-- Solo el sistema (SECURITY DEFINER) puede insertar
CREATE POLICY "audit_log_insert_system"
  ON audit_log FOR INSERT
  WITH CHECK (true);  -- controlado por fn_audit_log SECURITY DEFINER

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: TABLAS DE REFERENCIA (todos los activos leen)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "species_select_all"
  ON species FOR SELECT USING (fn_is_active_user());

CREATE POLICY "species_write_admin"
  ON species FOR ALL USING (fn_is_admin());

CREATE POLICY "breeds_select_all"
  ON breeds FOR SELECT USING (fn_is_active_user());

CREATE POLICY "breeds_write_admin"
  ON breeds FOR ALL USING (fn_is_admin());

CREATE POLICY "supply_categories_select_all"
  ON supply_categories FOR SELECT USING (fn_is_active_user());

CREATE POLICY "supply_categories_write_admin"
  ON supply_categories FOR ALL USING (fn_is_admin());

CREATE POLICY "vaccination_schemes_select_all"
  ON vaccination_schemes FOR SELECT USING (fn_is_active_user());

CREATE POLICY "vaccination_schemes_write_admin"
  ON vaccination_schemes FOR ALL USING (fn_is_admin());

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: ANIMALES (todos los activos leen; E/E/A escriben)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "animals_select_all_active"
  ON animals FOR SELECT USING (fn_is_active_user());

CREATE POLICY "animals_insert_active_users"
  ON animals FOR INSERT WITH CHECK (fn_is_active_user());

CREATE POLICY "animals_update_active_users"
  ON animals FOR UPDATE USING (fn_is_active_user());

-- Solo admin puede eliminar (en práctica no se elimina, se egresa)
CREATE POLICY "animals_delete_admin"
  ON animals FOR DELETE USING (fn_is_admin());

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: HISTORIAL DE ANIMAL (inmutable — solo lectura users)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "animal_events_select"
  ON animal_events FOR SELECT USING (fn_is_active_user());

CREATE POLICY "animal_events_insert_system"
  ON animal_events FOR INSERT WITH CHECK (fn_is_active_user());
-- No se permiten UPDATE ni DELETE (historial inmutable)

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: REGISTROS PECUARIOS (vacunación, alimentación, salud)
-- Todos los activos leen y escriben; admin puede eliminar
-- ────────────────────────────────────────────────────────────
CREATE POLICY "feeding_records_select" ON feeding_records FOR SELECT USING (fn_is_active_user());
CREATE POLICY "feeding_records_insert" ON feeding_records FOR INSERT WITH CHECK (fn_is_active_user());
CREATE POLICY "feeding_records_delete_admin" ON feeding_records FOR DELETE USING (fn_is_admin());

CREATE POLICY "vacc_records_select" ON vaccination_records FOR SELECT USING (fn_is_active_user());
CREATE POLICY "vacc_records_insert" ON vaccination_records FOR INSERT WITH CHECK (fn_is_active_user());
CREATE POLICY "vacc_records_delete_admin" ON vaccination_records FOR DELETE USING (fn_is_admin());

CREATE POLICY "health_events_select" ON health_events FOR SELECT USING (fn_is_active_user());
CREATE POLICY "health_events_insert" ON health_events FOR INSERT WITH CHECK (fn_is_active_user());
CREATE POLICY "health_events_update" ON health_events FOR UPDATE USING (fn_is_active_user());
CREATE POLICY "health_events_delete_admin" ON health_events FOR DELETE USING (fn_is_admin());

CREATE POLICY "health_treat_select" ON health_treatments FOR SELECT USING (fn_is_active_user());
CREATE POLICY "health_treat_insert" ON health_treatments FOR INSERT WITH CHECK (fn_is_active_user());
CREATE POLICY "health_treat_delete_admin" ON health_treatments FOR DELETE USING (fn_is_admin());

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: MÓDULO REPRODUCTIVO
-- ────────────────────────────────────────────────────────────
CREATE POLICY "repro_events_select"  ON reproductive_events FOR SELECT USING (fn_is_active_user());
CREATE POLICY "repro_events_insert"  ON reproductive_events FOR INSERT WITH CHECK (fn_is_active_user());
CREATE POLICY "repro_events_update"  ON reproductive_events FOR UPDATE USING (fn_is_active_user());
CREATE POLICY "repro_events_delete"  ON reproductive_events FOR DELETE USING (fn_is_admin());

CREATE POLICY "births_select" ON births FOR SELECT USING (fn_is_active_user());
CREATE POLICY "births_insert" ON births FOR INSERT WITH CHECK (fn_is_active_user());

CREATE POLICY "offspring_select" ON offspring FOR SELECT USING (fn_is_active_user());
CREATE POLICY "offspring_insert" ON offspring FOR INSERT WITH CHECK (fn_is_active_user());

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: INSUMOS Y STOCK
-- Todos leen; solo Encargado/Admin crean y editan insumos
-- Todos pueden registrar movimientos de salida (consumo)
-- ────────────────────────────────────────────────────────────
CREATE POLICY "supplies_select"       ON supplies FOR SELECT USING (fn_is_active_user());
CREATE POLICY "supplies_insert"       ON supplies FOR INSERT WITH CHECK (fn_is_encargado_or_admin());
CREATE POLICY "supplies_update"       ON supplies FOR UPDATE USING (fn_is_encargado_or_admin());
CREATE POLICY "supplies_delete_admin" ON supplies FOR DELETE USING (fn_is_admin());

CREATE POLICY "stock_mv_select"       ON stock_movements FOR SELECT USING (fn_is_active_user());
CREATE POLICY "stock_mv_insert"       ON stock_movements FOR INSERT WITH CHECK (fn_is_active_user());
-- Movimientos son inmutables (no UPDATE ni DELETE)

CREATE POLICY "stock_alerts_select"   ON stock_alerts FOR SELECT USING (fn_is_active_user());
CREATE POLICY "stock_alerts_insert"   ON stock_alerts FOR INSERT WITH CHECK (true); -- trigger/system
CREATE POLICY "stock_alerts_update"   ON stock_alerts FOR UPDATE USING (fn_is_encargado_or_admin());

-- ────────────────────────────────────────────────────────────
-- POLÍTICAS: PRODUCCIÓN
-- Todos los activos leen y escriben
-- ────────────────────────────────────────────────────────────
CREATE POLICY "milk_select" ON milk_production FOR SELECT USING (fn_is_active_user());
CREATE POLICY "milk_insert" ON milk_production FOR INSERT WITH CHECK (fn_is_active_user());
CREATE POLICY "milk_update" ON milk_production FOR UPDATE USING (fn_is_active_user());
CREATE POLICY "milk_delete_admin" ON milk_production FOR DELETE USING (fn_is_admin());

CREATE POLICY "egg_select" ON egg_production FOR SELECT USING (fn_is_active_user());
CREATE POLICY "egg_insert" ON egg_production FOR INSERT WITH CHECK (fn_is_active_user());
CREATE POLICY "egg_update" ON egg_production FOR UPDATE USING (fn_is_active_user());
CREATE POLICY "egg_delete_admin" ON egg_production FOR DELETE USING (fn_is_admin());

-- ============================================================
-- CONFIGURACIÓN SUPABASE: REALTIME + CRON JOBS
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- REALTIME: habilitar publicación de cambios en tiempo real
-- Para el dashboard de alertas y notificaciones live
-- ────────────────────────────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE stock_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE animal_events;
ALTER PUBLICATION supabase_realtime ADD TABLE animals;
ALTER PUBLICATION supabase_realtime ADD TABLE milk_production;
ALTER PUBLICATION supabase_realtime ADD TABLE egg_production;
ALTER PUBLICATION supabase_realtime ADD TABLE reproductive_events;

-- ────────────────────────────────────────────────────────────
-- CRON JOBS (requiere pg_cron habilitado en Supabase)
-- Alternativamente se pueden crear como Supabase Edge Functions
-- ────────────────────────────────────────────────────────────

-- Verificar vencimientos de insumos cada día a las 06:00
-- SELECT cron.schedule('check-expiry-alerts', '0 6 * * *',
--   $$ SELECT fn_check_expiry_alerts(); $$
-- );

-- Actualizar estados de vacunación cada día a las 06:30
-- SELECT cron.schedule('update-vaccination-status', '30 6 * * *',
--   $$ SELECT fn_update_all_vaccination_statuses(); $$
-- );

-- ============================================================
-- COMENTARIOS FINALES Y GUÍA DE DESPLIEGUE
-- ============================================================
COMMENT ON SCHEMA public IS
  'Sistema de Información Granja Agropecuaria v1.0. '
  'Módulos: M1-Usuarios, M2-Inventario, M3-Reproductivo, M4-Insumos, M5-Producción. '
  'Alineado con RF v2.0 y CU v1.0.';

