-- Políticas de Seguridad (RLS) para la tabla Supplies (Insumos)
-- Ejecuta esto en el Editor SQL de Supabase para solucionar el error de inserción.

ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;

-- 1. Los insumos son visibles para cualquier usuario autenticado
DROP POLICY IF EXISTS "Select supplies" ON public.supplies;
CREATE POLICY "Select supplies" 
ON public.supplies FOR SELECT 
USING (auth.role() = 'authenticated');

-- 2. Permitir inserción a los usuarios autenticados verificando al creador
DROP POLICY IF EXISTS "Insert supplies" ON public.supplies;
CREATE POLICY "Insert supplies" 
ON public.supplies FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND registered_by = auth.uid());

-- 3. Permitir actualización a Administradores y Encargados
DROP POLICY IF EXISTS "Update supplies" ON public.supplies;
CREATE POLICY "Update supplies" 
ON public.supplies FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('ADMINISTRADOR', 'ENCARGADO')
  )
);
