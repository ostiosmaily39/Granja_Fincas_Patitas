-- Migración: Módulo Reproductivo - Punto 1 (Servicios)
-- Fecha: 2026-04-13

-- 1. Crear tabla de eventos reproductivos (si no existe)
CREATE TABLE IF NOT EXISTS public.reproductive_events (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    animal_id       uuid REFERENCES public.animals(id) ON DELETE CASCADE NOT NULL,
    
    event_type      text NOT NULL, -- 'servicio', 'diagnostico', 'parto', 'secado', 'aborto'
    event_date      timestamptz NOT NULL DEFAULT now(),
    
    -- Específicos para Servicios (IA / Monta)
    service_type    text, -- 'IA', 'monta_natural'
    father_id       uuid REFERENCES public.animals(id) ON DELETE SET NULL, -- Si es un macho de la granja
    father_external text, -- Nombre del toro/pajilla si es externo
    
    -- Específicos para Diagnóstico
    result          text, -- 'pendiente', 'positivo', 'negativo'
    estimated_delivery_date date,
    
    -- Específicos para Partos
    offspring_count integer DEFAULT 0,
    
    notes           text,
    responsible     text NOT NULL,
    registered_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. Habilitar RLS
ALTER TABLE public.reproductive_events ENABLE ROW LEVEL SECURITY;

-- Borrar políticas si ya existen para evitar errores
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver eventos reproductivos" ON public.reproductive_events;
DROP POLICY IF EXISTS "Solo administradores y encargados pueden insertar eventos reproductivos" ON public.reproductive_events;

CREATE POLICY "Usuarios autenticados pueden ver eventos reproductivos"
    ON public.reproductive_events FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Solo administradores y encargados pueden insertar eventos reproductivos"
    ON public.reproductive_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('ADMINISTRADOR', 'ENCARGADO')
        )
    );

-- 3. Función para actualizar el estado reproductivo del animal automáticamente
CREATE OR REPLACE FUNCTION public.handle_reproductive_event()
RETURNS TRIGGER AS $$
BEGIN
    -- Si es un servicio exitoso o pendiente de diagnóstico
    IF NEW.event_type = 'servicio' THEN
        UPDATE public.animals 
        SET reproductive_status = 'en_gestion'
        WHERE id = NEW.animal_id;
    END IF;

    -- Diagnóstico positivo: preñez confirmada (valor alineado con enum GRANJA_DB / animals-db-map)
    IF NEW.event_type = 'diagnostico' AND NEW.result = 'positivo' THEN
        UPDATE public.animals 
        SET reproductive_status = 'en_gestion'
        WHERE id = NEW.animal_id;
    ELSIF NEW.event_type = 'diagnostico' AND NEW.result = 'negativo' THEN
        UPDATE public.animals 
        SET reproductive_status = 'sin_gestion_activa'
        WHERE id = NEW.animal_id;
    END IF;

    -- Parto o aborto: vuelta a estado base reproductivo
    IF NEW.event_type IN ('parto', 'aborto') THEN
        UPDATE public.animals 
        SET reproductive_status = 'sin_gestion_activa' 
        WHERE id = NEW.animal_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Borrar trigger si ya existe
DROP TRIGGER IF EXISTS after_reproductive_event_insert ON public.reproductive_events;

CREATE TRIGGER after_reproductive_event_insert
AFTER INSERT ON public.reproductive_events
FOR EACH ROW
EXECUTE FUNCTION public.handle_reproductive_event();
