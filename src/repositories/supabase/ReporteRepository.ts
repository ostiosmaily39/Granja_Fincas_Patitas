import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import type { IReporteRepository } from '../IReporteRepository';
import {
  ReportePlantillaSchema,
  ReporteGeneradoSchema,
  ReporteAlertaSchema,
  VwReporteInsumosSchema,
  VwReporteProduccionSchema,
  VwReporteGeneralResumenSchema,
  type ReportePlantilla,
  type CreateReportePlantilla,
  type ReporteGenerado,
  type ReporteAlerta,
  type VwReporteInsumos,
  type VwReporteProduccion,
  type VwReporteGeneralResumen,
  type TipoReporte,
  type EstadoAlerta
} from '@/types/domain/reporte.schema';

export class ReporteRepository implements IReporteRepository {
  private getClient(supabaseClient?: SupabaseClient): SupabaseClient {
    if (supabaseClient) return supabaseClient;
    return createClient();
  }

  // --- Plantillas ---
  async getPlantillas(tipo?: TipoReporte, supabaseClient?: SupabaseClient): Promise<ReportePlantilla[]> {
    const supabase = this.getClient(supabaseClient);
    let query = supabase
      .from('reportes_plantillas')
      .select('*')
      .eq('activo', true);

    if (tipo) {
      query = query.eq('tipo_reporte', tipo);
    }

    const { data, error } = await query.order('fecha_creacion', { ascending: false });
    if (error) throw new Error(error.message);
    return ReportePlantillaSchema.array().parse(data || []);
  }

  async getPlantillaById(id: string, supabaseClient?: SupabaseClient): Promise<ReportePlantilla | null> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase
      .from('reportes_plantillas')
      .select('*')
      .eq('id', id)
      .eq('activo', true)
      .single();

    if (error || !data) return null;
    return ReportePlantillaSchema.parse(data);
  }

  async createPlantilla(plantilla: CreateReportePlantilla, supabaseClient?: SupabaseClient): Promise<ReportePlantilla> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase
      .from('reportes_plantillas')
      .insert(plantilla)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ReportePlantillaSchema.parse(data);
  }

  async updatePlantilla(
    id: string,
    plantilla: Partial<CreateReportePlantilla>,
    supabaseClient?: SupabaseClient
  ): Promise<ReportePlantilla> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase
      .from('reportes_plantillas')
      .update({
        ...plantilla,
        fecha_modificacion: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ReportePlantillaSchema.parse(data);
  }

  async deletePlantilla(id: string, supabaseClient?: SupabaseClient): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    // Realizamos soft delete marcando activo = false
    const { error } = await supabase
      .from('reportes_plantillas')
      .update({ activo: false, fecha_modificacion: new Date().toISOString() })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  // --- Reportes Generados ---
  async getReportesGenerados(tipo?: TipoReporte, supabaseClient?: SupabaseClient): Promise<ReporteGenerado[]> {
    const supabase = this.getClient(supabaseClient);
    let query = supabase.from('reportes_generados').select('*');

    if (tipo) {
      query = query.eq('tipo_reporte', tipo);
    }

    const { data, error } = await query.order('fecha_generacion', { ascending: false });
    if (error) throw new Error(error.message);
    return ReporteGeneradoSchema.array().parse(data || []);
  }

  async createReporteGenerado(
    reporte: Omit<ReporteGenerado, 'id' | 'fecha_generacion'>,
    supabaseClient?: SupabaseClient
  ): Promise<ReporteGenerado> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase
      .from('reportes_generados')
      .insert(reporte)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return ReporteGeneradoSchema.parse(data);
  }

  async deleteReporteGenerado(id: string, supabaseClient?: SupabaseClient): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    const { error } = await supabase.from('reportes_generados').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  // --- Alertas ---
  async getAlertas(estado?: EstadoAlerta, supabaseClient?: SupabaseClient): Promise<ReporteAlerta[]> {
    const supabase = this.getClient(supabaseClient);
    let query = supabase.from('reportes_alertas').select('*');

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data, error } = await query.order('fecha_generacion', { ascending: false });
    if (error) throw new Error(error.message);
    return ReporteAlertaSchema.array().parse(data || []);
  }

  async atenderAlerta(
    id: string,
    usuarioId: string,
    estado: EstadoAlerta,
    supabaseClient?: SupabaseClient
  ): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    const { error } = await supabase
      .from('reportes_alertas')
      .update({
        estado,
        fecha_atendida: new Date().toISOString(),
        atendida_por: usuarioId
      })
      .eq('id', id);

    if (error) throw new Error(error.message);
  }

  async generarAlertasAutomaticas(supabaseClient?: SupabaseClient): Promise<void> {
    const supabase = this.getClient(supabaseClient);
    const { error } = await supabase.rpc('sp_generar_alertas_automaticas');
    if (error) throw new Error(error.message);
  }

  // --- Consultas a Vistas / Procedimientos ---
  async obtenerReporteInsumos(
    filtros: {
      fechaInicio?: string;
      fechaFin?: string;
      categoria?: string;
      estado?: string;
    },
    supabaseClient?: SupabaseClient
  ): Promise<VwReporteInsumos[]> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase.rpc('sp_generar_reporte_insumos', {
      p_fecha_inicio: filtros.fechaInicio || null,
      p_fecha_fin: filtros.fechaFin || null,
      p_categoria: filtros.categoria || null,
      p_estado: filtros.estado || null
    });

    if (error) throw new Error(error.message);
    return VwReporteInsumosSchema.array().parse(data || []);
  }

  async obtenerReporteProduccion(
    filtros: {
      fechaInicio?: string;
      fechaFin?: string;
      tipo?: string;
      idAnimal?: string;
      idLote?: string;
    },
    supabaseClient?: SupabaseClient
  ): Promise<VwReporteProduccion[]> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase.rpc('sp_generar_reporte_produccion', {
      p_fecha_inicio: filtros.fechaInicio || null,
      p_fecha_fin: filtros.fechaFin || null,
      p_tipo: filtros.tipo || null,
      p_id_animal: filtros.idAnimal || null,
      p_id_lote: filtros.idLote || null
    });

    if (error) throw new Error(error.message);
    return VwReporteProduccionSchema.array().parse(data || []);
  }

  async obtenerReporteGeneral(
    filtros: {
      fechaInicio?: string;
      fechaFin?: string;
    },
    supabaseClient?: SupabaseClient
  ): Promise<VwReporteGeneralResumen[]> {
    const supabase = this.getClient(supabaseClient);
    const { data, error } = await supabase.rpc('sp_generar_reporte_general', {
      p_fecha_inicio: filtros.fechaInicio || null,
      p_fecha_fin: filtros.fechaFin || null
    });

    if (error) throw new Error(error.message);

    // Mapear los resultados del procedimiento almacenado a nuestro esquema compatible
    // sp_generar_reporte_general retorna: indicador (VARCHAR), valor (NUMERIC), detalle (TEXT)
    // vw_reporte_general_resumen / VwReporteGeneralResumenSchema espera: seccion (string), total (number), detalle (string), cantidad (number)
    const mapped = (data || []).map((row: any) => ({
      seccion: row.indicador || '',
      total: Number(row.valor) || 0,
      detalle: row.detalle || null,
      cantidad: Number(row.valor) || 0
    }));

    return VwReporteGeneralResumenSchema.array().parse(mapped);
  }
}
