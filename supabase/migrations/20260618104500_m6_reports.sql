-- ================================================================
-- MÓDULO M6: REPORTES — NUEVAS TABLAS Y VISTAS
-- ================================================================

-- 1. Nuevas Tablas

-- 1.1 Tabla: reportes_plantillas
CREATE TABLE IF NOT EXISTS public.reportes_plantillas (  
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    nombre_plantilla VARCHAR(100) NOT NULL,  
    tipo_reporte VARCHAR(20) NOT NULL CHECK (tipo_reporte IN ('insumos', 'produccion', 'general')),  
    configuracion JSONB NOT NULL,  -- Columnas, filtros, orden, formato, etc.  
    id_usuario_creador UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,  
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  
    fecha_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  
    activo BOOLEAN DEFAULT TRUE,  
    compartida BOOLEAN DEFAULT FALSE  
);

CREATE INDEX IF NOT EXISTS idx_plantillas_usuario ON public.reportes_plantillas(id_usuario_creador);  
CREATE INDEX IF NOT EXISTS idx_plantillas_tipo ON public.reportes_plantillas(tipo_reporte);  
CREATE INDEX IF NOT EXISTS idx_plantillas_activo ON public.reportes_plantillas(activo);  

-- 1.2 Tabla: reportes_generados
CREATE TABLE IF NOT EXISTS public.reportes_generados (  
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    tipo_reporte VARCHAR(20) NOT NULL CHECK (tipo_reporte IN ('insumos', 'produccion', 'general')),  
    id_usuario_genero UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,  
    parametros_filtro JSONB NOT NULL,  -- Fechas, categorías, animales, etc.  
    formato_descarga VARCHAR(10) NOT NULL CHECK (formato_descarga IN ('PDF', 'EXCEL', 'CSV')),  
    ruta_archivo VARCHAR(255) NOT NULL,  
    tamanio_bytes INT,  
    fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  
);

CREATE INDEX IF NOT EXISTS idx_reportes_generados_fecha ON public.reportes_generados(fecha_generacion);  
CREATE INDEX IF NOT EXISTS idx_reportes_generados_usuario ON public.reportes_generados(id_usuario_genero);  
CREATE INDEX IF NOT EXISTS idx_reportes_generados_tipo ON public.reportes_generados(tipo_reporte);  

-- 1.3 Tabla: reportes_metadatos
CREATE TABLE IF NOT EXISTS public.reportes_metadatos (  
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    id_reporte_generado UUID NOT NULL REFERENCES public.reportes_generados(id) ON DELETE CASCADE,  
    clave VARCHAR(50) NOT NULL,  
    valor TEXT NOT NULL  
);

CREATE INDEX IF NOT EXISTS idx_metadatos_reporte ON public.reportes_metadatos(id_reporte_generado);  
CREATE INDEX IF NOT EXISTS idx_metadatos_clave ON public.reportes_metadatos(clave);  

-- 1.4 Tabla: reportes_alertas
CREATE TABLE IF NOT EXISTS public.reportes_alertas (  
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),  
    tipo_alerta VARCHAR(20) NOT NULL CHECK (tipo_alerta IN ('stock_bajo', 'vencimiento', 'vacunacion', 'parto', 'general')),  
    titulo VARCHAR(100) NOT NULL,  
    descripcion TEXT NOT NULL,  
    nivel VARCHAR(20) DEFAULT 'info' CHECK (nivel IN ('info', 'advertencia', 'critico')),  
    id_usuario_destino UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  
    id_referencia UUID,  -- ID del objeto relacionado (insumo, animal, etc.)  
    fecha_generacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,  
    fecha_atendida TIMESTAMP WITH TIME ZONE,  
    atendida_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,  
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'atendida', 'ignorada'))  
);

CREATE INDEX IF NOT EXISTS idx_alertas_estado ON public.reportes_alertas(estado);  
CREATE INDEX IF NOT EXISTS idx_alertas_fecha ON public.reportes_alertas(fecha_generacion);  
CREATE INDEX IF NOT EXISTS idx_alertas_tipo ON public.reportes_alertas(tipo_alerta);  
CREATE INDEX IF NOT EXISTS idx_alertas_destino ON public.reportes_alertas(id_usuario_destino);  
CREATE INDEX IF NOT EXISTS idx_alertas_referencia ON public.reportes_alertas(id_referencia);  

