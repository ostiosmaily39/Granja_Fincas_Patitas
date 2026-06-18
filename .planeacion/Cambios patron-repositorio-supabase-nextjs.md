\# Patrón Repositorio con Supabase en Next.js \+ TypeScript  
\#\# Adaptado para Módulo M6 — Reportes

Arquitectura genérica que permite intercambir Supabase por una API REST sin tocar la lógica de negocio.  
Versión actualizada para incluir el nuevo módulo de Reportes.

\---

\#\# Estructura de carpetas  
src/  
├── app/  
│ ├── layout.tsx ← Paso 10 (raíz)  
│ ├── globals.css  
│ ├── animales/  
│ │ └── page.tsx ← Paso 8 (página)  
│ ├── insumos/  
│ │ └── page.tsx ← Paso 8 (página)  
│ ├── produccion/  
│ │ └── page.tsx ← Paso 8 (página)  
│ └── reportes/  
│ ├── page.tsx ← Paso 8 (página reportes)  
│ ├── insumos/  
│ │ └── page.tsx ← Paso 8 (reporte insumos)  
│ ├── produccion/  
│ │ └── page.tsx ← Paso 8 (reporte producción)  
│ └── general/  
│ └── page.tsx ← Paso 8 (reporte general)  
├── components/  
│ ├── AnimalList.tsx ← Paso 7  
│ ├── InsumoList.tsx ← Paso 7  
│ ├── ProduccionForm.tsx ← Paso 7  
│ └── reportes/  
│ ├── ReporteInsumos.tsx ← Paso 7 (NUEVO)  
│ ├── ReporteProduccion.tsx ← Paso 7 (NUEVO)  
│ └── ReporteGeneral.tsx ← Paso 7 (NUEVO)  
├── hooks/  
│ ├── useAnimals.ts ← Paso 6  
│ ├── useInsumos.ts ← Paso 6  
│ ├── useProduccion.ts ← Paso 6  
│ └── useReportes.ts ← Paso 6 (NUEVO)  
├── services/  
│ ├── animalService.ts ← Paso 5  
│ ├── insumoService.ts ← Paso 5  
│ ├── produccionService.ts ← Paso 5  
│ └── reporteService.ts ← Paso 5 (NUEVO)  
├── repositories/  
│ ├── IAnimalRepository.ts ← Paso 2  
│ ├── IInsumoRepository.ts ← Paso 2  
│ ├── IProduccionRepository.ts ← Paso 2  
│ ├── IReporteRepository.ts ← Paso 2 (NUEVO)  
│ └── supabase/  
│ ├── AnimalRepository.ts ← Paso 3  
│ ├── InsumoRepository.ts ← Paso 3  
│ ├── ProduccionRepository.ts ← Paso 3  
│ └── ReporteRepository.ts ← Paso 3 (NUEVO)  
└── types/  
└── domain/  
├── animal.schema.ts ← Paso 1  
├── insumo.schema.ts ← Paso 1  
├── produccion.schema.ts ← Paso 1  
└── reporte.schema.ts ← Paso 1 (NUEVO)

text

\---

\#\# Paso 1 — Dominio \+ Zod (NUEVO: reporte.schema.ts)

\#\#\# \`src/types/domain/animal.schema.ts\`

