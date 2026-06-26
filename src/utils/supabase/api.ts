import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createClient } from './server';

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() ?? null;
}

/** Cliente Supabase para rutas API: cookies (navegador) o Bearer token (Postman). */
export async function createClientFromRequest(request: Request) {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    return createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      }
    );
  }

  return createClient();
}