-- 2. Modificaciones en Tablas Existentes (Profiles)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferencias_reportes JSONB NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ultima_actividad TIMESTAMP WITH TIME ZONE NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notificaciones_reportes BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_profiles_ultima_actividad ON public.profiles(ultima_actividad);  

-- 3. Nuevas Vistas para Reportes

-- 3.1 Vista: vw_reporte_insumos (Sincronizada con tabla supplies y stock_movements)
CREATE OR REPLACE VIEW public.vw_reporte_insumos AS  
SELECT   
    i.id AS id_insumo,  
    i.name AS nombre,  
    sc.name AS categoria,  
    i.unit AS unidad_medida,  
    i.current_stock AS stock_actual,  
    i.expiry_date AS fecha_vencimiento,  
    i.min_stock AS stock_minimo,  
    i.supplier AS proveedor,  
    i.created_at AS fecha_registro,  
    CASE   
        WHEN i.current_stock <= 0 THEN 'AGOTADO'  
        WHEN i.current_stock <= i.min_stock THEN 'CRITICO'  
        WHEN i.expiry_date IS NOT NULL AND i.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'PROXIMO_A_VENCER'  
        ELSE 'NORMAL'  
    END AS estado,  
    COUNT(m.id) AS total_movimientos,  
    COALESCE(SUM(CASE WHEN m.movement_type = 'entrada' THEN m.quantity ELSE 0 END), 0) AS total_entradas,  
    COALESCE(SUM(CASE WHEN m.movement_type = 'salida' THEN m.quantity ELSE 0 END), 0) AS total_salidas,  
    COALESCE(  
        SUM(CASE WHEN m.movement_type = 'entrada' THEN m.quantity ELSE 0 END) -   
        SUM(CASE WHEN m.movement_type = 'salida' THEN m.quantity ELSE 0 END),  
        0  
    ) AS saldo_calculado  
FROM public.supplies i  
LEFT JOIN public.supply_categories sc ON i.category_id = sc.id
LEFT JOIN public.stock_movements m ON i.id = m.supply_id  
GROUP BY i.id, i.name, sc.name, i.unit, i.current_stock, i.expiry_date, i.min_stock, i.supplier, i.created_at;  

-- 3.2 Vista: vw_reporte_produccion (Unificada de milk_production y egg_production)
CREATE OR REPLACE VIEW public.vw_reporte_produccion AS  
-- Producción de Leche (Vacas)
SELECT   
    mp.id AS id_produccion,  
    mp.date::timestamp with time zone AS fecha_recoleccion,  
    a.code AS origen,  
    s.display_name AS especie,  
    b.name AS raza,  
    'LECHE'::text AS tipo,  
    mp.quantity_liters AS cantidad,  
    'litros'::text AS unidad_medida,  
    mp.animal_id AS id_animal,  
    NULL::uuid AS id_lote,  
    mp.shift::text AS turno,  
    a.status::text AS estado_animal,  
    u.full_name AS usuario_registro,  
    mp.created_by AS id_usuario_registro  
FROM public.milk_production mp  
LEFT JOIN public.animals a ON mp.animal_id = a.id  
LEFT JOIN public.species s ON a.species_id = s.id  
LEFT JOIN public.breeds b ON a.breed_id = b.id  
LEFT JOIN public.profiles u ON mp.created_by = u.id  

UNION ALL  

-- Producción de Huevos (Gallinas)
SELECT   
    ep.id AS id_produccion,  
    ep.date::timestamp with time zone AS fecha_recoleccion,  
    ab.name AS origen,  
    'Gallina'::text AS especie,  
    NULL::text AS raza,  
    'HUEVO'::text AS tipo,  
    ep.total_quantity::numeric AS cantidad,  
    'unidades'::text AS unidad_medida,  
    NULL::uuid AS id_animal,  
    ep.batch_id AS id_lote,  
    NULL::text AS turno,  
    NULL::text AS estado_animal,  
    u.full_name AS usuario_registro,  
    ep.created_by AS id_usuario_registro  
FROM public.egg_production ep  
LEFT JOIN public.animal_batches ab ON ep.batch_id = ab.id  
LEFT JOIN public.profiles u ON ep.created_by = u.id;

