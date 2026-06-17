# Patrón Repositorio con Supabase en Next.js \+ TypeScript

Arquitectura genérica que permite intercambiar Supabase por una API REST sin tocar la lógica de negocio.

---

## Estructura de carpetas

src/

├── app/

│   ├── layout.tsx                            ← Paso 8 (raíz)

│   ├── globals.css

│   └── animales/

│       └── page.tsx                          ← Paso 7 (página)

├── components/

│   └── AnimalList.tsx                        ← Paso 6

├── hooks/

│   └── useAnimals.ts                         ← Paso 5

├── services/

│   └── animalService.ts                      ← Paso 4

├── repositories/

│   ├── IAnimalRepository.ts                  ← Paso 2

│   └── supabase/

│       └── AnimalRepository.ts               ← Paso 3

└── types/

    └── domain/

        └── animal.schema.ts                  ← Paso 1

---

## Paso 1 — Dominio \+ Zod

**`src/types/domain/animal.schema.ts`**

import { z } from 'zod'

export const AnimalSchema \= z.object({

  id:         z.string().uuid(),

  nombre:     z.string().min(1).max(100),

  especie:    z.string().min(1),

  edad\_meses: z.number().int().nonneg(),

  activo:     z.boolean().default(true),

})

export const CreateAnimalSchema \= AnimalSchema.omit({ id: true })

export type Animal       \= z.infer\<typeof AnimalSchema\>

export type CreateAnimal \= z.infer\<typeof CreateAnimalSchema\>

---

## Paso 2 — Interfaz (el contrato inmutable)

**`src/repositories/IAnimalRepository.ts`**

import type { Animal, CreateAnimal } from '@/types/domain/animal.schema'

export interface IAnimalRepository {

  getAll():                   Promise\<Animal\[\]\>

  getById(id: string):        Promise\<Animal | null\>

  create(data: CreateAnimal): Promise\<Animal\>

  delete(id: string):         Promise\<void\>

}

---

## Paso 3 — Implementación Supabase

**`src/repositories/supabase/AnimalRepository.ts`**

import { createClient } from '@supabase/supabase-js'

import { AnimalSchema, CreateAnimalSchema } from '@/types/domain/animal.schema'

import type { IAnimalRepository }            from '../IAnimalRepository'

import type { Animal, CreateAnimal }         from '@/types/domain/animal.schema'

const supabase \= createClient(

  process.env.NEXT\_PUBLIC\_SUPABASE\_URL\!,

  process.env.NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY\!

)

export class SupabaseAnimalRepository implements IAnimalRepository {

  async getAll(): Promise\<Animal\[\]\> {

    const { data, error } \= await supabase.from('animales').select('\*')

    if (error) throw new Error(error.message)

    return AnimalSchema.array().parse(data)          // ← Zod valida la respuesta

  }

  async getById(id: string): Promise\<Animal | null\> {

    const { data, error } \= await supabase

      .from('animales').select('\*').eq('id', id).single()

    if (error) return null

    return AnimalSchema.parse(data)

  }

  async create(input: CreateAnimal): Promise\<Animal\> {

    const validated \= CreateAnimalSchema.parse(input) // ← Zod valida el input

    const { data, error } \= await supabase

      .from('animales').insert(validated).select().single()

    if (error) throw new Error(error.message)

    return AnimalSchema.parse(data)

  }

  async delete(id: string): Promise\<void\> {

    const { error } \= await supabase.from('animales').delete().eq('id', id)

    if (error) throw new Error(error.message)

  }

}

**Próximo trimestre:** solo creas `RestAnimalRepository implements IAnimalRepository` con `fetch()` — el resto del código no cambia.

---

## Paso 4 — Servicio

**`src/services/animalService.ts`**

import { SupabaseAnimalRepository } from '@/repositories/supabase/AnimalRepository'

import type { IAnimalRepository }    from '@/repositories/IAnimalRepository'

import type { CreateAnimal }         from '@/types/domain/animal.schema'

// 👇 Aquí swappeas la implementación el próximo trimestre

const repo: IAnimalRepository \= new SupabaseAnimalRepository()

