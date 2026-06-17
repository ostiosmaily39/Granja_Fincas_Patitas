-- =====================================================================
-- Fase 3, Punto 4: Sistema de Vacunación
-- Ejecutar en Supabase SQL Editor
-- =====================================================================

-- Requerido por el trigger de vaccine_schemes (evita error si aún no existe en el proyecto)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------
-- 0. Función RPC: descontar stock de insumo (reutilizable)
-- -----------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_supply_stock(
  p_supply_id uuid,
  p_quantity  numeric
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE supplies
  SET current_stock = current_stock - p_quantity,
      updated_at    = now()
  WHERE id = p_supply_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insumo % no encontrado', p_supply_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.decrement_supply_stock(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_supply_stock(uuid, numeric) TO service_role;

-- -----------------------------------------------------------------------
-- 1. Tabla: vaccine_schemes (catálogo de reglas de vacunación)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vaccine_schemes (
  id                     uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  species_id             uuid REFERENCES public.species(id) ON DELETE CASCADE,
  vaccine_name           text NOT NULL,
  disease_target         text NOT NULL,
  apply_at_age_days      integer,         -- primera dosis desde nacimiento (NULL = sin edad mínima)
  revaccinate_every_days integer,         -- frecuencia de refuerzo (NULL = única vez)
  is_mandatory           boolean DEFAULT true,
  notes                  text,
  is_active              boolean DEFAULT true,
  created_by             uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at             timestamptz DEFAULT now() NOT NULL,
  updated_at             timestamptz DEFAULT now() NOT NULL
);

-- Trigger para updated_at automático (idempotente si re-ejecutas el script)
DROP TRIGGER IF EXISTS set_vaccine_schemes_updated_at ON public.vaccine_schemes;
CREATE TRIGGER set_vaccine_schemes_updated_at
  BEFORE UPDATE ON public.vaccine_schemes
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- RLS
ALTER TABLE public.vaccine_schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select vaccine_schemes" ON public.vaccine_schemes;
CREATE POLICY "Select vaccine_schemes"
  ON public.vaccine_schemes FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Insert vaccine_schemes" ON public.vaccine_schemes;
CREATE POLICY "Insert vaccine_schemes"
  ON public.vaccine_schemes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMINISTRADOR', 'ENCARGADO')
    )
  );

DROP POLICY IF EXISTS "Update vaccine_schemes" ON public.vaccine_schemes;
CREATE POLICY "Update vaccine_schemes"
  ON public.vaccine_schemes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMINISTRADOR', 'ENCARGADO')
    )
  );

DROP POLICY IF EXISTS "Delete vaccine_schemes" ON public.vaccine_schemes;
CREATE POLICY "Delete vaccine_schemes"
  ON public.vaccine_schemes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('ADMINISTRADOR', 'ENCARGADO')
    )
  );

-- -----------------------------------------------------------------------
-- 2. Tabla: vaccination_records (historial de dosis aplicadas por animal)
-- -----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vaccination_records (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id       uuid REFERENCES public.animals(id) ON DELETE CASCADE NOT NULL,
  scheme_id       uuid REFERENCES public.vaccine_schemes(id) ON DELETE SET NULL,
  supply_id       uuid REFERENCES public.supplies(id) ON DELETE SET NULL,
  vaccine_name    text NOT NULL,      -- copia del nombre en caso de que scheme/supply se elimine
  quantity_used   numeric NOT NULL CHECK (quantity_used > 0),
  unit            text NOT NULL,
  applied_at      timestamptz NOT NULL DEFAULT now(),
  next_dose_date  date,               -- calculado con revaccinate_every_days (editable)
  responsible     text NOT NULL,      -- Quién aplicó la dosis
  notes           text,
  registered_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.vaccination_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select vaccination_records" ON public.vaccination_records;
CREATE POLICY "Select vaccination_records"
  ON public.vaccination_records FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Insert vaccination_records" ON public.vaccination_records;
CREATE POLICY "Insert vaccination_records"
  ON public.vaccination_records FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND registered_by = auth.uid()
  );

-- -----------------------------------------------------------------------
-- 3. Índices para rendimiento
-- -----------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_vaccination_records_animal_id
  ON public.vaccination_records(animal_id);

CREATE INDEX IF NOT EXISTS idx_vaccination_records_next_dose_date
  ON public.vaccination_records(next_dose_date);

CREATE INDEX IF NOT EXISTS idx_vaccine_schemes_species_id
  ON public.vaccine_schemes(species_id);