-- 3.3 Vista: vw_reporte_general_resumen (Corregida con nomenclatura real)
CREATE OR REPLACE VIEW public.vw_reporte_general_resumen AS  
-- Resumen de animales  
SELECT   
    'RESUMEN_ANIMALES'::text AS seccion,  
    COUNT(*)::numeric AS total,  
    s.display_name::text AS detalle,  
    COUNT(*)::numeric AS cantidad  
FROM public.animals a
JOIN public.species s ON a.species_id = s.id
WHERE a.status = 'activo'  
GROUP BY s.display_name  

UNION ALL  

-- Insumos críticos  
SELECT   
    'RESUMEN_INSUMOS_CRITICOS'::text AS seccion,  
    COUNT(*)::numeric AS total,  
    CONCAT(sc.name, ' - ', i.name)::text AS detalle,  
    i.current_stock::numeric AS cantidad  
FROM public.supplies i  
JOIN public.supply_categories sc ON i.category_id = sc.id
WHERE i.current_stock <= i.min_stock AND i.min_stock > 0
GROUP BY sc.name, i.name, i.current_stock

UNION ALL  

-- Producción del mes (Leche)
SELECT   
    'RESUMEN_PRODUCCION_MES'::text AS seccion,  
    COALESCE(SUM(quantity_liters), 0)::numeric AS total,  
    'LECHE'::text AS detalle,  
    COUNT(*)::numeric AS cantidad  
FROM public.milk_production  
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)  

UNION ALL  

-- Producción del mes (Huevos)
SELECT   
    'RESUMEN_PRODUCCION_MES'::text AS seccion,  
    COALESCE(SUM(total_quantity), 0)::numeric AS total,  
    'HUEVO'::text AS detalle,  
    COUNT(*)::numeric AS cantidad  
FROM public.egg_production  
WHERE date >= DATE_TRUNC('month', CURRENT_DATE)  

UNION ALL  

-- Vacunaciones pendientes (próximos 7 días)  
SELECT   
    'RESUMEN_VACUNACIONES_PENDIENTES'::text AS seccion,  
    COUNT(*)::numeric AS total,  
    CONCAT('Vacuna: ', vr.vaccine_name, ' - Animal: ', a.code)::text AS detalle,  
    EXTRACT(DAY FROM (vr.next_dose_date - CURRENT_DATE))::numeric AS cantidad  
FROM public.vaccination_records vr  
JOIN public.animals a ON vr.animal_id = a.id  
WHERE vr.next_dose_date <= CURRENT_DATE + INTERVAL '7 days'  
  AND vr.next_dose_date >= CURRENT_DATE
GROUP BY vr.vaccine_name, a.code, vr.next_dose_date;  

-- 4. Nuevos Procedimientos Almacenados (Funciones)

-- 4.1 sp_generar_reporte_insumos
CREATE OR REPLACE FUNCTION public.sp_generar_reporte_insumos(  
    p_fecha_inicio DATE DEFAULT NULL,  
    p_fecha_fin DATE DEFAULT NULL,  
    p_categoria VARCHAR(50) DEFAULT NULL,  
    p_estado VARCHAR(20) DEFAULT NULL  
)  
RETURNS TABLE (  
    id_insumo UUID,  
    nombre VARCHAR(100),  
    categoria VARCHAR(50),  
    unidad_medida VARCHAR(20),  
    stock_actual NUMERIC,  
    fecha_vencimiento DATE,  
    stock_minimo NUMERIC,  
    proveedor VARCHAR(100),  
    estado VARCHAR(20),  
    total_movimientos BIGINT,  
    total_entradas NUMERIC,  
    total_salidas NUMERIC,  
    saldo_calculado NUMERIC  
) AS $$  
BEGIN  
    RETURN QUERY  
    SELECT   
        v.id_insumo,  
        v.nombre::VARCHAR(100),  
        v.categoria::VARCHAR(50),  
        v.unidad_medida::VARCHAR(20),  
        v.stock_actual::NUMERIC,  
        v.fecha_vencimiento,  
        v.stock_minimo::NUMERIC,  
        v.proveedor::VARCHAR(100),  
        v.estado::VARCHAR(20),  
        v.total_movimientos,  
        v.total_entradas::NUMERIC,  
        v.total_salidas::NUMERIC,  
        v.saldo_calculado::NUMERIC  
    FROM public.vw_reporte_insumos v  
    WHERE (p_fecha_inicio IS NULL OR v.fecha_registro >= p_fecha_inicio)  
      AND (p_fecha_fin IS NULL OR v.fecha_registro <= p_fecha_fin)  
      AND (p_categoria IS NULL OR v.categoria = p_categoria)  
      AND (p_estado IS NULL OR v.estado = p_estado)  
    ORDER BY v.categoria, v.nombre;  
