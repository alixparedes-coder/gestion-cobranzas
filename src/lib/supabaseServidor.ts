import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components, Server Actions y Route
 * Handlers: lee/escribe la sesión desde las cookies de la petición. Usar
 * este en vez de `supabase`/`getSupabaseAdmin` de `src/lib/supabase.ts`
 * cuando se necesite saber quién es el usuario logueado.
 */
export async function crearClienteSupabaseServidor() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesParaEstablecer) {
          try {
            cookiesParaEstablecer.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component (solo lectura de cookies);
            // el middleware se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    }
  );
}
