import { z } from 'zod';

export const TipoReporteEnum = z.enum(['insumos', 'produccion', 'general']);
export type TipoReporte = z.infer<typeof TipoReporteEnum>;

export const FormatoDescargaEnum = z.enum(['PDF', 'EXCEL', 'CSV']);
export type FormatoDescarga = z.infer<typeof FormatoDescargaEnum>;

export const TipoAlertaEnum = z.enum(['stock_bajo', 'vencimiento', 'vacunacion', 'parto', 'general']);
export type TipoAlerta = z.infer<typeof TipoAlertaEnum>;

export const NivelAlertaEnum = z.enum(['info', 'advertencia', 'critico']);
export type NivelAlerta = z.infer<typeof NivelAlertaEnum>;

export const EstadoAlertaEnum = z.enum(['pendiente', 'atendida', 'ignorada']);
export type EstadoAlerta = z.infer<typeof EstadoAlertaEnum>;

// Plantilla de Reporte
export const ReportePlantillaSchema = z.object({
  id: z.string().uuid(),
  nombre_plantilla: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  tipo_reporte: TipoReporteEnum,
  configuracion: z.record(z.string(), z.any()),
  id_usuario_creador: z.string().uuid(),
  fecha_creacion: z.string().optional(),
  fecha_modificacion: z.string().optional(),
  activo: z.boolean().default(true),
  compartida: z.boolean().default(false)
});

export type ReportePlantilla = z.infer<typeof ReportePlantillaSchema>;

export const CreateReportePlantillaSchema = ReportePlantillaSchema.omit({
  id: true,
  fecha_creacion: true,
  fecha_modificacion: true
});
export type CreateReportePlantilla = z.infer<typeof CreateReportePlantillaSchema>;

// Reporte Generado
export const ReporteGeneradoSchema = z.object({
  id: z.string().uuid(),
  tipo_reporte: TipoReporteEnum,
  id_usuario_genero: z.string().uuid(),
  parametros_filtro: z.record(z.string(), z.any()),
  formato_descarga: FormatoDescargaEnum,
  ruta_archivo: z.string(),
  tamanio_bytes: z.number().nullable().optional(),
  fecha_generacion: z.string().optional()
});

export type ReporteGenerado = z.infer<typeof ReporteGeneradoSchema>;

// Alerta de Reporte
export const ReporteAlertaSchema = z.object({
  id: z.string().uuid(),
  tipo_alerta: TipoAlertaEnum,
  titulo: z.string(),
  descripcion: z.string(),
  nivel: NivelAlertaEnum.default('info'),
  id_usuario_destino: z.string().uuid().nullable().optional(),
  id_referencia: z.string().uuid().nullable().optional(),
  fecha_generacion: z.string().optional(),
  fecha_atendida: z.string().nullable().optional(),
  atendida_por: z.string().uuid().nullable().optional(),
  estado: EstadoAlertaEnum.default('pendiente')
});

export type ReporteAlerta = z.infer<typeof ReporteAlertaSchema>;

// Esquemas para Vistas
export const VwReporteInsumosSchema = z.object({
  id_insumo: z.string().uuid(),
  nombre: z.string(),
  categoria: z.string(),
  unidad_medida: z.string(),
  stock_actual: z.number(),
  fecha_vencimiento: z.string().nullable().optional(),
  stock_minimo: z.number(),
  proveedor: z.string().nullable().optional(),
  fecha_registro: z.string(),
  estado: z.string(),
  total_movimientos: z.number(),
  total_entradas: z.number(),
  total_salidas: z.number(),
  saldo_calculado: z.number()
});

export type VwReporteInsumos = z.infer<typeof VwReporteInsumosSchema>;

export const VwReporteProduccionSchema = z.object({
  id_produccion: z.string().uuid().optional(),
  fecha_recoleccion: z.string(),
  origen: z.string(),
  especie: z.string(),
  raza: z.string().nullable().optional(),
  tipo: z.enum(['LECHE', 'HUEVO']),
  cantidad: z.number(),
  unidad_medida: z.string(),
  id_animal: z.string().uuid().nullable().optional(),
  id_lote: z.string().uuid().nullable().optional(),
  turno: z.string().nullable().optional(),
  estado_animal: z.string().nullable().optional(),
  usuario_registro: z.string().nullable().optional(),
  id_usuario_registro: z.string().uuid().nullable().optional()
});

export type VwReporteProduccion = z.infer<typeof VwReporteProduccionSchema>;

export const VwReporteGeneralResumenSchema = z.object({
  seccion: z.string(),
  total: z.number(),
  detalle: z.string().nullable().optional(),
  cantidad: z.number()
});

export type VwReporteGeneralResumen = z.infer<typeof VwReporteGeneralResumenSchema>;