END;  
$$ LANGUAGE plpgsql;  

-- 4.2 sp_generar_reporte_produccion
CREATE OR REPLACE FUNCTION public.sp_generar_reporte_produccion(  
    p_fecha_inicio DATE DEFAULT NULL,  
    p_fecha_fin DATE DEFAULT NULL,  
    p_tipo VARCHAR(10) DEFAULT NULL,  
    p_id_animal UUID DEFAULT NULL,  
    p_id_lote UUID DEFAULT NULL  
)  
RETURNS TABLE (  
    id_produccion UUID,  
    fecha_recoleccion TIMESTAMP WITH TIME ZONE,  
    origen VARCHAR(100),  
    especie VARCHAR(50),  
    raza VARCHAR(50),  
    tipo VARCHAR(10),  
    cantidad NUMERIC,  
    unidad_medida VARCHAR(20),  
    id_animal UUID,  
    id_lote UUID,  
    turno VARCHAR(10),  
    estado_animal VARCHAR(20),  
    usuario_registro VARCHAR(100),  
    id_usuario_registro UUID  
) AS $$  
BEGIN  
    RETURN QUERY  
    SELECT   
        v.id_produccion,  
        v.fecha_recoleccion,  
        v.origen::VARCHAR(100),  
        v.especie::VARCHAR(50),  
        v.raza::VARCHAR(50),  
        v.tipo::VARCHAR(10),  
        v.cantidad::NUMERIC,  
        v.unidad_medida::VARCHAR(20),  
        v.id_animal,  
        v.id_lote,  
        v.turno::VARCHAR(10),  
        v.estado_animal::VARCHAR(20),  
        v.usuario_registro::VARCHAR(100),  
        v.id_usuario_registro  
    FROM public.vw_reporte_produccion v  
    WHERE (p_fecha_inicio IS NULL OR v.fecha_recoleccion >= p_fecha_inicio)  
      AND (p_fecha_fin IS NULL OR v.fecha_recoleccion <= p_fecha_fin)  
      AND (p_tipo IS NULL OR v.tipo = p_tipo)  
      AND (p_id_animal IS NULL OR v.id_animal = p_id_animal)  
      AND (p_id_lote IS NULL OR v.id_lote = p_id_lote)  
    ORDER BY v.fecha_recoleccion DESC;  
END;  
$$ LANGUAGE plpgsql;  