export const animalService \= {

  listar:   ()                    \=\> repo.getAll(),

  obtener:  (id: string)          \=\> repo.getById(id),

  crear:    (data: CreateAnimal)  \=\> repo.create(data),

  eliminar: (id: string)          \=\> repo.delete(id),

}

---

## Paso 5 — Hook

**`src/hooks/useAnimals.ts`**

import { useState, useEffect } from 'react'

import { animalService }       from '@/services/animalService'

import type { Animal }         from '@/types/domain/animal.schema'

export function useAnimals() {

  const \[animales, setAnimales\] \= useState\<Animal\[\]\>(\[\])

  const \[loading,  setLoading\]  \= useState(true)

  const \[error,    setError\]    \= useState\<string | null\>(null)

  useEffect(() \=\> {

    animalService.listar()

      .then(setAnimales)

      .catch(e \=\> setError(e.message))

      .finally(() \=\> setLoading(false))

  }, \[\])

  return { animales, loading, error }

}

---

## Paso 6 — Componente

**`src/components/AnimalList.tsx`**

import { useAnimals } from '@/hooks/useAnimals'

export default function AnimalList() {

  const { animales, loading, error } \= useAnimals()

  if (loading) return \<p\>Cargando…\</p\>

  if (error)   return \<p className="text-red-500"\>{error}\</p\>

  return (

    \<ul\>

      {animales.map(a \=\> (

        \<li key={a.id}\>

          {a.nombre} — {a.especie} ({a.edad\_meses} meses)

        \</li\>

      ))}

    \</ul\>

  )

}

---

## Paso 7 — Página

**`src/app/animales/page.tsx`**

import AnimalList from '@/components/AnimalList'

export const metadata \= { title: 'Animales | ADSO App' }

export default function AnimalesPage() {

  return (

    \<main className="p-8"\>

      \<h1 className="text-2xl font-medium mb-6"\>Listado de animales\</h1\>

      \<AnimalList /\>

    \</main\>

  )

}

---

## Paso 8 — Layout raíz de la aplicación

**`src/app/layout.tsx`**

import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata \= {

  title:       'ADSO App',

  description: 'Ejemplo patrón repositorio',

}

export default function RootLayout({

  children,

}: {

  children: React.ReactNode

}) {

  return (

    \<html lang="es"\>

      \<body\>

        \<nav className="px-8 py-4 border-b text-sm text-gray-500"\>

          \<a href="/animales"\>Animales\</a\>

        \</nav\>

        {children}

      \</body\>

    \</html\>

  )

}

---

## Flujo completo de una petición

GET /animales

  → Next.js App Router

  → layout.tsx       (nav \+ shell)

  → page.tsx         (título \+ contenedor)

  → AnimalList.tsx   (componente)

  → useAnimals.ts    (hook)

  → animalService.ts (orquestador)

  → IAnimalRepository (contrato)

  → SupabaseAnimalRepository (implementación)

  → Supabase DB

---

## Swap para el próximo trimestre

Solo modificas **una línea** en `animalService.ts`:

// Trimestre actual — Supabase

const repo: IAnimalRepository \= new SupabaseAnimalRepository()

// Próximo trimestre — API REST

const repo: IAnimalRepository \= new RestAnimalRepository('https://api.ejemplo.com')

Zod sigue validando en ambos casos porque vive en el dominio (`animal.schema.ts`), no en la implementación. El componente, el hook, el servicio y la página **no se tocan**.

---

## Resumen de responsabilidades

| Archivo | Responsabilidad |
| :---- | :---- |
| `animal.schema.ts` | Tipos del dominio \+ validación Zod |
| `IAnimalRepository.ts` | Contrato (métodos que toda implementación debe tener) |
| `SupabaseAnimalRepository.ts` | Implementación concreta con Supabase |
| `animalService.ts` | Orquesta el repositorio; único punto de swap |
| `useAnimals.ts` | Expone estado/datos al componente |
| `AnimalList.tsx` | Renderiza la UI |
| `page.tsx` | Ruta `/animales` en Next.js App Router |
| `layout.tsx` | Shell global de la aplicación |

