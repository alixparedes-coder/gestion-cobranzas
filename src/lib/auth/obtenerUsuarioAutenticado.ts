import { crearClienteSupabaseServidor } from "@/lib/supabaseServidor";

/** Usuario logueado según la sesión de la petición actual, o `null` si no hay ninguna. Para usar en Route Handlers bajo /api. */
export async function obtenerUsuarioAutenticado() {
  const supabase = await crearClienteSupabaseServidor();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