-- 4.3 sp_generar_reporte_general
CREATE OR REPLACE FUNCTION public.sp_generar_reporte_general(  
    p_fecha_inicio DATE DEFAULT NULL,  
    p_fecha_fin DATE DEFAULT NULL  
)  
RETURNS TABLE (  
    indicador VARCHAR(50),  
    valor NUMERIC,  
    detalle TEXT  
) AS $$  
BEGIN  
    RETURN QUERY  
    -- Total de animales activos  
    SELECT   
        'TOTAL_ANIMALES'::VARCHAR AS indicador,  
        COUNT(*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM public.animals  
    WHERE status = 'activo'  
      
    UNION ALL  
      
    -- Total de animales por especie  
    SELECT   
        'TOTAL_ANIMALES_POR_ESPECIE'::VARCHAR AS indicador,  
        COUNT(*)::NUMERIC AS valor,  
        s.display_name::TEXT AS detalle  
    FROM public.animals a
    JOIN public.species s ON a.species_id = s.id
    WHERE a.status = 'activo'  
    GROUP BY s.display_name  
      
    UNION ALL  
      
    -- Total de insumos  
    SELECT   
        'TOTAL_INSUMOS'::VARCHAR AS indicador,  
        COUNT(*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM public.supplies  
      
    UNION ALL  
      
    -- Insumos críticos (stock bajo)  
    SELECT   
        'INSUMOS_CRITICOS'::VARCHAR AS indicador,  
        COUNT(*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM public.supplies  
    WHERE current_stock <= min_stock AND min_stock > 0  
      
    UNION ALL  
      
    -- Producción de leche en el período  
    SELECT   
        'PRODUCCION_LECHE'::VARCHAR AS indicador,  
        COALESCE(SUM(quantity_liters), 0)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM public.milk_production  
    WHERE (p_fecha_inicio IS NULL OR date >= p_fecha_inicio)  
      AND (p_fecha_fin IS NULL OR date <= p_fecha_fin)  
      
    UNION ALL  
      
    -- Producción de huevos en el período  
    SELECT   
        'PRODUCCION_HUEVOS'::VARCHAR AS indicador,  
        COALESCE(SUM(total_quantity), 0)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM public.egg_production  
    WHERE (p_fecha_inicio IS NULL OR date >= p_fecha_inicio)  
      AND (p_fecha_fin IS NULL OR date <= p_fecha_fin)  
      
    UNION ALL  
      
    -- Vacunaciones pendientes (próximos 7 días)  
    SELECT   
        'VACUNACIONES_PENDIENTES'::VARCHAR AS indicador,  
        COUNT(*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM public.vaccination_records vr  
    JOIN public.animals a ON vr.animal_id = a.id  
    WHERE a.status = 'activo'  
      AND vr.next_dose_date <= CURRENT_DATE + INTERVAL '7 days'  
      AND vr.next_dose_date >= CURRENT_DATE;  
END;  
$$ LANGUAGE plpgsql;  

-- 4.4 sp_generar_alertas_automaticas
CREATE OR REPLACE FUNCTION public.sp_generar_alertas_automaticas()  
RETURNS VOID AS $$  
DECLARE  
    v_insumo RECORD;  
    v_animal RECORD;  
BEGIN  
    -- 1. Alertas de stock bajo  
    FOR v_insumo IN   
        SELECT * FROM public.supplies   
        WHERE current_stock <= min_stock AND min_stock > 0  
    LOOP  
        INSERT INTO public.reportes_alertas (  
            id,  
            tipo_alerta,  
            titulo,  
            descripcion,  
            nivel,  
            id_referencia,  
            fecha_generacion,  
            estado  
        ) VALUES (  
            gen_random_uuid(),  
            'stock_bajo',  
            'Stock bajo: ' || v_insumo.name,  
            'El insumo "' || v_insumo.name || '" tiene stock de ' ||   
            v_insumo.current_stock || ' ' || v_insumo.unit ||   
            '. El mínimo configurado es ' || v_insumo.min_stock || '.',  
            CASE   
                WHEN v_insumo.current_stock <= 0 THEN 'critico'  
                ELSE 'advertencia'  
            END,  
            v_insumo.id,  
            CURRENT_TIMESTAMP,  
            'pendiente'  
        );  
    END LOOP;  
      
    -- 2. Alertas de vencimiento de medicamentos (próximos 30 días)  
    FOR v_insumo IN   
        SELECT s.* FROM public.supplies s  
        JOIN public.supply_categories sc ON s.category_id = sc.id  
        WHERE sc.category = 'medicamento'   
          AND s.expiry_date IS NOT NULL  
          AND s.expiry_date <= CURRENT_DATE + INTERVAL '30 days'  
          AND s.expiry_date >= CURRENT_DATE  
    LOOP  
        INSERT INTO public.reportes_alertas (  
            id,  
            tipo_alerta,  
            titulo,  
            descripcion,  
            nivel,  
            id_referencia,  
            fecha_generacion,  
            estado  
        ) VALUES (  
            gen_random_uuid(),  
            'vencimiento',  
            'Medicamento próximo a vencer: ' || v_insumo.name,  
            'El medicamento "' || v_insumo.name || '" vence el ' ||   
            TO_CHAR(v_insumo.expiry_date, 'DD/MM/YYYY') ||   
            '. Stock actual: ' || v_insumo.current_stock || ' ' || v_insumo.unit || '.',  
            'advertencia',  
            v_insumo.id,  
            CURRENT_TIMESTAMP,  
            'pendiente'  
        );  
    END LOOP;  
      
    -- 3. Alertas de vacunaciones pendientes (próximos 7 días)  
    FOR v_animal IN   
        SELECT   
            vr.*,  
            a.code AS identificador,  
            s.display_name AS especie  
        FROM public.vaccination_records vr  
        JOIN public.animals a ON vr.animal_id = a.id  
        JOIN public.species s ON a.species_id = s.id  
        WHERE a.status = 'activo'  
          AND vr.next_dose_date <= CURRENT_DATE + INTERVAL '7 days'  
          AND vr.next_dose_date >= CURRENT_DATE  
    LOOP  
        INSERT INTO public.reportes_alertas (  
            id,  
            tipo_alerta,  
            titulo,  
            descripcion,  
            nivel,  
            id_referencia,  
            fecha_generacion,  
            estado  
        ) VALUES (  
            gen_random_uuid(),  
            'vacunacion',  
            'Vacunación pendiente: ' || v_animal.identificador,  
            'El animal "' || v_animal.identificador || '" (' || v_animal.especie ||   
            ') tiene programada la vacuna "' || v_animal.vaccine_name ||   
            '" para el ' || TO_CHAR(v_animal.next_dose_date, 'DD/MM/YYYY') || '.',  
            'info',  
            v_animal.animal_id,  
            CURRENT_TIMESTAMP,  
            'pendiente'  
        );  
    END LOOP;  
END;  
$$ LANGUAGE plpgsql;  

-- 5. Nuevos Triggers de Auditoría y Actividad

-- 5.1 Trigger de última actividad al generar reportes
CREATE OR REPLACE FUNCTION public.fn_actualizar_ultima_actividad()  
RETURNS TRIGGER AS $$  
BEGIN  
    UPDATE public.profiles   
    SET ultima_actividad = CURRENT_TIMESTAMP   
    WHERE id = NEW.id_usuario_genero;  
    RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_ultima_actividad ON public.reportes_generados;
CREATE TRIGGER trg_actualizar_ultima_actividad  
AFTER INSERT ON public.reportes_generados  
FOR EACH ROW  
EXECUTE FUNCTION public.fn_actualizar_ultima_actividad();  

-- 5.2 Adjuntar Trigger de Auditoría a las nuevas tablas
DROP TRIGGER IF EXISTS audit_report_templates_changes ON public.reportes_plantillas;
CREATE TRIGGER audit_report_templates_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.reportes_plantillas
  FOR EACH ROW EXECUTE PROCEDURE public.log_table_audit();
  
DROP TRIGGER IF EXISTS audit_generated_reports_changes ON public.reportes_generados;
CREATE TRIGGER audit_generated_reports_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.reportes_generados
  FOR EACH ROW EXECUTE PROCEDURE public.log_table_audit();
  
DROP TRIGGER IF EXISTS audit_report_alerts_changes ON public.reportes_alertas;
CREATE TRIGGER audit_report_alerts_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.reportes_alertas
  FOR EACH ROW EXECUTE PROCEDURE public.log_table_audit();

-- 6. Nuevos Índices para Optimización de Reportes
CREATE INDEX IF NOT EXISTS idx_milk_prod_date ON public.milk_production(date DESC);  
CREATE INDEX IF NOT EXISTS idx_egg_prod_date ON public.egg_production(date DESC);  

-- 7. Configuración de Supabase Storage (Bucket para PDF/Excel)
INSERT INTO storage.buckets (id, name, public)   
VALUES ('reportes', 'reportes', false)  
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Usuarios autenticados pueden subir reportes" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden subir reportes"   
ON storage.objects FOR INSERT TO authenticated   
WITH CHECK (bucket_id = 'reportes');

DROP POLICY IF EXISTS "Usuarios autenticados pueden descargar reportes" ON storage.objects;
CREATE POLICY "Usuarios autenticados pueden descargar reportes"   
ON storage.objects FOR SELECT TO authenticated   
USING (bucket_id = 'reportes');

DROP POLICY IF EXISTS "Usuarios pueden eliminar sus propios reportes" ON storage.objects;
CREATE POLICY "Usuarios pueden eliminar sus propios reportes"   
ON storage.objects FOR DELETE TO authenticated   
USING (bucket_id = 'reportes' AND owner = auth.uid());  
