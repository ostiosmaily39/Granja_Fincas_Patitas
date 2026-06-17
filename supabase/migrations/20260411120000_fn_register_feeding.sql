-- RF014 / CU-012: registro de alimentación por animal + salida de stock atómica.
-- Ejecutar en Supabase SQL Editor si no existe aún (o vía supabase db push).

CREATE OR REPLACE FUNCTION public.fn_register_feeding(
  p_animal_id    uuid,
  p_supply_id    uuid,
  p_quantity     numeric,
  p_unit         text,
  p_fed_at       timestamptz DEFAULT now(),
  p_notes        text DEFAULT NULL,
  p_user_id      uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_feeding_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM animals WHERE id = p_animal_id AND status = 'activo') THEN
    RAISE EXCEPTION 'Animal no encontrado o inactivo: %', p_animal_id;
  END IF;

  IF (SELECT current_stock FROM supplies WHERE id = p_supply_id) < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente para el insumo seleccionado';
  END IF;

  INSERT INTO feeding_records (animal_id, supply_id, quantity, unit, fed_at, notes, registered_by)
  VALUES (p_animal_id, p_supply_id, p_quantity, p_unit, p_fed_at, p_notes, p_user_id)
  RETURNING id INTO v_feeding_id;

  INSERT INTO stock_movements (
    supply_id, movement_type, reason, quantity,
    balance_before, balance_after, animal_id, feeding_record_id, registered_by
  )
  SELECT
    p_supply_id,
    'salida'::stock_movement_type,
    'consumo_animal'::stock_movement_reason,
    p_quantity,
    current_stock,
    current_stock - p_quantity,
    p_animal_id,
    v_feeding_id,
    p_user_id
  FROM supplies
  WHERE id = p_supply_id;

  RETURN v_feeding_id;
END;
$$;

COMMENT ON FUNCTION public.fn_register_feeding IS 'Registra alimentación y descuenta stock. RF014, CU-012.';

GRANT EXECUTE ON FUNCTION public.fn_register_feeding(uuid, uuid, numeric, text, timestamptz, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.fn_register_feeding(uuid, uuid, numeric, text, timestamptz, text, uuid) TO service_role;
