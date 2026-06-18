\# CAMBIOS EN BASE DE DATOS PARA M6 — REPORTES

\#\# Sistema de Información Granja Agropecuaria  
\*\*Versión:\*\* 2.0    
\*\*Fecha:\*\* Junio 2026    
\*\*Módulo afectado:\*\* M6 — Reportes

\---

\#\# 1\. NUEVAS TABLAS

\#\#\# 1.1 Tabla: reportes\_plantillas

Almacena las plantillas personalizadas de reportes que los usuarios pueden guardar y reutilizar.

\`\`\`sql  
CREATE TABLE reportes\_plantillas (  
    id\_plantilla UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    nombre\_plantilla VARCHAR(100) NOT NULL,  
    tipo\_reporte VARCHAR(20) NOT NULL CHECK (tipo\_reporte IN ('insumos', 'produccion', 'general')),  
    configuracion JSONB NOT NULL,  \-- Columnas, filtros, orden, formato, etc.  
    id\_usuario\_creador UUID NOT NULL,  
    fecha\_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    fecha\_modificacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    activo BOOLEAN DEFAULT TRUE,  
    compartida BOOLEAN DEFAULT FALSE,  
    FOREIGN KEY (id\_usuario\_creador) REFERENCES usuarios(id\_usuario) ON DELETE CASCADE  
);

\-- Índices  
CREATE INDEX idx\_plantillas\_usuario ON reportes\_plantillas(id\_usuario\_creador);  
CREATE INDEX idx\_plantillas\_tipo ON reportes\_plantillas(tipo\_reporte);  
CREATE INDEX idx\_plantillas\_activo ON reportes\_plantillas(activo);  
1.2 Tabla: reportes\_generados  
Registra todos los reportes que han sido generados y descargados para auditoría y seguimiento.

sql  
CREATE TABLE reportes\_generados (  
    id\_reporte\_generado UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tipo\_reporte VARCHAR(20) NOT NULL CHECK (tipo\_reporte IN ('insumos', 'produccion', 'general')),  
    id\_usuario\_genero UUID NOT NULL,  
    parametros\_filtro JSONB NOT NULL,  \-- Fechas, categorías, animales, etc.  
    formato\_descarga VARCHAR(10) NOT NULL CHECK (formato\_descarga IN ('PDF', 'EXCEL', 'CSV')),  
    ruta\_archivo VARCHAR(255) NOT NULL,  
    tamanio\_bytes INT,  
    fecha\_generacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    FOREIGN KEY (id\_usuario\_genero) REFERENCES usuarios(id\_usuario) ON DELETE CASCADE  
);

\-- Índices  
CREATE INDEX idx\_reportes\_generados\_fecha ON reportes\_generados(fecha\_generacion);  
CREATE INDEX idx\_reportes\_generados\_usuario ON reportes\_generados(id\_usuario\_genero);  
CREATE INDEX idx\_reportes\_generados\_tipo ON reportes\_generados(tipo\_reporte);  
1.3 Tabla: reportes\_metadatos  
Almacena metadatos adicionales para auditoría detallada de reportes.

sql  
CREATE TABLE reportes\_metadatos (  
    id\_metadato UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    id\_reporte\_generado UUID NOT NULL,  
    clave VARCHAR(50) NOT NULL,  
    valor TEXT NOT NULL,  
    FOREIGN KEY (id\_reporte\_generado) REFERENCES reportes\_generados(id\_reporte\_generado) ON DELETE CASCADE  
);

\-- Índices  
CREATE INDEX idx\_metadatos\_reporte ON reportes\_metadatos(id\_reporte\_generado);  
CREATE INDEX idx\_metadatos\_clave ON reportes\_metadatos(clave);  
1.4 Tabla: reportes\_alertas  
Registra las alertas generadas automáticamente por el sistema (stock bajo, vacunaciones, partos, etc.).

sql  
CREATE TABLE reportes\_alertas (  
    id\_alerta UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
    tipo\_alerta VARCHAR(20) NOT NULL CHECK (tipo\_alerta IN ('stock\_bajo', 'vencimiento', 'vacunacion', 'parto', 'general')),  
    titulo VARCHAR(100) NOT NULL,  
    descripcion TEXT NOT NULL,  
    nivel VARCHAR(20) DEFAULT 'info' CHECK (nivel IN ('info', 'advertencia', 'critico')),  
    id\_usuario\_destino UUID,  
    id\_referencia UUID,  \-- ID del objeto relacionado (insumo, animal, etc.)  
    fecha\_generacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP,  
    fecha\_atendida TIMESTAMP WITH TIME ZONE,  
    atendida\_por UUID,  
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'atendida', 'ignorada')),  
    FOREIGN KEY (id\_usuario\_destino) REFERENCES usuarios(id\_usuario) ON DELETE SET NULL,  
    FOREIGN KEY (atendida\_por) REFERENCES usuarios(id\_usuario) ON DELETE SET NULL  
);

\-- Índices  
CREATE INDEX idx\_alertas\_estado ON reportes\_alertas(estado);  
CREATE INDEX idx\_alertas\_fecha ON reportes\_alertas(fecha\_generacion);  
CREATE INDEX idx\_alertas\_tipo ON reportes\_alertas(tipo\_alerta);  
CREATE INDEX idx\_alertas\_destino ON reportes\_alertas(id\_usuario\_destino);  
CREATE INDEX idx\_alertas\_referencia ON reportes\_alertas(id\_referencia);  
2\. MODIFICACIONES EN TABLAS EXISTENTES  
2.1 Tabla: usuarios  
sql  
\-- Añadir campo para preferencias de reportes  
ALTER TABLE usuarios ADD COLUMN preferencias\_reportes JSONB NULL;

\-- Añadir campo para última actividad (para reportes de uso)  
ALTER TABLE usuarios ADD COLUMN ultima\_actividad TIMESTAMP WITH TIME ZONE NULL;

\-- Añadir campo para notificaciones de reportes  
ALTER TABLE usuarios ADD COLUMN notificaciones\_reportes BOOLEAN DEFAULT TRUE;

\-- Índices para nuevos campos  
CREATE INDEX idx\_usuarios\_ultima\_actividad ON usuarios(ultima\_actividad);  
2.2 Tabla: permisos  
sql  
\-- Insertar nuevos permisos para M6 Reportes  
INSERT INTO permisos (id\_permiso, nombre\_permiso, descripcion, modulo) VALUES  
(gen\_random\_uuid(), 'reportes\_visualizar', 'Permite visualizar reportes generados', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_generar', 'Permite generar nuevos reportes', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_descargar', 'Permite descargar reportes en diferentes formatos', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_editar', 'Permite editar y personalizar reportes', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_eliminar', 'Permite eliminar reportes generados', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_plantillas\_gestionar', 'Permite gestionar plantillas de reportes', 'M6\_Reportes');  
2.3 Tabla: roles\_permisos  
sql  
\-- Asignar permisos a roles  
\-- Administrador: Todos los permisos  
INSERT INTO roles\_permisos (id\_rol, id\_permiso)  
SELECT   
    r.id\_rol,  
    p.id\_permiso  
FROM roles r  
CROSS JOIN permisos p  
WHERE r.nombre\_rol \= 'Administrador'  
  AND p.nombre\_permiso LIKE 'reportes\_%';

\-- Encargado: Visualizar, generar y descargar (sin editar ni eliminar)  
INSERT INTO roles\_permisos (id\_rol, id\_permiso)  
SELECT   
    r.id\_rol,  
    p.id\_permiso  
FROM roles r  
CROSS JOIN permisos p  
WHERE r.nombre\_rol \= 'Encargado'  
  AND p.nombre\_permiso IN ('reportes\_visualizar', 'reportes\_generar', 'reportes\_descargar');

\-- Empleado: Solo visualizar y descargar reportes predefinidos  
INSERT INTO roles\_permisos (id\_rol, id\_permiso)  
SELECT   
    r.id\_rol,  
    p.id\_permiso  
FROM roles r  
CROSS JOIN permisos p  
WHERE r.nombre\_rol \= 'Empleado'  
  AND p.nombre\_permiso IN ('reportes\_visualizar', 'reportes\_descargar');  
3\. NUEVAS VISTAS PARA REPORTES  
3.1 Vista: vw\_reporte\_insumos  
sql  
CREATE OR REPLACE VIEW vw\_reporte\_insumos AS  
SELECT   
    i.id\_insumo,  
    i.nombre,  
    i.categoria,  
    i.unidad\_medida,  
    i.stock\_actual,  
    i.fecha\_vencimiento,  
    i.stock\_minimo,  
    i.proveedor,  
    i.fecha\_registro,  
    CASE   
        WHEN i.stock\_actual \<= 0 THEN 'AGOTADO'  
        WHEN i.stock\_actual \<= i.stock\_minimo THEN 'CRITICO'  
        WHEN i.fecha\_vencimiento IS NOT NULL AND i.fecha\_vencimiento \<= CURRENT\_DATE \+ INTERVAL '30 days' THEN 'PROXIMO\_A\_VENCER'  
        ELSE 'NORMAL'  
    END AS estado,  
    COUNT(m.id\_movimiento) AS total\_movimientos,  
    COALESCE(SUM(CASE WHEN m.tipo \= 'ENTRADA' THEN m.cantidad ELSE 0 END), 0\) AS total\_entradas,  
    COALESCE(SUM(CASE WHEN m.tipo \= 'SALIDA' THEN m.cantidad ELSE 0 END), 0\) AS total\_salidas,  
    COALESCE(  
        SUM(CASE WHEN m.tipo \= 'ENTRADA' THEN m.cantidad ELSE 0 END) \-   
        SUM(CASE WHEN m.tipo \= 'SALIDA' THEN m.cantidad ELSE 0 END),  
        0  
    ) AS saldo\_calculado  
FROM insumos i  
LEFT JOIN movimientos\_insumos m ON i.id\_insumo \= m.id\_insumo  
GROUP BY i.id\_insumo;  
3.2 Vista: vw\_reporte\_produccion  
sql  
CREATE OR REPLACE VIEW vw\_reporte\_produccion AS  
SELECT   
    p.id\_produccion,  
    p.fecha\_recoleccion,  
    CASE   
        WHEN p.tipo \= 'LECHE' THEN a.identificador  
        WHEN p.tipo \= 'HUEVO' THEN CONCAT('Lote ', l.nombre\_lote)  
        ELSE 'No especificado'  
    END AS origen,  
    CASE   
        WHEN p.tipo \= 'LECHE' THEN a.especie  
        WHEN p.tipo \= 'HUEVO' THEN 'Gallina'  
        ELSE 'N/A'  
    END AS especie,  
    CASE   
        WHEN p.tipo \= 'LECHE' THEN a.raza  
        WHEN p.tipo \= 'HUEVO' THEN l.tipo\_gallina  
        ELSE 'N/A'  
    END AS raza,  
    p.tipo,  
    p.cantidad,  
    p.unidad\_medida,  
    p.id\_animal,  
    p.id\_lote,  
    p.turno,  
    a.estado AS estado\_animal,  
    u.nombre\_completo AS usuario\_registro,  
    u.id\_usuario AS id\_usuario\_registro  
FROM produccion p  
LEFT JOIN animales a ON p.id\_animal \= a.id\_animal  
LEFT JOIN lotes l ON p.id\_lote \= l.id\_lote  
LEFT JOIN usuarios u ON p.id\_usuario\_registro \= u.id\_usuario  
WHERE p.fecha\_recoleccion \>= CURRENT\_DATE \- INTERVAL '365 days';  
3.3 Vista: vw\_reporte\_general\_resumen  
sql  
CREATE OR REPLACE VIEW vw\_reporte\_general\_resumen AS  
\-- Resumen de animales  
SELECT   
    'RESUMEN\_ANIMALES' AS seccion,  
    COUNT(\*) AS total,  
    especie AS detalle,  
    COUNT(\*) AS cantidad  
FROM animales  
WHERE estado \= 'Activo'  
GROUP BY especie

UNION ALL

\-- Insumos críticos  
SELECT   
    'RESUMEN\_INSUMOS\_CRITICOS' AS seccion,  
    COUNT(\*) AS total,  
    CONCAT(categoria, ' \- ', nombre) AS detalle,  
    stock\_actual AS cantidad  
FROM insumos  
WHERE stock\_actual \<= stock\_minimo AND stock\_minimo \> 0

UNION ALL

\-- Producción del mes  
SELECT   
    'RESUMEN\_PRODUCCION\_MES' AS seccion,  
    COALESCE(SUM(cantidad), 0\) AS total,  
    tipo AS detalle,  
    COUNT(\*) AS cantidad  
FROM produccion  
WHERE fecha\_recoleccion \>= DATE\_TRUNC('month', CURRENT\_DATE)  
GROUP BY tipo

UNION ALL

\-- Vacunaciones pendientes (próximos 7 días)  
SELECT   
    'RESUMEN\_VACUNACIONES\_PENDIENTES' AS seccion,  
    COUNT(\*) AS total,  
    CONCAT('Vacuna: ', v.tipo\_vacuna, ' \- Animal: ', a.identificador) AS detalle,  
    EXTRACT(DAY FROM (v.proxima\_dosis \- CURRENT\_DATE))::INTEGER AS cantidad  
FROM vacunaciones v  
JOIN animales a ON v.id\_animal \= a.id\_animal  
WHERE v.estado \= 'Pendiente'  
  AND v.proxima\_dosis \<= CURRENT\_DATE \+ INTERVAL '7 days'  
  AND v.proxima\_dosis \>= CURRENT\_DATE;  
4\. NUEVOS PROCEDIMIENTOS ALMACENADOS  
4.1 SP: sp\_generar\_reporte\_insumos  
sql  
CREATE OR REPLACE FUNCTION sp\_generar\_reporte\_insumos(  
    p\_fecha\_inicio DATE DEFAULT NULL,  
    p\_fecha\_fin DATE DEFAULT NULL,  
    p\_categoria VARCHAR(50) DEFAULT NULL,  
    p\_estado VARCHAR(20) DEFAULT NULL  
)  
RETURNS TABLE (  
    id\_insumo UUID,  
    nombre VARCHAR(100),  
    categoria VARCHAR(50),  
    unidad\_medida VARCHAR(20),  
    stock\_actual NUMERIC,  
    fecha\_vencimiento DATE,  
    stock\_minimo NUMERIC,  
    proveedor VARCHAR(100),  
    estado VARCHAR(20),  
    total\_movimientos BIGINT,  
    total\_entradas NUMERIC,  
    total\_salidas NUMERIC,  
    saldo\_calculado NUMERIC  
) AS $$  
BEGIN  
    RETURN QUERY  
    SELECT   
        i.id\_insumo,  
        i.nombre,  
        i.categoria,  
        i.unidad\_medida,  
        i.stock\_actual,  
        i.fecha\_vencimiento,  
        i.stock\_minimo,  
        i.proveedor,  
        v.estado,  
        v.total\_movimientos,  
        v.total\_entradas,  
        v.total\_salidas,  
        v.saldo\_calculado  
    FROM insumos i  
    JOIN vw\_reporte\_insumos v ON i.id\_insumo \= v.id\_insumo  
    WHERE (p\_fecha\_inicio IS NULL OR i.fecha\_registro \>= p\_fecha\_inicio)  
      AND (p\_fecha\_fin IS NULL OR i.fecha\_registro \<= p\_fecha\_fin)  
      AND (p\_categoria IS NULL OR i.categoria \= p\_categoria)  
      AND (p\_estado IS NULL OR v.estado \= p\_estado)  
    ORDER BY i.categoria, i.nombre;  
END;  
$$ LANGUAGE plpgsql;  
4.2 SP: sp\_generar\_reporte\_produccion  
sql  
CREATE OR REPLACE FUNCTION sp\_generar\_reporte\_produccion(  
    p\_fecha\_inicio DATE DEFAULT NULL,  
    p\_fecha\_fin DATE DEFAULT NULL,  
    p\_tipo VARCHAR(10) DEFAULT NULL,  
    p\_id\_animal UUID DEFAULT NULL,  
    p\_id\_lote UUID DEFAULT NULL  
)  
RETURNS TABLE (  
    id\_produccion UUID,  
    fecha\_recoleccion TIMESTAMP WITH TIME ZONE,  
    origen VARCHAR(100),  
    especie VARCHAR(50),  
    raza VARCHAR(50),  
    tipo VARCHAR(10),  
    cantidad NUMERIC,  
    unidad\_medida VARCHAR(20),  
    id\_animal UUID,  
    id\_lote UUID,  
    turno VARCHAR(10),  
    estado\_animal VARCHAR(20),  
    usuario\_registro VARCHAR(100),  
    id\_usuario\_registro UUID  
) AS $$  
BEGIN  
    RETURN QUERY  
    SELECT   
        p.id\_produccion,  
        p.fecha\_recoleccion,  
        v.origen,  
        v.especie,  
        v.raza,  
        p.tipo,  
        p.cantidad,  
        p.unidad\_medida,  
        p.id\_animal,  
        p.id\_lote,  
        p.turno,  
        v.estado\_animal,  
        v.usuario\_registro,  
        v.id\_usuario\_registro  
    FROM produccion p  
    JOIN vw\_reporte\_produccion v ON p.id\_produccion \= v.id\_produccion  
    WHERE (p\_fecha\_inicio IS NULL OR p.fecha\_recoleccion \>= p\_fecha\_inicio)  
      AND (p\_fecha\_fin IS NULL OR p.fecha\_recoleccion \<= p\_fecha\_fin)  
      AND (p\_tipo IS NULL OR p.tipo \= p\_tipo)  
      AND (p\_id\_animal IS NULL OR p.id\_animal \= p\_id\_animal)  
      AND (p\_id\_lote IS NULL OR p.id\_lote \= p\_id\_lote)  
    ORDER BY p.fecha\_recoleccion DESC;  
END;  
$$ LANGUAGE plpgsql;  
4.3 SP: sp\_generar\_reporte\_general  
sql  
CREATE OR REPLACE FUNCTION sp\_generar\_reporte\_general(  
    p\_fecha\_inicio DATE DEFAULT NULL,  
    p\_fecha\_fin DATE DEFAULT NULL  
)  
RETURNS TABLE (  
    indicador VARCHAR(50),  
    valor NUMERIC,  
    detalle TEXT  
) AS $$  
BEGIN  
    \-- Total de animales activos  
    RETURN QUERY  
    SELECT   
        'TOTAL\_ANIMALES'::VARCHAR AS indicador,  
        COUNT(\*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM animales  
    WHERE estado \= 'Activo'  
      
    UNION ALL  
      
    \-- Total de animales por especie  
    SELECT   
        'TOTAL\_ANIMALES\_POR\_ESPECIE'::VARCHAR AS indicador,  
        COUNT(\*)::NUMERIC AS valor,  
        especie::TEXT AS detalle  
    FROM animales  
    WHERE estado \= 'Activo'  
    GROUP BY especie  
      
    UNION ALL  
      
    \-- Total de insumos  
    SELECT   
        'TOTAL\_INSUMOS'::VARCHAR AS indicador,  
        COUNT(\*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM insumos  
      
    UNION ALL  
      
    \-- Insumos críticos (stock bajo)  
    SELECT   
        'INSUMOS\_CRITICOS'::VARCHAR AS indicador,  
        COUNT(\*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM insumos  
    WHERE stock\_actual \<= stock\_minimo AND stock\_minimo \> 0  
      
    UNION ALL  
      
    \-- Producción de leche en el período  
    SELECT   
        'PRODUCCION\_LECHE'::VARCHAR AS indicador,  
        COALESCE(SUM(cantidad), 0)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM produccion  
    WHERE tipo \= 'LECHE'  
      AND (p\_fecha\_inicio IS NULL OR fecha\_recoleccion \>= p\_fecha\_inicio)  
      AND (p\_fecha\_fin IS NULL OR fecha\_recoleccion \<= p\_fecha\_fin)  
      
    UNION ALL  
      
    \-- Producción de huevos en el período  
    SELECT   
        'PRODUCCION\_HUEVOS'::VARCHAR AS indicador,  
        COALESCE(SUM(cantidad), 0)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM produccion  
    WHERE tipo \= 'HUEVO'  
      AND (p\_fecha\_inicio IS NULL OR fecha\_recoleccion \>= p\_fecha\_inicio)  
      AND (p\_fecha\_fin IS NULL OR fecha\_recoleccion \<= p\_fecha\_fin)  
      
    UNION ALL  
      
    \-- Vacunaciones pendientes (próximos 7 días)  
    SELECT   
        'VACUNACIONES\_PENDIENTES'::VARCHAR AS indicador,  
        COUNT(\*)::NUMERIC AS valor,  
        NULL::TEXT AS detalle  
    FROM vacunaciones v  
    JOIN animales a ON v.id\_animal \= a.id\_animal  
    WHERE v.estado \= 'Pendiente'  
      AND v.proxima\_dosis \<= CURRENT\_DATE \+ INTERVAL '7 days'  
      AND v.proxima\_dosis \>= CURRENT\_DATE;  
END;  
$$ LANGUAGE plpgsql;  
4.4 SP: sp\_generar\_alertas\_automaticas  
sql  
CREATE OR REPLACE FUNCTION sp\_generar\_alertas\_automaticas()  
RETURNS VOID AS $$  
DECLARE  
    v\_insumo RECORD;  
    v\_animal RECORD;  
    v\_alerta\_id UUID;  
BEGIN  
    \-- 1\. Alertas de stock bajo  
    FOR v\_insumo IN   
        SELECT \* FROM insumos   
        WHERE stock\_actual \<= stock\_minimo AND stock\_minimo \> 0  
    LOOP  
        INSERT INTO reportes\_alertas (  
            id\_alerta,  
            tipo\_alerta,  
            titulo,  
            descripcion,  
            nivel,  
            id\_referencia,  
            fecha\_generacion,  
            estado  
        ) VALUES (  
            gen\_random\_uuid(),  
            'stock\_bajo',  
            'Stock bajo: ' || v\_insumo.nombre,  
            'El insumo "' || v\_insumo.nombre || '" tiene stock de ' ||   
            v\_insumo.stock\_actual || ' ' || v\_insumo.unidad\_medida ||   
            '. El mínimo configurado es ' || v\_insumo.stock\_minimo || '.',  
            CASE   
                WHEN v\_insumo.stock\_actual \<= 0 THEN 'critico'  
                ELSE 'advertencia'  
            END,  
            v\_insumo.id\_insumo,  
            CURRENT\_TIMESTAMP,  
            'pendiente'  
        );  
    END LOOP;  
      
    \-- 2\. Alertas de vencimiento de medicamentos (próximos 30 días)  
    FOR v\_insumo IN   
        SELECT \* FROM insumos   
        WHERE categoria \= 'Medicamento'   
          AND fecha\_vencimiento IS NOT NULL  
          AND fecha\_vencimiento \<= CURRENT\_DATE \+ INTERVAL '30 days'  
          AND fecha\_vencimiento \>= CURRENT\_DATE  
    LOOP  
        INSERT INTO reportes\_alertas (  
            id\_alerta,  
            tipo\_alerta,  
            titulo,  
            descripcion,  
            nivel,  
            id\_referencia,  
            fecha\_generacion,  
            estado  
        ) VALUES (  
            gen\_random\_uuid(),  
            'vencimiento',  
            'Medicamento próximo a vencer: ' || v\_insumo.nombre,  
            'El medicamento "' || v\_insumo.nombre || '" vence el ' ||   
            TO\_CHAR(v\_insumo.fecha\_vencimiento, 'DD/MM/YYYY') ||   
            '. Stock actual: ' || v\_insumo.stock\_actual || ' ' || v\_insumo.unidad\_medida || '.',  
            'advertencia',  
            v\_insumo.id\_insumo,  
            CURRENT\_TIMESTAMP,  
            'pendiente'  
        );  
    END LOOP;  
      
    \-- 3\. Alertas de vacunaciones pendientes (próximos 7 días)  
    FOR v\_animal IN   
        SELECT   
            v.\*,  
            a.identificador,  
            a.especie  
        FROM vacunaciones v  
        JOIN animales a ON v.id\_animal \= a.id\_animal  
        WHERE v.estado \= 'Pendiente'  
          AND v.proxima\_dosis \<= CURRENT\_DATE \+ INTERVAL '7 days'  
          AND v.proxima\_dosis \>= CURRENT\_DATE  
    LOOP  
        INSERT INTO reportes\_alertas (  
            id\_alerta,  
            tipo\_alerta,  
            titulo,  
            descripcion,  
            nivel,  
            id\_referencia,  
            fecha\_generacion,  
            estado  
        ) VALUES (  
            gen\_random\_uuid(),  
            'vacunacion',  
            'Vacunación pendiente: ' || v\_animal.identificador,  
            'El animal "' || v\_animal.identificador || '" (' || v\_animal.especie ||   
            ') tiene programada la vacuna "' || v\_animal.tipo\_vacuna ||   
            '" para el ' || TO\_CHAR(v\_animal.proxima\_dosis, 'DD/MM/YYYY') || '.',  
            'info',  
            v\_animal.id\_animal,  
            CURRENT\_TIMESTAMP,  
            'pendiente'  
        );  
    END LOOP;  
END;  
$$ LANGUAGE plpgsql;  
5\. NUEVOS TRIGGERS  
5.1 Trigger: trg\_reporte\_generado\_audit  
sql  
CREATE OR REPLACE FUNCTION fn\_reporte\_generado\_audit()  
RETURNS TRIGGER AS $$  
BEGIN  
    INSERT INTO auditoria (  
        id\_auditoria,  
        tabla,  
        operacion,  
        id\_registro,  
        id\_usuario,  
        fecha,  
        detalles  
    ) VALUES (  
        gen\_random\_uuid(),  
        'reportes\_generados',  
        'INSERT',  
        NEW.id\_reporte\_generado,  
        NEW.id\_usuario\_genero,  
        CURRENT\_TIMESTAMP,  
        CONCAT('Reporte generado: ', NEW.tipo\_reporte, ' en formato ', NEW.formato\_descarga)  
    );  
    RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg\_reporte\_generado\_audit  
AFTER INSERT ON reportes\_generados  
FOR EACH ROW  
EXECUTE FUNCTION fn\_reporte\_generado\_audit();  
5.2 Trigger: trg\_actualizar\_ultima\_actividad  
sql  
CREATE OR REPLACE FUNCTION fn\_actualizar\_ultima\_actividad()  
RETURNS TRIGGER AS $$  
BEGIN  
    UPDATE usuarios   
    SET ultima\_actividad \= CURRENT\_TIMESTAMP   
    WHERE id\_usuario \= NEW.id\_usuario\_genero;  
    RETURN NEW;  
END;  
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg\_actualizar\_ultima\_actividad  
AFTER INSERT ON reportes\_generados  
FOR EACH ROW  
EXECUTE FUNCTION fn\_actualizar\_ultima\_actividad();  
6\. NUEVOS ÍNDICES PARA OPTIMIZACIÓN  
sql  
\-- Índices para consultas de reportes  
CREATE INDEX idx\_produccion\_fecha\_recoleccion ON produccion(fecha\_recoleccion);  
CREATE INDEX idx\_produccion\_tipo ON produccion(tipo);  
CREATE INDEX idx\_produccion\_animal ON produccion(id\_animal);  
CREATE INDEX idx\_produccion\_lote ON produccion(id\_lote);  
CREATE INDEX idx\_produccion\_usuario ON produccion(id\_usuario\_registro);

CREATE INDEX idx\_insumos\_categoria ON insumos(categoria);  
CREATE INDEX idx\_insumos\_estado ON insumos(estado);  
CREATE INDEX idx\_insumos\_vencimiento ON insumos(fecha\_vencimiento);  
CREATE INDEX idx\_insumos\_stock ON insumos(stock\_actual, stock\_minimo);

CREATE INDEX idx\_vacunaciones\_estado ON vacunaciones(estado);  
CREATE INDEX idx\_vacunaciones\_proxima ON vacunaciones(proxima\_dosis);  
CREATE INDEX idx\_vacunaciones\_animal ON vacunaciones(id\_animal);

CREATE INDEX idx\_animales\_especie ON animales(especie);  
CREATE INDEX idx\_animales\_estado ON animales(estado);  
CREATE INDEX idx\_animales\_identificador ON animales(identificador);

\-- Índices para movimientos de insumos  
CREATE INDEX idx\_movimientos\_insumo ON movimientos\_insumos(id\_insumo);  
CREATE INDEX idx\_movimientos\_fecha ON movimientos\_insumos(fecha\_movimiento);  
CREATE INDEX idx\_movimientos\_tipo ON movimientos\_insumos(tipo);  
7\. NUEVOS PERMISOS PARA ROLES (RBAC)  
sql  
\-- Verificar que la tabla permisos existe  
DO $$  
BEGIN  
    IF NOT EXISTS (SELECT 1 FROM information\_schema.tables WHERE table\_name \= 'permisos') THEN  
        CREATE TABLE permisos (  
            id\_permiso UUID PRIMARY KEY DEFAULT gen\_random\_uuid(),  
            nombre\_permiso VARCHAR(50) NOT NULL UNIQUE,  
            descripcion TEXT,  
            modulo VARCHAR(50)  
        );  
    END IF;  
END $$;

\-- Insertar nuevos permisos para M6  
INSERT INTO permisos (id\_permiso, nombre\_permiso, descripcion, modulo) VALUES  
(gen\_random\_uuid(), 'reportes\_visualizar', 'Permite visualizar reportes generados', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_generar', 'Permite generar nuevos reportes', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_descargar', 'Permite descargar reportes en diferentes formatos', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_editar', 'Permite editar y personalizar reportes', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_eliminar', 'Permite eliminar reportes generados', 'M6\_Reportes'),  
(gen\_random\_uuid(), 'reportes\_plantillas\_gestionar', 'Permite gestionar plantillas de reportes', 'M6\_Reportes')  
ON CONFLICT (nombre\_permiso) DO NOTHING;

\-- Asignar permisos a roles  
\-- Administrador: Todos los permisos  
INSERT INTO roles\_permisos (id\_rol, id\_permiso)  
SELECT   
    r.id\_rol,  
    p.id\_permiso  
FROM roles r  
CROSS JOIN permisos p  
WHERE r.nombre\_rol \= 'Administrador'  
  AND p.nombre\_permiso LIKE 'reportes\_%'  
  AND NOT EXISTS (  
      SELECT 1 FROM roles\_permisos rp   
      WHERE rp.id\_rol \= r.id\_rol AND rp.id\_permiso \= p.id\_permiso  
  );

\-- Encargado: Visualizar, generar y descargar (sin editar ni eliminar)  
INSERT INTO roles\_permisos (id\_rol, id\_permiso)  
SELECT   
    r.id\_rol,  
    p.id\_permiso  
FROM roles r  
CROSS JOIN permisos p  
WHERE r.nombre\_rol \= 'Encargado'  
  AND p.nombre\_permiso IN ('reportes\_visualizar', 'reportes\_generar', 'reportes\_descargar')  
  AND NOT EXISTS (  
      SELECT 1 FROM roles\_permisos rp   
      WHERE rp.id\_rol \= r.id\_rol AND rp.id\_permiso \= p.id\_permiso  
  );

\-- Empleado: Solo visualizar y descargar reportes predefinidos  
INSERT INTO roles\_permisos (id\_rol, id\_permiso)  
SELECT   
    r.id\_rol,  
    p.id\_permiso  
FROM roles r  
CROSS JOIN permisos p  
WHERE r.nombre\_rol \= 'Empleado'  
  AND p.nombre\_permiso IN ('reportes\_visualizar', 'reportes\_descargar')  
  AND NOT EXISTS (  
      SELECT 1 FROM roles\_permisos rp   
      WHERE rp.id\_rol \= r.id\_rol AND rp.id\_permiso \= p.id\_permiso  
  );  
8\. CONFIGURACIÓN DE SUPABASE STORAGE  
sql  
\-- Crear bucket para almacenar reportes generados  
INSERT INTO storage.buckets (id, name, public)   
VALUES ('reportes', 'reportes', false)  
ON CONFLICT (id) DO NOTHING;

\-- Configurar políticas de seguridad para el bucket de reportes  
CREATE POLICY "Usuarios autenticados pueden subir reportes"   
ON storage.objects   
FOR INSERT   
TO authenticated   
WITH CHECK (bucket\_id \= 'reportes');

CREATE POLICY "Usuarios autenticados pueden descargar reportes"   
ON storage.objects   
FOR SELECT   
TO authenticated   
USING (bucket\_id \= 'reportes');

CREATE POLICY "Usuarios pueden eliminar sus propios reportes"   
ON storage.objects   
FOR DELETE   
TO authenticated   
USING (bucket\_id \= 'reportes' AND owner \= auth.uid());  
9\. DATOS DE PRUEBA (OPCIONAL)  
sql  
\-- Insertar plantillas de ejemplo  
INSERT INTO reportes\_plantillas (id\_plantilla, nombre\_plantilla, tipo\_reporte, configuracion, id\_usuario\_creador, compartida)  
VALUES   
(  
    gen\_random\_uuid(),  
    'Reporte de insumos \- Resumen mensual',  
    'insumos',  
    '{"columnas": \["nombre", "categoria", "stock\_actual", "stock\_minimo", "estado"\], "filtros": {"categoria": "Alimento"}, "orden": \[{"campo": "nombre", "direccion": "ASC"}\], "formato\_default": "PDF"}',  
    (SELECT id\_usuario FROM usuarios WHERE rol \= 'Administrador' LIMIT 1),  
    true  
),  
(  
    gen\_random\_uuid(),  
    'Reporte de producción \- Vacas lecheras',  
    'produccion',  
    '{"columnas": \["origen", "fecha", "cantidad", "turno"\], "filtros": {"tipo": "LECHE"}, "orden": \[{"campo": "fecha", "direccion": "DESC"}\], "formato\_default": "EXCEL"}',  
    (SELECT id\_usuario FROM usuarios WHERE rol \= 'Administrador' LIMIT 1),  
    true  
);

\-- Insertar una alerta de ejemplo  
INSERT INTO reportes\_alertas (id\_alerta, tipo\_alerta, titulo, descripcion, nivel, fecha\_generacion, estado)  
VALUES (  
    gen\_random\_uuid(),  
    'general',  
    'Bienvenido al sistema de reportes',  
    'El nuevo módulo de reportes está disponible. Puede generar reportes de insumos, producción y reportes generales del sistema.',  
    'info',  
    CURRENT\_TIMESTAMP,  
    'pendiente'  
);  
10\. RESUMEN DE CAMBIOS EN BASE DE DATOS  
Componente	Cambios Obligatorios	Prioridad  
Tablas nuevas	4 tablas (reportes\_plantillas, reportes\_generados, reportes\_metadatos, reportes\_alertas)	ALTA  
Tablas modificadas	usuarios (3 campos nuevos), permisos (6 nuevos registros), roles\_permisos (nuevas asignaciones)	ALTA  
Vistas	3 nuevas vistas (vw\_reporte\_insumos, vw\_reporte\_produccion, vw\_reporte\_general\_resumen)	MEDIA  
Procedimientos almacenados	4 nuevos procedimientos	MEDIA  
Triggers	2 nuevos triggers	BAJA  
Índices	12+ nuevos índices para optimización	MEDIA  
Permisos RBAC	6 nuevos permisos para M6	ALTA  
Storage	1 nuevo bucket \+ 3 políticas	MEDIA  
11\. DIAGRAMA ENTIDAD-RELACIÓN  
text  
┌─────────────────────────────────────────────────────────────────────────────────────┐  
│                            NUEVAS TABLAS PARA M6 — REPORTES                         │  
├─────────────────────────────────────────────────────────────────────────────────────┤  
│                                                                                     │  
│  ┌────────────────────────┐          ┌────────────────────────────┐                │  
│  │ reportes\_plantillas    │          │ reportes\_generados         │                │  
│  ├────────────────────────┤          ├────────────────────────────┤                │  
│  │ id\_plantilla (PK)      │          │ id\_reporte\_generado (PK)   │                │  
│  │ nombre\_plantilla       │          │ tipo\_reporte               │                │  
│  │ tipo\_reporte           │          │ id\_usuario\_genero (FK) ────┼──────┐         │  
│  │ configuracion (JSONB)  │◄─────────│ parametros\_filtro (JSONB)  │      │         │  
│  │ id\_usuario\_creador (FK)├──────────│ formato\_descarga           │      │         │  
│  │ fecha\_creacion         │          │ ruta\_archivo               │      │         │  
│  │ fecha\_modificacion     │          │ tamanio\_bytes              │      │         │  
│  │ activo                 │          │ fecha\_generacion           │      │         │  
│  │ compartida             │          └────────────┬───────────────┘      │         │  
│  └────────────────────────┘                       │                      │         │  
│                                                   │                      │         │  
│                                                   ▼                      │         │  
│                                   ┌────────────────────────────┐        │         │  
│                                   │ reportes\_metadatos         │        │         │  
│                                   ├────────────────────────────┤        │         │  
│                                   │ id\_metadato (PK)           │        │         │  
│                                   │ id\_reporte\_generado (FK)   │        │         │  
│                                   │ clave                      │        │         │  
│                                   │ valor (TEXT)               │        │         │  
│                                   └────────────────────────────┘        │         │  
│                                                                         │         │  
│  ┌────────────────────────┐              ┌────────────────────────────┐│         │  
│  │ reportes\_alertas       │              │        usuarios             ││         │  
│  ├────────────────────────┤              ├────────────────────────────┤│         │  
│  │ id\_alerta (PK)         │              │ id\_usuario (PK)            ││         │  
│  │ tipo\_alerta            │              │ preferencias\_reportes (JSONB)│◄────────┘  
│  │ titulo                 │              │ ultima\_actividad            │  
│  │ descripcion            │              │ notificaciones\_reportes     │  
│  │ nivel                  │              │ ...                         │  
│  │ id\_usuario\_destino (FK)├──────────────┘                            │  
│  │ id\_referencia          │              └────────────────────────────┘  
│  │ fecha\_generacion       │  
│  │ fecha\_atendida         │              ┌────────────────────────────┐  
│  │ atendida\_por (FK)      ├──────────────┤        roles               │  
│  │ estado                 │              ├────────────────────────────┤  
│  └────────────────────────┘              │ ...                        │  
│                                          └────────────────────────────┘  
│  
└─────────────────────────────────────────────────────────────────────────────────────┘  
Fin del documento