-- Migración: RLS en animal_events
-- Fecha: 2026-06-24
-- Descripción: Historial de cambios inmodificable — solo INSERT y SELECT permitidos

ALTER TABLE animal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "historial_lectura"
ON animal_events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "historial_insertar"
ON animal_events FOR INSERT
TO authenticated
WITH CHECK (true);

-- UPDATE y DELETE bloqueados por defecto al no tener política asignada