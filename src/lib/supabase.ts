import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Clientes de Supabase. Usa las API keys nuevas (sb_publishable_... / sb_secret_...),
 * no las legacy (anon/service_role).
 *
 * Variables de entorno esperadas (configurarlas en Vercel y en .env.local):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * - SUPABASE_SECRET_KEY (solo servidor; nunca debe llevar el prefijo NEXT_PUBLIC_)
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en las variables de entorno."
  );
}

/** Cliente público para el navegador (publishable key, sujeto a RLS). */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabasePublishableKey);

/**
 * Cliente con privilegios de administrador (secret key, se salta RLS).
 * Solo debe usarse en Server Components, Route Handlers o Server Actions.
 * Es una función (no una constante) para no instanciarlo por accidente si este
 * módulo llegara a importarse desde código de cliente.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() no debe llamarse en el navegador: expondría la secret key.");
  }

  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;
  if (!supabaseSecretKey) {
    throw new Error("Falta SUPABASE_SECRET_KEY en las variables de entorno del servidor.");
  }

  return createClient(supabaseUrl!, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