\`\`\`typescript  
import { z } from 'zod'

export const AnimalSchema \= z.object({  
  id:             z.string().uuid(),  
  identificador:  z.string().min(1).max(20),  
  especie:        z.enum(\['vaca', 'cerdo', 'gallina'\]),  
  raza:           z.string().min(1),  
  sexo:           z.enum(\['macho', 'hembra'\]),  
  fecha\_nacimiento: z.string().datetime(),  
  peso\_actual:    z.number().positive(),  
  estado\_salud:   z.string().default('Sano'),  
  estado:         z.enum(\['Activo', 'Inactivo', 'Egresado'\]).default('Activo'),  
  id\_usuario\_registro: z.string().uuid(),  
})

export const CreateAnimalSchema \= AnimalSchema.omit({ id: true })

export type Animal \= z.infer\<typeof AnimalSchema\>  
export type CreateAnimal \= z.infer\<typeof CreateAnimalSchema\>  
src/types/domain/insumo.schema.ts  
typescript  
import { z } from 'zod'

export const InsumoSchema \= z.object({  
  id:               z.string().uuid(),  
  nombre:           z.string().min(1).max(100),  
  categoria:        z.enum(\['alimento', 'medicamento', 'otro'\]),  
  unidad\_medida:    z.string().min(1),  
  stock\_actual:     z.number().nonnegative(),  
  stock\_minimo:     z.number().nonnegative(),  
  fecha\_vencimiento: z.string().datetime().nullable(),  
  proveedor:        z.string().optional(),  
  id\_usuario\_registro: z.string().uuid(),  
})

export const CreateInsumoSchema \= InsumoSchema.omit({ id: true })

export type Insumo \= z.infer\<typeof InsumoSchema\>  
export type CreateInsumo \= z.infer\<typeof CreateInsumoSchema\>  
src/types/domain/produccion.schema.ts  
typescript  
import { z } from 'zod'

export const ProduccionSchema \= z.object({  
  id:               z.string().uuid(),  
  fecha\_recoleccion: z.string().datetime(),  
  tipo:             z.enum(\['leche', 'huevo'\]),  
  cantidad:         z.number().positive(),  
  unidad\_medida:    z.string(),  
  turno:            z.enum(\['mañana', 'tarde', 'noche'\]).optional(),  
  id\_animal:        z.string().uuid().nullable(),  
  id\_lote:          z.string().uuid().nullable(),  
  id\_usuario\_registro: z.string().uuid(),  
})

export const CreateProduccionSchema \= ProduccionSchema.omit({ id: true })

export type Produccion \= z.infer\<typeof ProduccionSchema\>  
export type CreateProduccion \= z.infer\<typeof CreateProduccionSchema\>  
src/types/domain/reporte.schema.ts ← NUEVO  
typescript  
import { z } from 'zod'

// Tipos para reportes generados  
export const ReporteGeneradoSchema \= z.object({  
  id\_reporte\_generado: z.string().uuid(),  
  tipo\_reporte:        z.enum(\['insumos', 'produccion', 'general'\]),  
  id\_usuario\_genero:   z.string().uuid(),  
  parametros\_filtro:   z.record(z.any()),  
  formato\_descarga:    z.enum(\['PDF', 'EXCEL', 'CSV'\]),  
  ruta\_archivo:        z.string(),  
  tamanio\_bytes:       z.number().int().nullable(),  
  fecha\_generacion:    z.string().datetime(),  
})

// Tipos para plantillas de reportes  
export const ReportePlantillaSchema \= z.object({  
  id\_plantilla:      z.string().uuid(),  
  nombre\_plantilla:  z.string().min(1).max(100),  
  tipo\_reporte:      z.enum(\['insumos', 'produccion', 'general'\]),  
  configuracion:     z.record(z.any()), // Columnas, filtros, orden, formato  
  id\_usuario\_creador: z.string().uuid(),  
  fecha\_creacion:    z.string().datetime(),  
  compartida:        z.boolean().default(false),  
})

// Tipos para alertas  
export const ReporteAlertaSchema \= z.object({  
  id\_alerta:          z.string().uuid(),  
  tipo\_alerta:        z.enum(\['stock\_bajo', 'vencimiento', 'vacunacion', 'parto', 'general'\]),  
  titulo:             z.string().min(1).max(100),  
  descripcion:        z.string(),  
  nivel:              z.enum(\['info', 'advertencia', 'critico'\]).default('info'),  
  id\_usuario\_destino: z.string().uuid().nullable(),  
  id\_referencia:      z.number().nullable(),  
  fecha\_generacion:   z.string().datetime(),  
  fecha\_atendida:     z.string().datetime().nullable(),  
  estado:             z.enum(\['pendiente', 'atendida', 'ignorada'\]).default('pendiente'),  
})

// Filtros para reportes  
export const FiltroReporteInsumosSchema \= z.object({  
  fecha\_inicio: z.string().datetime().optional(),  
  fecha\_fin:    z.string().datetime().optional(),  
  categoria:    z.enum(\['alimento', 'medicamento', 'otro'\]).optional(),  
  estado:       z.enum(\['normal', 'bajo', 'agotado', 'proximo\_a\_vencer'\]).optional(),  
})

export const FiltroReporteProduccionSchema \= z.object({  
  fecha\_inicio: z.string().datetime().optional(),  
  fecha\_fin:    z.string().datetime().optional(),  
  tipo:         z.enum(\['leche', 'huevo'\]).optional(),  
  id\_animal:    z.string().uuid().optional(),  
  id\_lote:      z.string().uuid().optional(),  
})

export const FiltroReporteGeneralSchema \= z.object({  
  fecha\_inicio: z.string().datetime().optional(),  
  fecha\_fin:    z.string().datetime().optional(),  
  modulos:      z.array(z.enum(\['inventario', 'salud', 'reproduccion', 'insumos', 'produccion'\])).optional(),  
})

export type ReporteGenerado \= z.infer\<typeof ReporteGeneradoSchema\>  
export type ReportePlantilla \= z.infer\<typeof ReportePlantillaSchema\>  
export type ReporteAlerta \= z.infer\<typeof ReporteAlertaSchema\>  
export type FiltroReporteInsumos \= z.infer\<typeof FiltroReporteInsumosSchema\>  
export type FiltroReporteProduccion \= z.infer\<typeof FiltroReporteProduccionSchema\>  
export type FiltroReporteGeneral \= z.infer\<typeof FiltroReporteGeneralSchema\>

// Tipos de respuesta de reportes  
export interface ReporteInsumosResponse {  
  insumos: Array\<{  
    id: string  
    nombre: string  
    categoria: string  
    stock\_actual: number  
    stock\_minimo: number  
    fecha\_vencimiento: string | null  
    estado: 'normal' | 'bajo' | 'agotado' | 'proximo\_a\_vencer'  
    total\_movimientos: number  
    total\_entradas: number  
    total\_salidas: number  
  }\>  
  total\_registros: number  
  fecha\_generacion: string  
}

export interface ReporteProduccionResponse {  
  produccion: Array\<{  
    id: string  
    fecha\_recoleccion: string  
    origen: string  
    especie: string  
    tipo: string  
    cantidad: number  
    unidad\_medida: string  
  }\>  
  total\_produccion: {  
    leche: number  
    huevos: number  
  }  
  promedio\_diario: number  
  fecha\_generacion: string  
}

export interface ReporteGeneralResponse {  
  resumen\_animales: {  
    total: number  
    por\_especie: Record\<string, number\>  
  }  
  resumen\_insumos: {  
    total: number  
    criticos: number  
  }  
  resumen\_produccion: {  
    leche\_mes: number  
    huevos\_mes: number  
  }  
  vacunaciones\_pendientes: number  
  fecha\_generacion: string  
}  
Paso 2 — Interfaz (el contrato inmutable)  
src/repositories/IAnimalRepository.ts  
typescript  
import type { Animal, CreateAnimal } from '@/types/domain/animal.schema'

export interface IAnimalRepository {  
  getAll(): Promise\<Animal\[\]\>  
  getById(id: string): Promise\<Animal | null\>  
  create(data: CreateAnimal): Promise\<Animal\>  
  update(id: string, data: Partial\<CreateAnimal\>): Promise\<Animal\>  
  delete(id: string): Promise\<void\>  
  search(filters: Record\<string, any\>): Promise\<Animal\[\]\>  
}  
src/repositories/IInsumoRepository.ts  
typescript  
import type { Insumo, CreateInsumo } from '@/types/domain/insumo.schema'

export interface IInsumoRepository {  
  getAll(): Promise\<Insumo\[\]\>  
  getById(id: string): Promise\<Insumo | null\>  
  create(data: CreateInsumo): Promise\<Insumo\>  
  update(id: string, data: Partial\<CreateInsumo\>): Promise\<Insumo\>  
  delete(id: string): Promise\<void\>  
  agregarStock(id: string, cantidad: number): Promise\<Insumo\>  
  descontarStock(id: string, cantidad: number, motivo: string): Promise\<Insumo\>  
  getByCategoria(categoria: string): Promise\<Insumo\[\]\>  
  getStockBajo(): Promise\<Insumo\[\]\>  
}  
src/repositories/IProduccionRepository.ts  
typescript  
import type { Produccion, CreateProduccion } from '@/types/domain/produccion.schema'

export interface IProduccionRepository {  
  getAll(): Promise\<Produccion\[\]\>  
  getById(id: string): Promise\<Produccion | null\>  
  create(data: CreateProduccion): Promise\<Produccion\>  
  update(id: string, data: Partial\<CreateProduccion\>): Promise\<Produccion\>  
  delete(id: string): Promise\<void\>  
  getByAnimal(id\_animal: string): Promise\<Produccion\[\]\>  
  getByLote(id\_lote: string): Promise\<Produccion\[\]\>  
  getByFecha(fecha: string): Promise\<Produccion\[\]\>  
  getByRangoFechas(fecha\_inicio: string, fecha\_fin: string): Promise\<Produccion\[\]\>  
}  
src/repositories/IReporteRepository.ts ← NUEVO  
typescript  
import type {  
  ReporteGenerado,  
  ReportePlantilla,  
  ReporteAlerta,  
  FiltroReporteInsumos,  
  FiltroReporteProduccion,  
  FiltroReporteGeneral,  
  ReporteInsumosResponse,  
  ReporteProduccionResponse,  
  ReporteGeneralResponse  
} from '@/types/domain/reporte.schema'

export interface IReporteRepository {  
  // Generación de reportes  
  generarReporteInsumos(filtros: FiltroReporteInsumos): Promise\<ReporteInsumosResponse\>  
  generarReporteProduccion(filtros: FiltroReporteProduccion): Promise\<ReporteProduccionResponse\>  
  generarReporteGeneral(filtros: FiltroReporteGeneral): Promise\<ReporteGeneralResponse\>  
    
  // Plantillas  
  guardarPlantilla(data: Omit\<ReportePlantilla, 'id\_plantilla' | 'fecha\_creacion'\>): Promise\<ReportePlantilla\>  
  obtenerPlantillas(id\_usuario: string): Promise\<ReportePlantilla\[\]\>  
  obtenerPlantillaPorId(id\_plantilla: string): Promise\<ReportePlantilla | null\>  
  actualizarPlantilla(id\_plantilla: string, data: Partial\<ReportePlantilla\>): Promise\<ReportePlantilla\>  
  eliminarPlantilla(id\_plantilla: string): Promise\<void\>  
    
  // Reportes generados (historial)  
  guardarReporteGenerado(data: Omit\<ReporteGenerado, 'id\_reporte\_generado' | 'fecha\_generacion'\>): Promise\<ReporteGenerado\>  
  obtenerReportesGenerados(id\_usuario: string): Promise\<ReporteGenerado\[\]\>  
  obtenerReporteGeneradoPorId(id\_reporte: string): Promise\<ReporteGenerado | null\>  
    
  // Alertas  
  obtenerAlertasPendientes(id\_usuario?: string): Promise\<ReporteAlerta\[\]\>  
  obtenerAlertasPorTipo(tipo: string): Promise\<ReporteAlerta\[\]\>  
  marcarAlertaAtendida(id\_alerta: string, id\_usuario: string): Promise\<ReporteAlerta\>  
  generarAlerta(data: Omit\<ReporteAlerta, 'id\_alerta' | 'fecha\_generacion' | 'fecha\_atendida' | 'estado'\>): Promise\<ReporteAlerta\>  
    
  // Exportación  
  exportarReporte(id\_reporte\_generado: string, formato: 'PDF' | 'EXCEL' | 'CSV'): Promise\<Buffer | string\>  
}  
Paso 3 — Implementación Supabase (NUEVO: ReporteRepository)  
src/repositories/supabase/AnimalRepository.ts  
typescript  
import { createClient } from '@supabase/supabase-js'  
import { AnimalSchema, CreateAnimalSchema } from '@/types/domain/animal.schema'  
import type { IAnimalRepository } from '../IAnimalRepository'  
import type { Animal, CreateAnimal } from '@/types/domain/animal.schema'

const supabase \= createClient(  
  process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
  process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!  
)

export class SupabaseAnimalRepository implements IAnimalRepository {  
  async getAll(): Promise\<Animal\[\]\> {  
    const { data, error } \= await supabase  
      .from('animales')  
      .select('\*')  
      .eq('estado', 'Activo')  
    if (error) throw new Error(error.message)  
    return AnimalSchema.array().parse(data)  
  }

  async getById(id: string): Promise\<Animal | null\> {  
    const { data, error } \= await supabase  
      .from('animales')  
      .select('\*')  
      .eq('id', id)  
      .single()  
    if (error) return null  
    return AnimalSchema.parse(data)  
  }

  async create(input: CreateAnimal): Promise\<Animal\> {  
    const validated \= CreateAnimalSchema.parse(input)  
    const { data, error } \= await supabase  
      .from('animales')  
      .insert(validated)  
      .select()  
      .single()  
    if (error) throw new Error(error.message)  
    return AnimalSchema.parse(data)  
  }

  async update(id: string, data: Partial\<CreateAnimal\>): Promise\<Animal\> {  
    const { data: updated, error } \= await supabase  
      .from('animales')  
      .update(data)  
      .eq('id', id)  
      .select()  
      .single()  
    if (error) throw new Error(error.message)  
    return AnimalSchema.parse(updated)  
  }

  async delete(id: string): Promise\<void\> {  
    const { error } \= await supabase  
      .from('animales')  
      .update({ estado: 'Inactivo' })  
      .eq('id', id)  
    if (error) throw new Error(error.message)  
  }

  async search(filters: Record\<string, any\>): Promise\<Animal\[\]\> {  
    let query \= supabase.from('animales').select('\*')  
    Object.entries(filters).forEach((\[key, value\]) \=\> {  
      if (value) query \= query.eq(key, value)  
    })  
    const { data, error } \= await query  
    if (error) throw new Error(error.message)  
    return AnimalSchema.array().parse(data)  
  }  
}  
src/repositories/supabase/InsumoRepository.ts  
typescript  
import { createClient } from '@supabase/supabase-js'  
import { InsumoSchema, CreateInsumoSchema } from '@/types/domain/insumo.schema'  
import type { IInsumoRepository } from '../IInsumoRepository'  
import type { Insumo, CreateInsumo } from '@/types/domain/insumo.schema'

const supabase \= createClient(  
  process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
  process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!  
)

export class SupabaseInsumoRepository implements IInsumoRepository {  
  async getAll(): Promise\<Insumo\[\]\> {  
    const { data, error } \= await supabase.from('insumos').select('\*')  
    if (error) throw new Error(error.message)  
    return InsumoSchema.array().parse(data)  
  }

  async getById(id: string): Promise\<Insumo | null\> {  
    const { data, error } \= await supabase  
      .from('insumos')  
      .select('\*')  
      .eq('id', id)  
      .single()  
    if (error) return null  
    return InsumoSchema.parse(data)  
  }

  async create(input: CreateInsumo): Promise\<Insumo\> {  
    const validated \= CreateInsumoSchema.parse(input)  
    const { data, error } \= await supabase  
      .from('insumos')  
      .insert(validated)  
      .select()  
      .single()  
    if (error) throw new Error(error.message)  
    return InsumoSchema.parse(data)  
  }

  async update(id: string, data: Partial\<CreateInsumo\>): Promise\<Insumo\> {  
    const { data: updated, error } \= await supabase  
      .from('insumos')  
      .update(data)  
      .eq('id', id)  
      .select()  
      .single()  
    if (error) throw new Error(error.message)  
    return InsumoSchema.parse(updated)  
  }

  async delete(id: string): Promise\<void\> {  
    const { error } \= await supabase  
      .from('insumos')  
      .delete()  
      .eq('id', id)  
    if (error) throw new Error(error.message)  
  }

  async agregarStock(id: string, cantidad: number): Promise\<Insumo\> {  
    const insumo \= await this.getById(id)  
    if (\!insumo) throw new Error('Insumo no encontrado')  
      
    const nuevoStock \= insumo.stock\_actual \+ cantidad  
    const { data, error } \= await supabase  
      .from('insumos')  
      .update({ stock\_actual: nuevoStock })  
      .eq('id', id)  
      .select()  
      .single()  
    if (error) throw new Error(error.message)  
    return InsumoSchema.parse(data)  
  }

  async descontarStock(id: string, cantidad: number, motivo: string): Promise\<Insumo\> {  
    const insumo \= await this.getById(id)  
    if (\!insumo) throw new Error('Insumo no encontrado')  
    if (insumo.stock\_actual \< cantidad) throw new Error('Stock insuficiente')  
      
    const nuevoStock \= insumo.stock\_actual \- cantidad  
    const { data, error } \= await supabase  
      .from('insumos')  
      .update({ stock\_actual: nuevoStock })  
      .eq('id', id)  
      .select()  
      .single()  
    if (error) throw new Error(error.message)  
      
    // Registrar movimiento en historial  
    await supabase.from('movimientos\_insumos').insert({  
      id\_insumo: id,  
      tipo: 'SALIDA',  
      cantidad: cantidad,  
      motivo: motivo,  
      saldo\_resultante: nuevoStock  
    })  
      
    return InsumoSchema.parse(data)  
  }

  async getByCategoria(categoria: string): Promise\<Insumo\[\]\> {  
    const { data, error } \= await supabase  
      .from('insumos')  
      .select('\*')  
      .eq('categoria', categoria)  
    if (error) throw new Error(error.message)  
    return InsumoSchema.array().parse(data)  
  }

  async getStockBajo(): Promise\<Insumo\[\]\> {  
    const { data, error } \= await supabase  
      .from('insumos')  
      .select('\*')  
      .lte('stock\_actual', 'stock\_minimo')  
      .gt('stock\_minimo', 0\)  
    if (error) throw new Error(error.message)  
    return InsumoSchema.array().parse(data)  
  }  
}  
src/repositories/supabase/ReporteRepository.ts ← NUEVO  
typescript  
import { createClient } from '@supabase/supabase-js'  
import {  
  ReporteGeneradoSchema,  
  ReportePlantillaSchema,  
  ReporteAlertaSchema,  
  FiltroReporteInsumosSchema,  
  FiltroReporteProduccionSchema,  
  FiltroReporteGeneralSchema  
} from '@/types/domain/reporte.schema'  
import type { IReporteRepository } from '../IReporteRepository'  
import type {  
  ReporteGenerado,  
  ReportePlantilla,  
  ReporteAlerta,  
  FiltroReporteInsumos,  
  FiltroReporteProduccion,  
  FiltroReporteGeneral,  
  ReporteInsumosResponse,  
  ReporteProduccionResponse,  
  ReporteGeneralResponse  
} from '@/types/domain/reporte.schema'

const supabase \= createClient(  
  process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,  
  process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!  
)

export class SupabaseReporteRepository implements IReporteRepository {  
    
  // \=== Generación de reportes \===  
    
  async generarReporteInsumos(filtros: FiltroReporteInsumos): Promise\<ReporteInsumosResponse\> {  
    const validated \= FiltroReporteInsumosSchema.parse(filtros)  
      
    // Construir la consulta base  
    let query \= supabase  
      .from('vw\_reporte\_insumos')  
      .select('\*')  
      
    if (validated.fecha\_inicio) {  
      query \= query.gte('fecha\_registro', validated.fecha\_inicio)  
    }  
    if (validated.fecha\_fin) {  
      query \= query.lte('fecha\_registro', validated.fecha\_fin)  
    }  
    if (validated.categoria) {  
      query \= query.eq('categoria', validated.categoria)  
    }  
    if (validated.estado) {  
      query \= query.eq('estado', validated.estado)  
    }  
      
    const { data, error } \= await query  
      
    if (error) throw new Error(\`Error al generar reporte de insumos: ${error.message}\`)  
      
    return {  
      insumos: data || \[\],  
      total\_registros: data?.length || 0,  
      fecha\_generacion: new Date().toISOString()  
    }  
  }

  async generarReporteProduccion(filtros: FiltroReporteProduccion): Promise\<ReporteProduccionResponse\> {  
    const validated \= FiltroReporteProduccionSchema.parse(filtros)  
      
    let query \= supabase  
      .from('vw\_reporte\_produccion')  
      .select('\*')  
      
    if (validated.fecha\_inicio) {  
      query \= query.gte('fecha\_recoleccion', validated.fecha\_inicio)  
    }  
    if (validated.fecha\_fin) {  
      query \= query.lte('fecha\_recoleccion', validated.fecha\_fin)  
    }  
    if (validated.tipo) {  
      query \= query.eq('tipo', validated.tipo)  
    }  
    if (validated.id\_animal) {  
      query \= query.eq('id\_animal', validated.id\_animal)  
    }  
    if (validated.id\_lote) {  
      query \= query.eq('id\_lote', validated.id\_lote)  
    }  
      
    query \= query.order('fecha\_recoleccion', { ascending: false })  
      
    const { data, error } \= await query  
      
    if (error) throw new Error(\`Error al generar reporte de producción: ${error.message}\`)  
      
    // Calcular totales  
    const totalLeche \= data?.filter(d \=\> d.tipo \=== 'leche').reduce((acc, d) \=\> acc \+ d.cantidad, 0\) || 0  
    const totalHuevos \= data?.filter(d \=\> d.tipo \=== 'huevo').reduce((acc, d) \=\> acc \+ d.cantidad, 0\) || 0  
    const promedioDiario \= data?.length ? (totalLeche \+ totalHuevos) / data.length : 0  
      
    return {  
      produccion: data || \[\],  
      total\_produccion: {  
        leche: totalLeche,  
        huevos: totalHuevos  
      },  
      promedio\_diario: promedioDiario,  
      fecha\_generacion: new Date().toISOString()  
    }  
  }

  async generarReporteGeneral(filtros: FiltroReporteGeneral): Promise\<ReporteGeneralResponse\> {  
    const validated \= FiltroReporteGeneralSchema.parse(filtros)  
      
    const \[animalesResult, insumosResult, produccionResult, vacunacionesResult\] \= await Promise.all(\[  
      // Resumen de animales  
      supabase  
        .from('animales')  
        .select('especie', { count: 'exact' })  
        .eq('estado', 'Activo'),  
        
      // Resumen de insumos  
      supabase  
        .from('insumos')  
        .select('stock\_actual, stock\_minimo'),  
        
      // Resumen de producción  
      supabase  
        .from('produccion')  
        .select('tipo, cantidad')  
        .gte('fecha\_recoleccion', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),  
        
      // Vacunaciones pendientes  
      supabase  
        .from('vacunaciones')  
        .select('\*', { count: 'exact' })  
        .eq('estado', 'Pendiente')  
        .lte('proxima\_dosis', new Date(Date.now() \+ 7 \* 24 \* 60 \* 60 \* 1000).toISOString())  
    \])  
      
    // Procesar resultados  
    const porEspecie: Record\<string, number\> \= {}  
    animalesResult.data?.forEach(a \=\> {  
      porEspecie\[a.especie\] \= (porEspecie\[a.especie\] || 0\) \+ 1  
    })  
      
    const totalInsumos \= insumosResult.data?.length || 0  
    const insumosCriticos \= insumosResult.data?.filter(i \=\> i.stock\_actual \<= i.stock\_minimo).length || 0  
      
    const lecheMes \= produccionResult.data?.filter(p \=\> p.tipo \=== 'leche').reduce((acc, p) \=\> acc \+ p.cantidad, 0\) || 0  
    const huevosMes \= produccionResult.data?.filter(p \=\> p.tipo \=== 'huevo').reduce((acc, p) \=\> acc \+ p.cantidad, 0\) || 0  
      
    return {  
      resumen\_animales: {  
        total: animalesResult.data?.length || 0,  
        por\_especie: porEspecie  
      },  
      resumen\_insumos: {  
        total: totalInsumos,  
        criticos: insumosCriticos  
      },  
      resumen\_produccion: {  
        leche\_mes: lecheMes,  
        huevos\_mes: huevosMes  
      },  
      vacunaciones\_pendientes: vacunacionesResult.data?.length || 0,  
      fecha\_generacion: new Date().toISOString()  
    }  
  }

  // \=== Plantillas \===

  async guardarPlantilla(data: Omit\<ReportePlantilla, 'id\_plantilla' | 'fecha\_creacion'\>): Promise\<ReportePlantilla\> {  
    const { data: result, error } \= await supabase  
      .from('reportes\_plantillas')  
      .insert({  
        nombre\_plantilla: data.nombre\_plantilla,  
        tipo\_reporte: data.tipo\_reporte,  
        configuracion: data.configuracion,  
        id\_usuario\_creador: data.id\_usuario\_creador,  
        compartida: data.compartida || false  
      })  
      .select()  
      .single()  
      
    if (error) throw new Error(\`Error al guardar plantilla: ${error.message}\`)  
    return ReportePlantillaSchema.parse(result)  
  }

  async obtenerPlantillas(id\_usuario: string): Promise\<ReportePlantilla\[\]\> {  
    const { data, error } \= await supabase  
      .from('reportes\_plantillas')  
      .select('\*')  
      .or(\`id\_usuario\_creador.eq.${id\_usuario},compartida.eq.true\`)  
      
    if (error) throw new Error(\`Error al obtener plantillas: ${error.message}\`)  
    return ReportePlantillaSchema.array().parse(data || \[\])  
  }

  async obtenerPlantillaPorId(id\_plantilla: string): Promise\<ReportePlantilla | null\> {  
    const { data, error } \= await supabase  
      .from('reportes\_plantillas')  
      .select('\*')  
      .eq('id\_plantilla', id\_plantilla)  
      .single()  
      
    if (error) return null  
    return ReportePlantillaSchema.parse(data)  
  }

  async actualizarPlantilla(id\_plantilla: string, data: Partial\<ReportePlantilla\>): Promise\<ReportePlantilla\> {  
    const { data: result, error } \= await supabase  
      .from('reportes\_plantillas')  
      .update(data)  
      .eq('id\_plantilla', id\_plantilla)  
      .select()  
      .single()  
      
    if (error) throw new Error(\`Error al actualizar plantilla: ${error.message}\`)  
    return ReportePlantillaSchema.parse(result)  
  }

  async eliminarPlantilla(id\_plantilla: string): Promise\<void\> {  
    const { error } \= await supabase  
      .from('reportes\_plantillas')  
      .delete()  
      .eq('id\_plantilla', id\_plantilla)  
      
    if (error) throw new Error(\`Error al eliminar plantilla: ${error.message}\`)  
  }

  // \=== Reportes generados \===

  async guardarReporteGenerado(data: Omit\<ReporteGenerado, 'id\_reporte\_generado' | 'fecha\_generacion'\>): Promise\<ReporteGenerado\> {  
    const { data: result, error } \= await supabase  
      .from('reportes\_generados')  
      .insert({  
        tipo\_reporte: data.tipo\_reporte,  
        id\_usuario\_genero: data.id\_usuario\_genero,  
        parametros\_filtro: data.parametros\_filtro,  
        formato\_descarga: data.formato\_descarga,  
        ruta\_archivo: data.ruta\_archivo,  
        tamanio\_bytes: data.tamanio\_bytes  
      })  
      .select()  
      .single()  
      
    if (error) throw new Error(\`Error al guardar reporte generado: ${error.message}\`)  
    return ReporteGeneradoSchema.parse(result)  
  }

  async obtenerReportesGenerados(id\_usuario: string): Promise\<ReporteGenerado\[\]\> {  
    const { data, error } \= await supabase  
      .from('reportes\_generados')  
      .select('\*')  
      .eq('id\_usuario\_genero', id\_usuario)  
      .order('fecha\_generacion', { ascending: false })  
      
    if (error) throw new Error(\`Error al obtener reportes generados: ${error.message}\`)  
    return ReporteGeneradoSchema.array().parse(data || \[\])  
  }

  async obtenerReporteGeneradoPorId(id\_reporte: string): Promise\<ReporteGenerado | null\> {  
    const { data, error } \= await supabase  
      .from('reportes\_generados')  
      .select('\*')  
      .eq('id\_reporte\_generado', id\_reporte)  
      .single()  
      
    if (error) return null  
    return ReporteGeneradoSchema.parse(data)  
  }

  // \=== Alertas \===

  async obtenerAlertasPendientes(id\_usuario?: string): Promise\<ReporteAlerta\[\]\> {  
    let query \= supabase  
      .from('reportes\_alertas')  
      .select('\*')  
      .eq('estado', 'pendiente')  
      
    if (id\_usuario) {  
      query \= query.eq('id\_usuario\_destino', id\_usuario)  
    }  
      
    const { data, error } \= await query.order('fecha\_generacion', { ascending: false })  
      
    if (error) throw new Error(\`Error al obtener alertas: ${error.message}\`)  
    return ReporteAlertaSchema.array().parse(data || \[\])  
  }

  async obtenerAlertasPorTipo(tipo: string): Promise\<ReporteAlerta\[\]\> {  
    const { data, error } \= await supabase  
      .from('reportes\_alertas')  
      .select('\*')  
      .eq('tipo\_alerta', tipo)  
      .eq('estado', 'pendiente')  
      
    if (error) throw new Error(\`Error al obtener alertas por tipo: ${error.message}\`)  
    return ReporteAlertaSchema.array().parse(data || \[\])  
  }

  async marcarAlertaAtendida(id\_alerta: string, id\_usuario: string): Promise\<ReporteAlerta\> {  
    const { data: result, error } \= await supabase  
      .from('reportes\_alertas')  
      .update({  
        estado: 'atendida',  
        fecha\_atendida: new Date().toISOString(),  
        atendida\_por: id\_usuario  
      })  
      .eq('id\_alerta', id\_alerta)  
      .select()  
      .single()  
      
    if (error) throw new Error(\`Error al marcar alerta como atendida: ${error.message}\`)  
    return ReporteAlertaSchema.parse(result)  
  }

  async generarAlerta(data: Omit\<ReporteAlerta, 'id\_alerta' | 'fecha\_generacion' | 'fecha\_atendida' | 'estado'\>): Promise\<ReporteAlerta\> {  
    const { data: result, error } \= await supabase  
      .from('reportes\_alertas')  
      .insert({  
        tipo\_alerta: data.tipo\_alerta,  
        titulo: data.titulo,  
        descripcion: data.descripcion,  
        nivel: data.nivel || 'info',  
        id\_usuario\_destino: data.id\_usuario\_destino,  
        id\_referencia: data.id\_referencia  
      })  
      .select()  
      .single()  
      
    if (error) throw new Error(\`Error al generar alerta: ${error.message}\`)  
    return ReporteAlertaSchema.parse(result)  
  }

  // \=== Exportación \===

  async exportarReporte(id\_reporte\_generado: string, formato: 'PDF' | 'EXCEL' | 'CSV'): Promise\<Buffer | string\> {  
    // Obtener el reporte generado  
    const reporte \= await this.obtenerReporteGeneradoPorId(id\_reporte\_generado)  
    if (\!reporte) throw new Error('Reporte no encontrado')  
      
    // Aquí iría la lógica de exportación según el formato  
    // Por ahora simulamos la exportación  
    return \`Reporte exportado en formato ${formato}\`  
  }  
}  
Paso 4 — Servicio (NUEVO: reporteService.ts)  
src/services/animalService.ts  
typescript  
import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository'  
import type { IAnimalRepository } from '@/repositories/IAnimalRepository'  
import type { Animal, CreateAnimal } from '@/types/domain/animal.schema'

// 👇 Aquí swappeas la implementación el próximo trimestre  
const repo: IAnimalRepository \= new SupabaseAnimalRepository()

export const animalService \= {  
  listar: () \=\> repo.getAll(),  
  obtener: (id: string) \=\> repo.getById(id),  
  crear: (data: CreateAnimal) \=\> repo.create(data),  
  actualizar: (id: string, data: Partial\<CreateAnimal\>) \=\> repo.update(id, data),  
  eliminar: (id: string) \=\> repo.delete(id),  
  buscar: (filters: Record\<string, any\>) \=\> repo.search(filters),  
}  
src/services/insumoService.ts  
typescript  
import { SupabaseInsumoRepository } from '@/repositories/supabase/InsumoRepository'  
import type { IInsumoRepository } from '@/repositories/IInsumoRepository'  
import type { Insumo, CreateInsumo } from '@/types/domain/insumo.schema'

const repo: IInsumoRepository \= new SupabaseInsumoRepository()

export const insumoService \= {  
  listar: () \=\> repo.getAll(),  
  obtener: (id: string) \=\> repo.getById(id),  
  crear: (data: CreateInsumo) \=\> repo.create(data),  
  actualizar: (id: string, data: Partial\<CreateInsumo\>) \=\> repo.update(id, data),  
  eliminar: (id: string) \=\> repo.delete(id),  
  agregarStock: (id: string, cantidad: number) \=\> repo.agregarStock(id, cantidad),  
  descontarStock: (id: string, cantidad: number, motivo: string) \=\> repo.descontarStock(id, cantidad, motivo),  
  obtenerPorCategoria: (categoria: string) \=\> repo.getByCategoria(categoria),  
  obtenerStockBajo: () \=\> repo.getStockBajo(),  
}  
src/services/produccionService.ts  
typescript  
import { SupabaseProduccionRepository } from '@/repositories/supabase/ProduccionRepository'  
import type { IProduccionRepository } from '@/repositories/IProduccionRepository'  
import type { Produccion, CreateProduccion } from '@/types/domain/produccion.schema'

const repo: IProduccionRepository \= new SupabaseProduccionRepository()

export const produccionService \= {  
  listar: () \=\> repo.getAll(),  
  obtener: (id: string) \=\> repo.getById(id),  
  crear: (data: CreateProduccion) \=\> repo.create(data),  
  actualizar: (id: string, data: Partial\<CreateProduccion\>) \=\> repo.update(id, data),  
  eliminar: (id: string) \=\> repo.delete(id),  
  obtenerPorAnimal: (id\_animal: string) \=\> repo.getByAnimal(id\_animal),  
  obtenerPorLote: (id\_lote: string) \=\> repo.getByLote(id\_lote),  
  obtenerPorFecha: (fecha: string) \=\> repo.getByFecha(fecha),  
  obtenerPorRangoFechas: (fecha\_inicio: string, fecha\_fin: string) \=\> repo.getByRangoFechas(fecha\_inicio, fecha\_fin),  
}  
src/services/reporteService.ts ← NUEVO  
typescript  
import { SupabaseReporteRepository } from '@/repositories/supabase/ReporteRepository'  
import type { IReporteRepository } from '@/repositories/IReporteRepository'  
import type {  
  FiltroReporteInsumos,  
  FiltroReporteProduccion,  
  FiltroReporteGeneral,  
  ReportePlantilla  
} from '@/types/domain/reporte.schema'

// 👇 Aquí swappeas la implementación el próximo trimestre  
const repo: IReporteRepository \= new SupabaseReporteRepository()

export const reporteService \= {  
  // Generación de reportes  
  generarReporteInsumos: (filtros: FiltroReporteInsumos) \=\> repo.generarReporteInsumos(filtros),  
  generarReporteProduccion: (filtros: FiltroReporteProduccion) \=\> repo.generarReporteProduccion(filtros),  
  generarReporteGeneral: (filtros: FiltroReporteGeneral) \=\> repo.generarReporteGeneral(filtros),  
    
  // Plantillas  
  guardarPlantilla: (data: Omit\<ReportePlantilla, 'id\_plantilla' | 'fecha\_creacion'\>) \=\> repo.guardarPlantilla(data),  
  obtenerPlantillas: (id\_usuario: string) \=\> repo.obtenerPlantillas(id\_usuario),  
  obtenerPlantillaPorId: (id\_plantilla: string) \=\> repo.obtenerPlantillaPorId(id\_plantilla),  
  actualizarPlantilla: (id\_plantilla: string, data: Partial\<ReportePlantilla\>) \=\> repo.actualizarPlantilla(id\_plantilla, data),  
  eliminarPlantilla: (id\_plantilla: string) \=\> repo.eliminarPlantilla(id\_plantilla),  
    
  // Reportes generados (historial)  
  guardarReporteGenerado: (data: any) \=\> repo.guardarReporteGenerado(data),  
  obtenerReportesGenerados: (id\_usuario: string) \=\> repo.obtenerReportesGenerados(id\_usuario),  
  obtenerReporteGeneradoPorId: (id\_reporte: string) \=\> repo.obtenerReporteGeneradoPorId(id\_reporte),  
    
  // Alertas  
  obtenerAlertasPendientes: (id\_usuario?: string) \=\> repo.obtenerAlertasPendientes(id\_usuario),  
  obtenerAlertasPorTipo: (tipo: string) \=\> repo.obtenerAlertasPorTipo(tipo),  
  marcarAlertaAtendida: (id\_alerta: string, id\_usuario: string) \=\> repo.marcarAlertaAtendida(id\_alerta, id\_usuario),  
  generarAlerta: (data: any) \=\> repo.generarAlerta(data),  
    
  // Exportación  
  exportarReporte: (id\_reporte\_generado: string, formato: 'PDF' | 'EXCEL' | 'CSV') \=\> repo.exportarReporte(id\_reporte\_generado, formato),  
}  
Paso 5 — Hook (NUEVO: useReportes.ts)  
src/hooks/useAnimals.ts  
typescript  
import { useState, useEffect } from 'react'  
import { animalService } from '@/services/animalService'  
import type { Animal } from '@/types/domain/animal.schema'

export function useAnimals() {  
  const \[animales, setAnimales\] \= useState\<Animal\[\]\>(\[\])  
  const \[loading, setLoading\] \= useState(true)  
  const \[error, setError\] \= useState\<string | null\>(null)

  useEffect(() \=\> {  
    animalService.listar()  
      .then(setAnimales)  
      .catch(e \=\> setError(e.message))  
      .finally(() \=\> setLoading(false))  
  }, \[\])

  return { animales, loading, error }  
}  
src/hooks/useInsumos.ts  
typescript  
import { useState, useEffect } from 'react'  
import { insumoService } from '@/services/insumoService'  
import type { Insumo } from '@/types/domain/insumo.schema'

export function useInsumos() {  
  const \[insumos, setInsumos\] \= useState\<Insumo\[\]\>(\[\])  
  const \[loading, setLoading\] \= useState(true)  
  const \[error, setError\] \= useState\<string | null\>(null)

  useEffect(() \=\> {  
    insumoService.listar()  
      .then(setInsumos)  
      .catch(e \=\> setError(e.message))  
      .finally(() \=\> setLoading(false))  
  }, \[\])

  return { insumos, loading, error }  
}  
src/hooks/useReportes.ts ← NUEVO  
typescript  
import { useState, useCallback } from 'react'  
import { reporteService } from '@/services/reporteService'  
import type {  
  ReporteInsumosResponse,  
  ReporteProduccionResponse,  
  ReporteGeneralResponse,  
  FiltroReporteInsumos,  
  FiltroReporteProduccion,  
  FiltroReporteGeneral,  
  ReporteAlerta  
} from '@/types/domain/reporte.schema'

export function useReportes() {  
  const \[loading, setLoading\] \= useState(false)  
  const \[error, setError\] \= useState\<string | null\>(null)  
  const \[reporteInsumos, setReporteInsumos\] \= useState\<ReporteInsumosResponse | null\>(null)  
  const \[reporteProduccion, setReporteProduccion\] \= useState\<ReporteProduccionResponse | null\>(null)  
  const \[reporteGeneral, setReporteGeneral\] \= useState\<ReporteGeneralResponse | null\>(null)  
  const \[alertas, setAlertas\] \= useState\<ReporteAlerta\[\]\>(\[\])  
  const \[exportando, setExportando\] \= useState(false)

  const generarReporteInsumos \= useCallback(async (filtros: FiltroReporteInsumos) \=\> {  
    setLoading(true)  
    setError(null)  
    try {  
      const data \= await reporteService.generarReporteInsumos(filtros)  
      setReporteInsumos(data)  
      return data  
    } catch (e: any) {  
      setError(e.message)  
      throw e  
    } finally {  
      setLoading(false)  
    }  
  }, \[\])

  const generarReporteProduccion \= useCallback(async (filtros: FiltroReporteProduccion) \=\> {  
    setLoading(true)  
    setError(null)  
    try {  
      const data \= await reporteService.generarReporteProduccion(filtros)  
      setReporteProduccion(data)  
      return data  
    } catch (e: any) {  
      setError(e.message)  
      throw e  
    } finally {  
      setLoading(false)  
    }  
  }, \[\])

  const generarReporteGeneral \= useCallback(async (filtros: FiltroReporteGeneral) \=\> {  
    setLoading(true)  
    setError(null)  
    try {  
      const data \= await reporteService.generarReporteGeneral(filtros)  
      setReporteGeneral(data)  
      return data  
    } catch (e: any) {  
      setError(e.message)  
      throw e  
    } finally {  
      setLoading(false)  
    }  
  }, \[\])

  const obtenerAlertas \= useCallback(async (id\_usuario?: string) \=\> {  
    setLoading(true)  
    setError(null)  
    try {  
      const data \= await reporteService.obtenerAlertasPendientes(id\_usuario)  
      setAlertas(data)  
      return data  
    } catch (e: any) {  
      setError(e.message)  
      throw e  
    } finally {  
      setLoading(false)  
    }  
  }, \[\])

  const exportarReporte \= useCallback(async (id\_reporte: string, formato: 'PDF' | 'EXCEL' | 'CSV') \=\> {  
    setExportando(true)  
    setError(null)  
    try {  
      const data \= await reporteService.exportarReporte(id\_reporte, formato)  
      return data  
    } catch (e: any) {  
      setError(e.message)  
      throw e  
    } finally {  
      setExportando(false)  
    }  
  }, \[\])

  const marcarAlerta \= useCallback(async (id\_alerta: string, id\_usuario: string) \=\> {  
    try {  
      const data \= await reporteService.marcarAlertaAtendida(id\_alerta, id\_usuario)  
      setAlertas(prev \=\> prev.filter(a \=\> a.id\_alerta \!== id\_alerta))  
      return data  
    } catch (e: any) {  
      setError(e.message)  
      throw e  
    }  
  }, \[\])

  return {  
    loading,  
    error,  
    exportando,  
    reporteInsumos,  
    reporteProduccion,  
    reporteGeneral,  
    alertas,  
    generarReporteInsumos,  
    generarReporteProduccion,  
    generarReporteGeneral,  
    obtenerAlertas,  
    exportarReporte,  
    marcarAlerta  
  }  
}  
Paso 6 — Componente (NUEVO: ReporteInsumos.tsx)  
src/components/AnimalList.tsx  
tsx  
import { useAnimals } from '@/hooks/useAnimals'

export default function AnimalList() {  
  const { animales, loading, error } \= useAnimals()

  if (loading) return \<p\>Cargando…\</p\>  
  if (error) return \<p className="text-red-500"\>{error}\</p\>

  return (  
    \<ul\>  
      {animales.map(a \=\> (  
        \<li key={a.id}\>  
          {a.identificador} — {a.especie} ({a.raza})  
        \</li\>  
      ))}  
    \</ul\>  
  )  
}  
src/components/reportes/ReporteInsumos.tsx ← NUEVO  
tsx  
'use client'

import { useState } from 'react'  
import { useReportes } from '@/hooks/useReportes'

export default function ReporteInsumos() {  
  const \[filtros, setFiltros\] \= useState({  
    fecha\_inicio: '',  
    fecha\_fin: '',  
    categoria: '',  
    estado: ''  
  })  
  const { loading, reporteInsumos, generarReporteInsumos, exportarReporte } \= useReportes()

  const handleGenerar \= async () \=\> {  
    await generarReporteInsumos({  
      fecha\_inicio: filtros.fecha\_inicio || undefined,  
      fecha\_fin: filtros.fecha\_fin || undefined,  
      categoria: filtros.categoria as any || undefined,  
      estado: filtros.estado as any || undefined  
    })  
  }

  const handleExportar \= async (formato: 'PDF' | 'EXCEL' | 'CSV') \=\> {  
    if (\!reporteInsumos) return  
    // Aquí se obtendría el id del reporte generado  
    const result \= await exportarReporte('reporte-id', formato)  
    // Manejar descarga  
  }

  if (loading) return \<p\>Cargando reporte…\</p\>

  return (  
    \<div className="p-4"\>  
      \<div className="mb-4 grid grid-cols-4 gap-4"\>  
        \<input  
          type="date"  
          value={filtros.fecha\_inicio}  
          onChange={e \=\> setFiltros({ ...filtros, fecha\_inicio: e.target.value })}  
          className="border p-2 rounded"  
          placeholder="Fecha inicio"  
        /\>  
        \<input  
          type="date"  
          value={filtros.fecha\_fin}  
          onChange={e \=\> setFiltros({ ...filtros, fecha\_fin: e.target.value })}  
          className="border p-2 rounded"  
          placeholder="Fecha fin"  
        /\>  
        \<select  
          value={filtros.categoria}  
          onChange={e \=\> setFiltros({ ...filtros, categoria: e.target.value })}  
          className="border p-2 rounded"  
        \>  
          \<option value=""\>Todas las categorías\</option\>  
          \<option value="alimento"\>Alimento\</option\>  
          \<option value="medicamento"\>Medicamento\</option\>  
          \<option value="otro"\>Otro\</option\>  
        \</select\>  
        \<button  
          onClick={handleGenerar}  
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"  
        \>  
          Generar Reporte  
        \</button\>  
      \</div\>

      {reporteInsumos && (  
        \<\>  
          \<table className="w-full border-collapse"\>  
            \<thead\>  
              \<tr className="bg-gray-100"\>  
                \<th className="border p-2 text-left"\>Nombre\</th\>  
                \<th className="border p-2 text-left"\>Categoría\</th\>  
                \<th className="border p-2 text-right"\>Stock\</th\>  
                \<th className="border p-2 text-left"\>Estado\</th\>  
              \</tr\>  
            \</thead\>  
            \<tbody\>  
              {reporteInsumos.insumos.map(insumo \=\> (  
                \<tr key={insumo.id}\>  
                  \<td className="border p-2"\>{insumo.nombre}\</td\>  
                  \<td className="border p-2"\>{insumo.categoria}\</td\>  
                  \<td className="border p-2 text-right"\>{insumo.stock\_actual}\</td\>  
                  \<td className="border p-2"\>  
                    \<span className={\`px-2 py-1 rounded text-xs ${  
                      insumo.estado \=== 'critico' ? 'bg-red-100 text-red-700' :  
                      insumo.estado \=== 'bajo' ? 'bg-yellow-100 text-yellow-700' :  
                      'bg-green-100 text-green-700'  
                    }\`}\>  
                      {insumo.estado}  
                    \</span\>  
                  \</td\>  
                \</tr\>  
              ))}  
            \</tbody\>  
          \</table\>  
          \<div className="mt-4 flex gap-2"\>  
            \<button  
              onClick={() \=\> handleExportar('PDF')}  
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"  
            \>  
              Exportar PDF  
            \</button\>  
            \<button  
              onClick={() \=\> handleExportar('EXCEL')}  
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"  
            \>  
              Exportar Excel  
            \</button\>  
            \<button  
              onClick={() \=\> handleExportar('CSV')}  
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"  
            \>  
              Exportar CSV  
            \</button\>  
          \</div\>  
        \</\>  
      )}  
    \</div\>  
  )  
}  
src/components/reportes/ReporteGeneral.tsx ← NUEVO  
tsx  
'use client'

import { useState } from 'react'  
import { useReportes } from '@/hooks/useReportes'

export default function ReporteGeneral() {  
  const \[filtros, setFiltros\] \= useState({  
    fecha\_inicio: '',  
    fecha\_fin: '',  
    modulos: \[\] as string\[\]  
  })  
  const { loading, reporteGeneral, generarReporteGeneral } \= useReportes()

  const handleGenerar \= async () \=\> {  
    await generarReporteGeneral({  
      fecha\_inicio: filtros.fecha\_inicio || undefined,  
      fecha\_fin: filtros.fecha\_fin || undefined,  
      modulos: filtros.modulos as any || undefined  
    })  
  }

  if (loading) return \<p\>Cargando reporte general…\</p\>

  return (  
    \<div className="p-4"\>  
      \<div className="mb-4 flex gap-4"\>  
        \<input  
          type="date"  
          value={filtros.fecha\_inicio}  
          onChange={e \=\> setFiltros({ ...filtros, fecha\_inicio: e.target.value })}  
          className="border p-2 rounded"  
          placeholder="Fecha inicio"  
        /\>  
        \<input  
          type="date"  
          value={filtros.fecha\_fin}  
          onChange={e \=\> setFiltros({ ...filtros, fecha\_fin: e.target.value })}  
          className="border p-2 rounded"  
          placeholder="Fecha fin"  
        /\>  
        \<button  
          onClick={handleGenerar}  
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"  
        \>  
          Generar Reporte General  
        \</button\>  
      \</div\>

      {reporteGeneral && (  
        \<div className="grid grid-cols-1 md:grid-cols-2 gap-4"\>  
          \<div className="border rounded p-4"\>  
            \<h3 className="font-bold mb-2"\>Resumen Animales\</h3\>  
            \<p\>Total: {reporteGeneral.resumen\_animales.total}\</p\>  
            \<div className="mt-2"\>  
              {Object.entries(reporteGeneral.resumen\_animales.por\_especie).map((\[especie, count\]) \=\> (  
                \<p key={especie}\>{especie}: {count}\</p\>  
              ))}  
            \</div\>  
          \</div\>  
          \<div className="border rounded p-4"\>  
            \<h3 className="font-bold mb-2"\>Resumen Insumos\</h3\>  
            \<p\>Total: {reporteGeneral.resumen\_insumos.total}\</p\>  
            \<p className="text-red-600"\>Críticos: {reporteGeneral.resumen\_insumos.criticos}\</p\>  
          \</div\>  
          \<div className="border rounded p-4"\>  
            \<h3 className="font-bold mb-2"\>Producción del Mes\</h3\>  
            \<p\>Leche: {reporteGeneral.resumen\_produccion.leche\_mes} L\</p\>  
            \<p\>Huevos: {reporteGeneral.resumen\_produccion.huevos\_mes} und\</p\>  
          \</div\>  
          \<div className="border rounded p-4"\>  
            \<h3 className="font-bold mb-2"\>Vacunaciones\</h3\>  
            \<p className="text-yellow-600"\>  
              Pendientes (7 días): {reporteGeneral.vacunaciones\_pendientes}  
            \</p\>  
          \</div\>  
        \</div\>  
      )}  
    \</div\>  
  )  
}  
Paso 7 — Página (NUEVO: reportes/page.tsx)  
src/app/animales/page.tsx  
tsx  
import AnimalList from '@/components/AnimalList'

export const metadata \= { title: 'Animales | Granja App' }

export default function AnimalesPage() {  
  return (  
    \<main className="p-8"\>  
      \<h1 className="text-2xl font-medium mb-6"\>Listado de animales\</h1\>  
      \<AnimalList /\>  
    \</main\>  
  )  
}  
src/app/reportes/page.tsx ← NUEVO  
tsx  
import Link from 'next/link'

export const metadata \= { title: 'Reportes | Granja App' }

export default function ReportesPage() {  
  return (  
    \<main className="p-8"\>  
      \<h1 className="text-2xl font-medium mb-6"\>Módulo de Reportes\</h1\>  
      \<div className="grid grid-cols-1 md:grid-cols-3 gap-4"\>  
        \<Link  
          href="/reportes/insumos"  
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"  
        \>  
          \<h2 className="text-xl font-semibold"\>📊 Reporte de Insumos\</h2\>  
          \<p className="text-gray-600 mt-2"\>Consulta stock, consumos y tendencias\</p\>  
        \</Link\>  
        \<Link  
          href="/reportes/produccion"  
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"  
        \>  
          \<h2 className="text-xl font-semibold"\>🥛 Reporte de Producción\</h2\>  
          \<p className="text-gray-600 mt-2"\>Análisis de leche y huevos\</p\>  
        \</Link\>  
        \<Link  
          href="/reportes/general"  
          className="block p-6 border rounded-lg hover:shadow-lg transition-shadow"  
        \>  
          \<h2 className="text-xl font-semibold"\>📈 Reporte General\</h2\>  
          \<p className="text-gray-600 mt-2"\>Resumen ejecutivo de toda la granja\</p\>  
        \</Link\>  
      \</div\>  
    \</main\>  
  )  
}  
src/app/reportes/insumos/page.tsx ← NUEVO  
tsx  
import ReporteInsumos from '@/components/reportes/ReporteInsumos'

export const metadata \= { title: 'Reporte de Insumos | Granja App' }

export default function ReporteInsumosPage() {  
  return (  
    \<main className="p-8"\>  
      \<h1 className="text-2xl font-medium mb-6"\>Reporte de Inventario de Insumos\</h1\>  
      \<ReporteInsumos /\>  
    \</main\>  
  )  
}  
src/app/reportes/general/page.tsx ← NUEVO  
tsx  
import ReporteGeneral from '@/components/reportes/ReporteGeneral'

export const metadata \= { title: 'Reporte General | Granja App' }

export default function ReporteGeneralPage() {  
  return (  
    \<main className="p-8"\>  
      \<h1 className="text-2xl font-medium mb-6"\>Reporte General del Sistema\</h1\>  
      \<ReporteGeneral /\>  
    \</main\>  
  )  
}  
Paso 8 — Layout raíz de la aplicación (ACTUALIZADO)  
src/app/layout.tsx  
tsx  
import type { Metadata } from 'next'  
import './globals.css'

export const metadata: Metadata \= {  
  title: 'Granja App',  
  description: 'Sistema de gestión integral de granja agropecuaria',  
}

export default function RootLayout({  
  children,  
}: {  
  children: React.ReactNode  
}) {  
  return (  
    \<html lang="es"\>  
      \<body\>  
        \<nav className="px-8 py-4 border-b text-sm text-gray-500 flex gap-6"\>  
          \<a href="/animales"\>Animales\</a\>  
          \<a href="/insumos"\>Insumos\</a\>  
          \<a href="/produccion"\>Producción\</a\>  
          \<a href="/reportes" className="font-semibold text-blue-600"\>Reportes\</a\>  
        \</nav\>  
        {children}  
      \</body\>  
    \</html\>  
  )  
}  
Flujo completo de una petición de reporte  
text  
GET /reportes/insumos  
  → Next.js App Router  
  → layout.tsx (nav \+ shell)  
  → page.tsx (título \+ contenedor)  
  → ReporteInsumos.tsx (componente)  
  → useReportes.ts (hook)  
  → reporteService.ts (orquestador)  
  → IReporteRepository (contrato)  
  → SupabaseReporteRepository (implementación)  
  → Supabase DB (vw\_reporte\_insumos)  
Swap para el próximo trimestre  
Solo modificas una línea en cada servicio:

typescript  
// Trimestre actual — Supabase  
const repo: IReporteRepository \= new SupabaseReporteRepository()

// Próximo trimestre — API REST  
const repo: IReporteRepository \= new RestReporteRepository('https://api.ejemplo.com/reportes')  
Zod sigue validando en ambos casos porque vive en el dominio (reporte.schema.ts), no en la implementación. El componente, el hook, el servicio y la página no se tocan.

Resumen de responsabilidades  
Archivo	Responsabilidad  
animal.schema.ts	Tipos del dominio \+ validación Zod  
insumo.schema.ts	Tipos del dominio \+ validación Zod  
produccion.schema.ts	Tipos del dominio \+ validación Zod  
reporte.schema.ts	Tipos del dominio \+ validación Zod (NUEVO)  
IAnimalRepository.ts	Contrato (métodos que toda implementación debe tener)  
IInsumoRepository.ts	Contrato (métodos que toda implementación debe tener)  
IProduccionRepository.ts	Contrato (métodos que toda implementación debe tener)  
IReporteRepository.ts	Contrato (métodos que toda implementación debe tener) (NUEVO)  
SupabaseAnimalRepository.ts	Implementación concreta con Supabase  
SupabaseInsumoRepository.ts	Implementación concreta con Supabase  
SupabaseProduccionRepository.ts	Implementación concreta con Supabase  
SupabaseReporteRepository.ts	Implementación concreta con Supabase (NUEVO)  
animalService.ts	Orquesta el repositorio; único punto de swap  
insumoService.ts	Orquesta el repositorio; único punto de swap  
produccionService.ts	Orquesta el repositorio; único punto de swap  
reporteService.ts	Orquesta el repositorio; único punto de swap (NUEVO)  
useAnimals.ts	Expone estado/datos al componente  
useInsumos.ts	Expone estado/datos al componente  
useProduccion.ts	Expone estado/datos al componente  
useReportes.ts	Expone estado/datos al componente (NUEVO)  
AnimalList.tsx	Renderiza la UI  
ReporteInsumos.tsx	Renderiza la UI (NUEVO)  
ReporteGeneral.tsx	Renderiza la UI (NUEVO)  
page.tsx (animales)	Ruta /animales en Next.js App Router  
page.tsx (reportes)	Ruta /reportes en Next.js App Router (NUEVO)  
layout.tsx	Shell global de la aplicación  
Fin del documento