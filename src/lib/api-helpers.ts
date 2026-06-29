import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

export type ApiResponse<T = any> = {
  ok: boolean;
  data?: T;
  meta?: Record<string, any>;
  error?: {
    message: string;
    code?: string;
  };
};

export function apiSuccess<T>(data: T, meta?: Record<string, any>, status = 200) {
  return NextResponse.json(
    { ok: true, data, meta },
    { status }
  );
}

export function apiError(message: string, status = 400, code?: string) {
  return NextResponse.json(
    { ok: false, error: { message, code } },
    { status }
  );
}

export async function getAuthUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new Error('No autorizado');
  }
  return { user, supabase };
}

export async function parseBody<T>(request: Request, schema?: z.ZodType<T>): Promise<T> {
  try {
    const body = await request.json();
    if (schema) {
      return schema.parse(body);
    }
    return body as T;
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Error de validación: ${(error as any).issues?.map((e: any) => e.message).join(', ') || error.message}`);
    }
    throw new Error('Cuerpo de la petición inválido');
  }
}
